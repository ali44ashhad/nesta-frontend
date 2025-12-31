import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export const createCarBlocks = () => {
  // Move Forward block
  Blockly.Blocks['move_forward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move Forward")
          .appendField(new Blockly.FieldNumber(1, 1, 10), "SPEED");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Move the car forward at the given speed (1-10)");
      this.setHelpUrl("");
    }
  };

  // Move Backward block
  Blockly.Blocks['move_backward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move Backward")
          .appendField(new Blockly.FieldNumber(1, 1, 10), "SPEED");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Move the car backward at the given speed (1-10)");
      this.setHelpUrl("");
    }
  };

  // Turn Left block
  Blockly.Blocks['turn_left'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Turn Left");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Turn the car left");
      this.setHelpUrl("");
    }
  };

  // Turn Right block
  Blockly.Blocks['turn_right'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Turn Right");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Turn the car right");
      this.setHelpUrl("");
    }
  };

  // Custom Move block
  Blockly.Blocks['move_custom'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move")
          .appendField(new Blockly.FieldDropdown([
            ["forward", "FORWARD"],
            ["backward", "BACKWARD"],
            ["left", "LEFT"],
            ["right", "RIGHT"]
          ]), "DIRECTION")
          .appendField("for")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "SECONDS")
          .appendField("seconds");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Move the car in the specified direction for a given time");
      this.setHelpUrl("");
    }
  };

  // Stop Motors block
  Blockly.Blocks['stop_motors'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Stop Motors");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Stop all motors");
      this.setHelpUrl("");
    }
  };

  // Add code generators
  javascriptGenerator.forBlock['move_forward'] = function(block) {
    const speed = block.getFieldValue('SPEED');
    return `moveForward(${speed});\n`;
  };

  javascriptGenerator.forBlock['move_backward'] = function(block) {
    const speed = block.getFieldValue('SPEED');
    return `moveBackward(${speed});\n`;
  };

  javascriptGenerator.forBlock['turn_left'] = function() {
    return 'turnLeft();\n';
  };

  javascriptGenerator.forBlock['turn_right'] = function() {
    return 'turnRight();\n';
  };

  javascriptGenerator.forBlock['move_custom'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    const seconds = block.getFieldValue('SECONDS');
    return `moveCustom("${direction}", ${seconds});\n`;
  };

  javascriptGenerator.forBlock['stop_motors'] = function() {
    return 'stopMotors();\n';
  };
}; 