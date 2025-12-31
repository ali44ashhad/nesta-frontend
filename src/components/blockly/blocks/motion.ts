// import * as Blockly from 'blockly';
// import { javascriptGenerator } from 'blockly/javascript';

// export const createMotionBlocks = () => {
//   // Move Forward block
//   Blockly.Blocks['move_forward'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Move Forward");
//       this.setNextStatement(true, null);
//       this.setPreviousStatement(true, null);
//       this.setColour('#ff7517'); // Motion category color
//       this.setTooltip("Move the car forward");
//       this.setHelpUrl("");
//     }
//   };

//   // Move Backward block
//   Blockly.Blocks['move_backward'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Move Backward");
//       this.setNextStatement(true, null);
//       this.setPreviousStatement(true, null);
//       this.setColour('#ff7517'); // Motion category color
//       this.setTooltip("Move the car backward");
//       this.setHelpUrl("");
//     }
//   };

//   // Turn Left block
//   Blockly.Blocks['turn_left'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Turn Left");
//       this.setNextStatement(true, null);
//       this.setPreviousStatement(true, null);
//       this.setColour('#ff7517'); // Motion category color
//       this.setTooltip("Turn the car left");
//       this.setHelpUrl("");
//     }
//   };

//   // Turn Right block
//   Blockly.Blocks['turn_right'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Turn Right");
//       this.setNextStatement(true, null);
//       this.setPreviousStatement(true, null);
//       this.setColour('#ff7517'); // Motion category color
//       this.setTooltip("Turn the car right");
//       this.setHelpUrl("");
//     }
//   };

//   // Stop Movement block
//   Blockly.Blocks['stop_movement'] = {
//     init: function() {
//       this.appendDummyInput()
//           .appendField("Stop");
//       this.setNextStatement(true, null);
//       this.setPreviousStatement(true, null);
//       this.setColour('#ff7517'); // Motion category color
//       this.setTooltip("Stop all car movement");
//       this.setHelpUrl("");
//     }
//   };

//   // Add code generators
//   javascriptGenerator.forBlock['move_forward'] = function() {
//     return 'moveForward();\n';
//   };

//   javascriptGenerator.forBlock['move_backward'] = function() {
//     return 'moveBackward();\n';
//   };

//   javascriptGenerator.forBlock['turn_left'] = function() {
//     return 'turnLeft();\n';
//   };

//   javascriptGenerator.forBlock['turn_right'] = function() {
//     return 'turnRight();\n';
//   };

//   javascriptGenerator.forBlock['stop_movement'] = function() {
//     return 'stopMovement();\n';
//   };
// }; 

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

export const createMotionBlocks = () => {
  // Move Forward block
  Blockly.Blocks['move_forward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move Forward");
      this.setNextStatement(true, null);
      this.setPreviousStatement(true, null);
      this.setColour('#ff7517'); // Motion category color
      this.setTooltip("Move the car forward");
      this.setHelpUrl("");
    }
  };

  // Move Backward block
  Blockly.Blocks['move_backward'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move Backward");
      this.setNextStatement(true, null);
      this.setPreviousStatement(true, null);
      this.setColour('#ff7517'); // Motion category color
      this.setTooltip("Move the car backward");
      this.setHelpUrl("");
    }
  };

  // Turn Left block
  Blockly.Blocks['turn_left'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Turn Left");
      this.setNextStatement(true, null);
      this.setPreviousStatement(true, null);
      this.setColour('#ff7517'); // Motion category color
      this.setTooltip("Turn the car left");
      this.setHelpUrl("");
    }
  };

  // Turn Right block
  Blockly.Blocks['turn_right'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Turn Right");
      this.setNextStatement(true, null);
      this.setPreviousStatement(true, null);
      this.setColour('#ff7517'); // Motion category color
      this.setTooltip("Turn the car right");
      this.setHelpUrl("");
    }
  };

  // Stop Movement block
  Blockly.Blocks['stop_movement'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Stop");
      this.setNextStatement(true, null);
      this.setPreviousStatement(true, null);
      this.setColour('#ff7517'); // Motion category color
      this.setTooltip("Stop all car movement");
      this.setHelpUrl("");
    }
  };

  // Add code generators
  javascriptGenerator.forBlock['move_forward'] = function() {
    return 'moveForward();\n';
  };

  javascriptGenerator.forBlock['move_backward'] = function() {
    return 'moveBackward();\n';
  };

  javascriptGenerator.forBlock['turn_left'] = function() {
    return 'turnLeft();\n';
  };

  javascriptGenerator.forBlock['turn_right'] = function() {
    return 'turnRight();\n';
  };

  javascriptGenerator.forBlock['stop_movement'] = function() {
    return 'stopMovement();\n';
  };

  // --- Python Generators ---
  pythonGenerator.forBlock['move_forward'] = function() {
    return 'move_forward()\n';
  };

  pythonGenerator.forBlock['move_backward'] = function() {
    return 'move_backward()\n';
  };

  pythonGenerator.forBlock['turn_left'] = function() {
    return 'turn_left()\n';
  };

  pythonGenerator.forBlock['turn_right'] = function() {
    return 'turn_right()\n';
  };

  pythonGenerator.forBlock['stop_movement'] = function() {
    return 'stop_movement()\n';
  };
};