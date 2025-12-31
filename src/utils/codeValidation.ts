/**
 * Validates JavaScript code generated from Blockly
 * Returns error message if invalid, null if valid
 */
export const validateCode = (fullCode: string): string | null => {
  if (!fullCode || typeof fullCode !== 'string') {
    return "Invalid code: Code must be a string.";
  }

  const cleanLines = fullCode
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
  const cleanCode = cleanLines.join("\n");

  // Check 1: Is the code empty?
  if (!cleanCode.trim()) {
    return "Your workspace is empty! Add some blocks to create a program.";
  }

  // Check 2: Look for "None" or "undefined" (common Blockly errors)
  if (/\bNone\b/.test(cleanCode)) {
    return "Incomplete code: You have empty number inputs in your blocks. Please fill all required fields with numbers.";
  }
  if (/\bundefined\b/.test(cleanCode)) {
    return "Incomplete code: Some blocks have undefined values. Please check all block inputs are properly connected.";
  }

  // Check 3: Look for syntax errors in arguments
  // e.g., "moveForward( , )" or "wait( )" with missing values
  if (/\(\s*,/.test(cleanCode)) {
    return "Syntax Error: A function call is missing its first argument. Please check your blocks.";
  }
  if (/,\s*\)/.test(cleanCode)) {
    return "Syntax Error: A function call is missing its last argument. Please check your blocks.";
  }
  if (/,\s*,/.test(cleanCode)) {
    return "Syntax Error: A function call has a missing argument between commas. Please check your blocks.";
  }

  // Check 4: Check for empty conditions "if ()" or "while ()"
  if (/if\s*\(\s*\)/.test(cleanCode)) {
    return "Logic Error: You have an 'if' block with an empty condition. Please add a condition block.";
  }
  if (/while\s*\(\s*\)/.test(cleanCode)) {
    return "Logic Error: You have a 'while' loop with an empty condition. Please add a condition block.";
  }

  // Check 5: Check for unmatched braces
  const openBraces = (cleanCode.match(/{/g) || []).length;
  const closeBraces = (cleanCode.match(/}/g) || []).length;
  if (openBraces > closeBraces) {
    return `Syntax Error: Missing ${openBraces - closeBraces} closing brace(s). Please check your code structure.`;
  }
  if (closeBraces > openBraces) {
    return `Syntax Error: Missing ${closeBraces - openBraces} opening brace(s). Please check your code structure.`;
  }

  // Check 6: Look for common syntax issues
  if (/;\s*;/.test(cleanCode)) {
    return "Syntax Error: Found consecutive semicolons. Please check your code.";
  }

  return null; // Code is valid
};

