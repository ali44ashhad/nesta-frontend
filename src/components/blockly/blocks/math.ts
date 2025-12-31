import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

export const createMathBlocks = () => {
  // Number block
  Blockly.Blocks['math_number'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldNumber(0), "NUM");
      this.setOutput(true, "Number");
      this.setColour('#9dbf51'); // Math category color
      this.setTooltip("A number value.");
      this.setHelpUrl("");
    }
  };

  // Boolean block (true/false)
  Blockly.Blocks['math_boolean'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([["true", "TRUE"], ["false", "FALSE"]]), "BOOL");
      this.setOutput(true, "Boolean");
      this.setColour('#9dbf51'); // Math category color
      this.setTooltip("Returns either true or false.");
      this.setHelpUrl("");
    }
  };

  // Math Property block (e.g., is even, is prime)
  Blockly.Blocks['math_property'] = {
    init: function() {
      this.appendValueInput("NUMBER_TO_CHECK")
          .setCheck("Number");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
              ["is even", "EVEN"],
              ["is odd", "ODD"],
              ["is prime", "PRIME"],
              ["is whole", "WHOLE"],
              ["is positive", "POSITIVE"],
              ["is negative", "NEGATIVE"],
          ]), "PROPERTY");
      this.setInputsInline(true);
      this.setOutput(true, "Boolean");
      this.setColour('#9dbf51'); // Math category color
      this.setTooltip("Checks if a number has a certain property.");
      this.setHelpUrl("");
    }
  };

  // Remainder of block
  Blockly.Blocks['math_modulo'] = {
    init: function() {
      this.appendValueInput("DIVIDEND")
          .setCheck("Number")
          .appendField("remainder of");
      this.appendValueInput("DIVISOR")
          .setCheck("Number")
          .appendField("÷");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour('#9dbf51'); // Math category color
      this.setTooltip("Returns the remainder of dividing two numbers.");
      this.setHelpUrl("");
    }
  };

  // Map value block
  Blockly.Blocks['map_value'] = {
    init: function() {
      this.appendValueInput("VALUE")
          .setCheck("Number")
          .appendField("Map value");
      this.appendValueInput("IN_MIN")
          .setCheck("Number")
          .appendField("In Min");
      this.appendValueInput("IN_MAX")
          .setCheck("Number")
          .appendField("In Max");
      this.appendValueInput("OUT_MIN")
          .setCheck("Number")
          .appendField("Out Min");
      this.appendValueInput("OUT_MAX")
          .setCheck("Number")
          .appendField("Out Max");
      this.setInputsInline(true);
      this.setOutput(true, "Number");
      this.setColour('#9dbf51'); // Math category color
      this.setTooltip("Re-maps a number from one range to another.");
      this.setHelpUrl("");
    }
  };

  // --- Code Generators ---

  javascriptGenerator.forBlock['math_number'] = function(block) {
    const code = String(Number(block.getFieldValue('NUM')));
    return [code, 0];
  };

  javascriptGenerator.forBlock['math_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
    return [code, 0];
  };
  
  javascriptGenerator.forBlock['math_property'] = function(block, generator) {
    const number_to_check = generator.valueToCode(block, 'NUMBER_TO_CHECK', 0) || '0';
    const property = block.getFieldValue('PROPERTY');
    let code;
  
    switch (property) {
      case 'EVEN':
        code = `${number_to_check} % 2 === 0`;
        break;
      case 'ODD':
        code = `${number_to_check} % 2 !== 0`;
        break;
      case 'WHOLE':
        code = `${number_to_check} % 1 === 0`;
        break;
      case 'POSITIVE':
        code = `${number_to_check} > 0`;
        break;
      case 'NEGATIVE':
        code = `${number_to_check} < 0`;
        break;
      case 'PRIME': {
        // A simple primality test function
        const isPrime = `
function(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i = i + 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}`;
        code = `(${isPrime})(${number_to_check})`;
        break;
      }
      default:
        throw new Error('Unknown math property: ' + property);
    }
  
    return [code, 1]; // Order of operations for equality
  };

  javascriptGenerator.forBlock['math_modulo'] = function(block, generator) {
    const dividend = generator.valueToCode(block, 'DIVIDEND', 0) || '0';
    const divisor = generator.valueToCode(block, 'DIVISOR', 0) || '1';
    return [`${dividend} % ${divisor}`, 1];
  };

  javascriptGenerator.forBlock['map_value'] = function(block, generator) {
    const value = generator.valueToCode(block, 'VALUE', 0) || '0';
    const inMin = generator.valueToCode(block, 'IN_MIN', 0) || '0';
    const inMax = generator.valueToCode(block, 'IN_MAX', 0) || '100';
    const outMin = generator.valueToCode(block, 'OUT_MIN', 0) || '0';
    const outMax = generator.valueToCode(block, 'OUT_MAX', 0) || '1023';
    
    // This is a standard map function implementation
    const code = `(${value} - ${inMin}) * (${outMax} - ${outMin}) / (${inMax} - ${inMin}) + ${outMin}`;
    return [code, 0];
  };

  // --- Python Generators ---

  pythonGenerator.forBlock['math_number'] = function(block) {
    const code = String(Number(block.getFieldValue('NUM')));
    return [code, 0];
  };

  pythonGenerator.forBlock['math_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
    return [code, 0];
  };

  pythonGenerator.forBlock['math_property'] = function(block, generator) {
    const number_to_check = generator.valueToCode(block, 'NUMBER_TO_CHECK', 0) || '0';
    const property = block.getFieldValue('PROPERTY');
    let code;

    switch (property) {
      case 'EVEN':
        code = `(${number_to_check} % 2 == 0)`;
        break;
      case 'ODD':
        code = `(${number_to_check} % 2 != 0)`;
        break;
      case 'WHOLE':
        code = `(${number_to_check} % 1 == 0)`;
        break;
      case 'POSITIVE':
        code = `(${number_to_check} > 0)`;
        break;
      case 'NEGATIVE':
        code = `(${number_to_check} < 0)`;
        break;
      case 'PRIME': {
        // Python primality test function
        const isPrime = `(lambda n: False if n <= 1 else (True if n <= 3 else (False if n % 2 == 0 or n % 3 == 0 else all(n % i != 0 and n % (i + 2) != 0 for i in range(5, int(n ** 0.5) + 1, 6))))`;
        code = `${isPrime}(${number_to_check})`;
        break;
      }
      default:
        throw new Error('Unknown math property: ' + property);
    }

    return [code, 0];
  };

  pythonGenerator.forBlock['math_modulo'] = function(block, generator) {
    const dividend = generator.valueToCode(block, 'DIVIDEND', 0) || '0';
    const divisor = generator.valueToCode(block, 'DIVISOR', 0) || '1';
    return [`(${dividend} % ${divisor})`, 0];
  };

  pythonGenerator.forBlock['map_value'] = function(block, generator) {
    const value = generator.valueToCode(block, 'VALUE', 0) || '0';
    const inMin = generator.valueToCode(block, 'IN_MIN', 0) || '0';
    const inMax = generator.valueToCode(block, 'IN_MAX', 0) || '100';
    const outMin = generator.valueToCode(block, 'OUT_MIN', 0) || '0';
    const outMax = generator.valueToCode(block, 'OUT_MAX', 0) || '1023';
    
    // Python map function implementation
    const code = `((${value} - ${inMin}) * (${outMax} - ${outMin}) / (${inMax} - ${inMin}) + ${outMin})`;
    return [code, 0];
  };
};
