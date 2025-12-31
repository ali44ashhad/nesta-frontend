import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { pythonGenerator } from 'blockly/python';

export const createSensorBlocks = () => {
  // Fix: Explicitly type this as an array of [string, string] tuples
  const ports: [string, string][] = [
    ["Port 1", "1"],
    ["Port 2", "2"],
    ["Port 3", "3"],
    ["Port 4", "4"],
  ];

  // --- Existing Blocks ---
  
  // Read Ultrasonic block
  Blockly.Blocks['read_ultrasonic_port'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read Ultrasonic Sensor at")
          .appendField(new Blockly.FieldDropdown(ports), "PORT");
      this.setOutput(true, "Number");
      this.setColour('#ff9d00');
      this.setTooltip("Read distance at specific port");
      this.setHelpUrl("");
    }
  };

  // Is Obstacle block
  Blockly.Blocks['is_obstacle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Is Obstacle")
          .appendField(new Blockly.FieldDropdown([
            ["closer than", "CLOSER"],
            ["farther than", "FARTHER"]
          ]), "COMPARISON")
          .appendField(new Blockly.FieldNumber(20, 1, 300), "DISTANCE")
          .appendField("cm");
      this.setOutput(true, "Boolean");
      this.setColour('#ff9d00');
      this.setTooltip("Checks for obstacles");
      this.setHelpUrl("");
    }
  };

  // --- New Blocks ---

  // Read IR Sensor
  Blockly.Blocks['read_ir'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read IR Sensor at")
          .appendField(new Blockly.FieldDropdown(ports), "PORT");
      this.setOutput(true, "Boolean");
      this.setColour('#ff9d00');
      this.setTooltip("Returns true if IR sensor detects something");
      this.setHelpUrl("");
    }
  };

  // Read Temperature Sensor
  Blockly.Blocks['read_temperature'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read Temperature Sensor at")
          .appendField(new Blockly.FieldDropdown(ports), "PORT");
          // .appendField("(Advance)");
      this.setOutput(true, "Number");
      this.setColour('#ff9d00');
      this.setTooltip("Reads temperature in Celsius");
      this.setHelpUrl("");
    }
  };

  // Read LDR Sensor
  Blockly.Blocks['read_ldr'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Read LDR Sensor on")
          .appendField(new Blockly.FieldDropdown(ports), "PORT");
          // .appendField("(Basic)");
      this.setOutput(true, "Number");
      this.setColour('#ff9d00');
      this.setTooltip("Reads light level");
      this.setHelpUrl("");
    }
  };

  // --- JavaScript Generators ---
  
  javascriptGenerator.forBlock['read_ultrasonic_port'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`readUltrasonicSensor(${port})`, 0];
  };

  javascriptGenerator.forBlock['is_obstacle'] = function(block) {
    const comparison = block.getFieldValue('COMPARISON');
    const distance = block.getFieldValue('DISTANCE');
    if (comparison === 'CLOSER') {
      return [`readUltrasonicSensor() < ${distance}`, 6];
    } else {
      return [`readUltrasonicSensor() > ${distance}`, 6];
    }
  };

  javascriptGenerator.forBlock['read_ir'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`readIRSensor(${port})`, 0];
  };

  javascriptGenerator.forBlock['read_temperature'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`readTemperatureSensor(${port})`, 0];
  };


  javascriptGenerator.forBlock['read_ldr'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`readLDRSensor(${port})`, 0];
  };

  // --- Python Generators ---

  pythonGenerator.forBlock['read_ultrasonic'] = function() {
    return ['read_ultrasonic_sensor()', 0];
  };

  pythonGenerator.forBlock['is_obstacle'] = function(block) {
    const comparison = block.getFieldValue('COMPARISON');
    const distance = block.getFieldValue('DISTANCE');
    if (comparison === 'CLOSER') {
      return [`read_ultrasonic_sensor() < ${distance}`, 0];
    } else {
      return [`read_ultrasonic_sensor() > ${distance}`, 0];
    }
  };

  pythonGenerator.forBlock['read_ir'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`read_ir_sensor(${port})`, 0];
  };

  pythonGenerator.forBlock['read_temperature'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`read_temperature_sensor(${port})`, 0];
  };

  pythonGenerator.forBlock['read_ldr'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`read_ldr_sensor(${port})`, 0];
  };

  pythonGenerator.forBlock['read_ultrasonic_port'] = function(block) {
    const port = block.getFieldValue('PORT');
    return [`read_ultrasonic_sensor(${port})`, 0];
  };
};