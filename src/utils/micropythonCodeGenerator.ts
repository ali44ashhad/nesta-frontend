/**
 * Wraps generated Python code from Blockly into the main ESP32 structure
 */
export function generateMicroPythonCode(pythonCode: string): string {
  // Clean up placeholder comments
  let cleanedCode = pythonCode.replace(/^# Describe this function\.\.\.\s*\n/gm, "");
  cleanedCode = cleanedCode.replace(/^\s*# Describe this function\.\.\.\s*\n/gm, "");
  
  const lines = cleanedCode.split('\n');
  
  // Separate function definitions from main code
  // Blockly generates functions at top level, so we extract them
  const functionDefinitions: string[] = [];
  const mainCodeLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const defMatch = line.match(/^(\s*)def\s+(\w+)\s*\(/);
    
    // Check if this is a top-level function definition (indent 0-2 spaces)
    if (defMatch) {
      const indent = defMatch[1].length;
      if (indent <= 2) {
        // Extract the entire function
        const functionLines: string[] = [line];
        const functionIndent = indent;
        i++;
        
        // Collect function body until we hit another def at same/less indent or end of file
        // In Python, function body MUST be indented MORE than the def line
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextDefMatch = nextLine.match(/^(\s*)def\s+\w+\s*\(/);
          
          if (nextDefMatch) {
            const nextIndent = nextDefMatch[1].length;
            if (nextIndent <= functionIndent) {
              // Found another function at same/less indent - stop collecting
              break;
            }
          }
          
          // Check if this line is at function indent level or less (end of function)
          const lineIndent = nextLine.match(/^(\s*)/)?.[1].length || 0;
          const lineTrimmed = nextLine.trim();
          
          // Function body must be indented MORE than the def line
          // So if a line is at the same indent or less, it's not part of the function
          if (lineTrimmed) {
            if (lineTrimmed.startsWith('#')) {
              // Comments at function indent level are likely separate
              if (lineIndent <= functionIndent) {
                break;
              }
              // Comments indented more than function are part of function body
              functionLines.push(nextLine);
              i++;
              continue;
            }
            
            // Non-comment line: if indented same or less than function def, it's not part of function
            if (lineIndent <= functionIndent) {
              break;
            }
          } else {
            // Empty line - can be part of function body if previous lines were
            // But if we're at function indent, it might be separating functions
            if (lineIndent <= functionIndent && functionLines.length > 1) {
              // Empty line at function level after function body - likely separator
              break;
            }
            functionLines.push(nextLine);
            i++;
            continue;
          }
          
          // Line is indented more than function def - it's part of function body
          functionLines.push(nextLine);
          i++;
        }
        
        functionDefinitions.push(functionLines.join('\n'));
        continue;
      }
    }
    
    // Not a function definition - add to main code
    mainCodeLines.push(line);
    i++;
  }
  
  // Clean up function definitions - remove placeholder pass statements and normalize indentation
  const cleanedFunctions = functionDefinitions.map(func => {
    const funcLines = func.split('\n');
    
    if (funcLines.length === 0) return '';
    
    // Find the def line and its indentation
    const defLine = funcLines[0];
    const defMatch = defLine.match(/^(\s*)def\s+\w+\s*\(/);
    const defIndent = defMatch ? defMatch[1].length : 0;
    
    // Normalize function body indentation to 4 spaces (Python standard)
    const normalizedFuncLines = funcLines.map((line, idx) => {
      if (idx === 0) {
        // Keep def line as-is (should be at column 0)
        return defLine.trimStart();
      }
      
      if (!line.trim()) {
        // Preserve empty lines
        return line;
      }
      
      // Get original indentation
      const match = line.match(/^(\s*)/);
      const originalIndent = match ? match[1].length : 0;
      
      // Calculate relative indentation from def line
      const relativeIndent = originalIndent - defIndent;
      
      // Function body should be indented 4 spaces from def line
      // If it was already indented, preserve that relative indentation
      const trimmed = line.trimStart();
      const newIndent = '    ' + ' '.repeat(Math.max(0, relativeIndent - 1));
      
      return newIndent + trimmed;
    });
    
    // Remove placeholder lines
    const cleanedFuncLines = normalizedFuncLines.filter((line, idx) => {
      const trimmed = line.trim();
      
      // Remove ALL global declarations - they're placeholders from Blockly
      if (trimmed.startsWith('global ')) {
        return false;
      }
      
      // Remove variable initialization placeholders like "x = None"
      if (trimmed.match(/^\w+\s*=\s*None\s*$/)) {
        return false;
      }
      
      // Skip standalone pass statements (but keep them if they're needed for empty functions)
      if (trimmed === 'pass' && idx > 0) {
        const prevLine = normalizedFuncLines[idx - 1].trim();
        // Keep pass if it's the only statement in function body (after def line)
        if (prevLine.endsWith(':') || prevLine === '') {
          return true;
        }
        return false;
      }
      
      return true;
    });
    
    return cleanedFuncLines.join('\n');
  }).filter(func => {
    // Remove functions that are just placeholders (only def and pass)
    const funcContent = func.split('\n').slice(1).join('\n').trim();
    return funcContent !== 'pass' && funcContent !== '';
  });
  
  // Clean up main code - remove placeholder variable initializations and fix int() wrappers
  const cleanedMainCodeLines = mainCodeLines
    .filter(line => {
      const trimmed = line.trim();
      // Remove variable initialization placeholders like "x = None", "y = None"
      if (trimmed.match(/^\w+\s*=\s*None\s*$/)) {
        return false;
      }
      return true;
    })
    .map(line => {
      // Remove unnecessary int() wrappers in range() calls
      // e.g., "range(int(add(4, 2)))" -> "range(add(4, 2))"
      return line.replace(/range\s*\(\s*int\s*\(([^)]+)\)\s*\)/g, 'range($1)');
    });
  
  // Process main code - find base indentation and normalize
  const nonEmptyMainLines = cleanedMainCodeLines.filter(line => line.trim().length > 0);
  let mainBaseIndent = 0;
  
  if (nonEmptyMainLines.length > 0) {
    const indentLevels = nonEmptyMainLines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    });
    mainBaseIndent = Math.min(...indentLevels);
  }
  
  // Normalize main code indentation for main() function
  const indentedMainCode = cleanedMainCodeLines
    .map(line => {
      if (!line.trim()) {
        return line;
      }
      
      const trimmed = line.trimStart();
      const match = line.match(/^(\s*)/);
      const originalIndent = match ? match[1].length : 0;
      const relativeIndent = originalIndent - mainBaseIndent;
      
      // Add 4 spaces (for main()) plus preserve relative indentation
      const newIndent = '    ' + ' '.repeat(Math.max(0, relativeIndent));
      return newIndent + trimmed;
    })
    .join('\n');
  
  // Build final code structure
  const functionDefsCode = cleanedFunctions.length > 0 
    ? cleanedFunctions.join('\n\n') + '\n\n'
    : '';
  
  const micropythonHeader = `import time

`;
  
  const mainFunction = `def main():
${indentedMainCode}`;
  
  const micropythonFooter = `

# --- Main program loop ---
# Run the main program
if __name__ == "__main__":
    time.sleep(2)  # Wait for 2 seconds before starting
    while True:
        main()
        time.sleep(0.05)  # Small delay at the end of each loop
`;

  return micropythonHeader + functionDefsCode + mainFunction + micropythonFooter;
}