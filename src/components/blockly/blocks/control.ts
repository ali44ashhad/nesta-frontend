// import * as Blockly from 'blockly';
// import { javascriptGenerator } from 'blockly/javascript';

// export const createControlBlocks = () => {
//   // My Program block (hat block for starting the code)
//   Blockly.Blocks['my_program'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("My Program");
//       this.appendStatementInput("DO")
//           .setCheck(null);
//       this.setColour('#e32626'); // Control category color
//       this.setTooltip("The main container for your program's blocks.");
//       this.setHelpUrl("");
//       // This makes it a "hat" block that can only be at the start.
//       this.setPreviousStatement(false, null);
//       this.setNextStatement(false, null);
//     }
//   };

//   // Wait in milliseconds block
//   Blockly.Blocks['wait_ms'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Time")
//           .appendField(new Blockly.FieldNumber(1000, 0, 60000, 1), "MILLISECONDS")
//           .appendField("ms");
//       this.setPreviousStatement(true, null);
//       this.setNextStatement(true, null);
//       this.setColour('#e32626'); // Control category color
//       this.setTooltip("Wait for a specified number of milliseconds.");
//       this.setHelpUrl("");
//     }
//   };

//   // Custom 'if' block
//   Blockly.Blocks['custom_if'] = {
//     init: function() {
//       this.appendValueInput("CONDITION")
//           .setCheck("Boolean")
//           .appendField("if");
//       this.appendStatementInput("DO")
//           .setCheck(null)
//           .appendField("do");
//       this.setPreviousStatement(true, null);
//       this.setNextStatement(true, null);
//       this.setColour('#e32626'); // Control category color
//       this.setTooltip("If the condition is true, execute the enclosed blocks.");
//       this.setHelpUrl("");
//     }
//   };


//   // --- Code Generators ---

//   javascriptGenerator.forBlock['my_program'] = function(block, generator) {
//     // This block is a container. The actual program logic is generated
//     // from the blocks connected inside it.
//     const doStatement = generator.statementToCode(block, 'DO');
//     return doStatement;
//   };

//   javascriptGenerator.forBlock['wait_ms'] = function(block) {
//     const milliseconds = block.getFieldValue('MILLISECONDS');
//     // Your existing wait function expects seconds, so we convert ms to s.
//     const seconds = milliseconds / 1000;
//     return `wait(${seconds});\n`;
//   };

//   javascriptGenerator.forBlock['custom_if'] = function(block, generator) {
//     const condition = generator.valueToCode(block, 'CONDITION', 0) || 'false';
//     const doStatement = generator.statementToCode(block, 'DO');
//     return `if (${condition}) {\n${doStatement}}\n`;
//   };
// };

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

export const createControlBlocks = () => {
  // My Program block
  Blockly.Blocks['my_program'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("My Program");
      this.appendStatementInput("DO")
          .setCheck(null);
      this.setColour('#e32626'); // Control category color
      this.setTooltip("The main container for your program's blocks.");
      this.setHelpUrl("");
      // This makes it a "hat" block that can only be at the start.
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
    }
  };

  // Wait in milliseconds block
  Blockly.Blocks['wait_ms'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Time")
          .appendField(new Blockly.FieldNumber(1000, 0, 60000, 1), "MILLISECONDS")
          .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e32626'); // Control category color
      this.setTooltip("Wait for a specified number of milliseconds.");
      this.setHelpUrl("");
    }
  };

  // Custom 'if' block
  Blockly.Blocks['custom_if'] = {
    init: function() {
      this.appendValueInput("CONDITION")
          .setCheck("Boolean")
          .appendField("if");
      this.appendStatementInput("DO")
          .setCheck(null)
          .appendField("do");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#e32626'); // Control category color
      this.setTooltip("If the condition is true, execute the enclosed blocks.");
      this.setHelpUrl("");
    }
  };

  // --- JavaScript Generators ---
  javascriptGenerator.forBlock['my_program'] = function(block, generator) {
    const doStatement = generator.statementToCode(block, 'DO');
    return doStatement;
  };

  javascriptGenerator.forBlock['wait_ms'] = function(block) {
    const milliseconds = block.getFieldValue('MILLISECONDS');
    const seconds = milliseconds / 1000;
    return `wait(${seconds});\n`;
  };

  javascriptGenerator.forBlock['custom_if'] = function(block, generator) {
    const condition = generator.valueToCode(block, 'CONDITION', 0) || 'false';
    const doStatement = generator.statementToCode(block, 'DO');
    return `if (${condition}) {\n${doStatement}}\n`;
  };

  // --- Python Generators ---
  pythonGenerator.forBlock['my_program'] = function(block, generator) {
    const doStatement = generator.statementToCode(block, 'DO');
    return doStatement;
  };

  pythonGenerator.forBlock['wait_ms'] = function(block) {
    const milliseconds = block.getFieldValue('MILLISECONDS');
    return `time.sleep_ms(${milliseconds})\n`;
  };

  pythonGenerator.forBlock['custom_if'] = function(block, generator) {
    const condition = generator.valueToCode(block, 'CONDITION', 0) || 'False';
    const doStatement = generator.statementToCode(block, 'DO') || '    pass\n';
    return `if ${condition}:\n${doStatement}`;
  };
};