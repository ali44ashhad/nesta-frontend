// import * as Blockly from 'blockly';
// import { javascriptGenerator } from 'blockly/javascript';

// export const createLogicBlocks = () => {
//   // If-Else block
//   Blockly.Blocks['custom_if_else'] = {
//     init: function() {
//       this.appendValueInput("CONDITION")
//           .setCheck("Boolean")
//           .appendField("if");
//       this.appendStatementInput("DO")
//           .setCheck(null)
//           .appendField("do");
//       this.appendStatementInput("ELSE")
//           .setCheck(null)
//           .appendField("else");
//       this.setInputsInline(false);
//       this.setPreviousStatement(true, null);
//       this.setNextStatement(true, null);
//       this.setColour('#ffd629'); // Logic category color
//       this.setTooltip("If the condition is true, do the first block, else do the second block");
//       this.setHelpUrl("");
//     }
//   };

//   // Wait block
//   Blockly.Blocks['wait'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Wait")
//           .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
//           .appendField("seconds");
//       this.setPreviousStatement(true, null);
//       this.setNextStatement(true, null);
//       this.setColour('#ffd629'); // Logic category color
//       this.setTooltip("Wait for a specified number of seconds");
//       this.setHelpUrl("");
//     }
//   };

//   // Repeat Until Obstacle block
//   Blockly.Blocks['repeat_until_obstacle'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Repeat until obstacle")
//           .appendField(new Blockly.FieldDropdown([
//             ["closer than", "CLOSER"],
//             ["farther than", "FARTHER"]
//           ]), "COMPARISON")
//           .appendField(new Blockly.FieldNumber(10, 1, 100), "DISTANCE")
//           .appendField("cm");
//       this.appendStatementInput("DO")
//           .setCheck(null)
//           .appendField("do");
//       this.setPreviousStatement(true, null);
//       this.setNextStatement(true, null);
//       this.setColour('#ffd629'); // Logic category color
//       this.setTooltip("Repeat actions until an obstacle is detected");
//       this.setHelpUrl("");
//     }
//   };

//   // Add code generators
//   javascriptGenerator.forBlock['custom_if_else'] = function(block) {
//     const condition = javascriptGenerator.valueToCode(block, 'CONDITION', 0) || 'false';
//     const doStatement = javascriptGenerator.statementToCode(block, 'DO');
//     const elseStatement = javascriptGenerator.statementToCode(block, 'ELSE');
    
//     return `if (${condition}) {\n${doStatement}} else {\n${elseStatement}}\n`;
//   };

//   javascriptGenerator.forBlock['wait'] = function(block) {
//     const seconds = block.getFieldValue('SECONDS');
//     return `wait(${seconds});\n`;
//   };

//   javascriptGenerator.forBlock['repeat_until_obstacle'] = function(block) {
//     const comparison = block.getFieldValue('COMPARISON');
//     const distance = block.getFieldValue('DISTANCE');
//     const doCode = javascriptGenerator.statementToCode(block, 'DO');
    
//     let condition;
//     if (comparison === 'CLOSER') {
//       condition = `readUltrasonicSensor() >= ${distance}`;
//     } else {
//       condition = `readUltrasonicSensor() <= ${distance}`;
//     }
    
//     return `while (${condition}) {\n${doCode}}\n`;
//   };
// }; 

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

export const createLogicBlocks = () => {
  // If-Else block
  Blockly.Blocks['custom_if_else'] = {
    init: function() {
      this.appendValueInput("CONDITION")
          .setCheck("Boolean")
          .appendField("if");
      this.appendStatementInput("DO")
          .setCheck(null)
          .appendField("do");
      this.appendStatementInput("ELSE")
          .setCheck(null)
          .appendField("else");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ffd629');
      this.setTooltip("If the condition is true, do the first block, else do the second block");
      this.setHelpUrl("");
    }
  };

  // Wait block
  Blockly.Blocks['wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Wait")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
          .appendField("seconds");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ffd629');
      this.setTooltip("Wait for a specified number of seconds");
      this.setHelpUrl("");
    }
  };

  // Repeat Until Obstacle block
  Blockly.Blocks['repeat_until_obstacle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Repeat until obstacle")
          .appendField(new Blockly.FieldDropdown([
            ["closer than", "CLOSER"],
            ["farther than", "FARTHER"]
          ]), "COMPARISON")
          .appendField(new Blockly.FieldNumber(10, 1, 100), "DISTANCE")
          .appendField("cm");
      this.appendStatementInput("DO")
          .setCheck(null)
          .appendField("do");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ffd629');
      this.setTooltip("Repeat actions until an obstacle is detected");
      this.setHelpUrl("");
    }
  };

  // --- JavaScript Generators ---
  javascriptGenerator.forBlock['custom_if_else'] = function(block) {
    const condition = javascriptGenerator.valueToCode(block, 'CONDITION', 0) || 'false';
    const doStatement = javascriptGenerator.statementToCode(block, 'DO');
    const elseStatement = javascriptGenerator.statementToCode(block, 'ELSE');
    
    return `if (${condition}) {\n${doStatement}} else {\n${elseStatement}}\n`;
  };

  javascriptGenerator.forBlock['wait'] = function(block) {
    const seconds = block.getFieldValue('SECONDS');
    return `wait(${seconds});\n`;
  };

  javascriptGenerator.forBlock['repeat_until_obstacle'] = function(block) {
    const comparison = block.getFieldValue('COMPARISON');
    const distance = block.getFieldValue('DISTANCE');
    const doCode = javascriptGenerator.statementToCode(block, 'DO');
    
    let condition;
    if (comparison === 'CLOSER') {
      condition = `readUltrasonicSensor() >= ${distance}`;
    } else {
      condition = `readUltrasonicSensor() <= ${distance}`;
    }
    return `while (${condition}) {\n${doCode}}\n`;
  };

  // --- Python Generators ---
  pythonGenerator.forBlock['custom_if_else'] = function(block) {
    const condition = pythonGenerator.valueToCode(block, 'CONDITION', 0) || 'False';
    const doStatement = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    const elseStatement = pythonGenerator.statementToCode(block, 'ELSE') || '    pass\n';
    return `if ${condition}:\n${doStatement}else:\n${elseStatement}`;
  };

  pythonGenerator.forBlock['wait'] = function(block) {
    const seconds = block.getFieldValue('SECONDS');
    return `time.sleep(${seconds})\n`;
  };

  pythonGenerator.forBlock['repeat_until_obstacle'] = function(block) {
    const comparison = block.getFieldValue('COMPARISON');
    const distance = block.getFieldValue('DISTANCE');
    const doCode = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    
    let condition;
    if (comparison === 'CLOSER') {
      condition = `read_ultrasonic_sensor() >= ${distance}`;
    } else {
      condition = `read_ultrasonic_sensor() <= ${distance}`;
    }
    return `while ${condition}:\n${doCode}`;
  };
};