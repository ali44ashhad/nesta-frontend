import { ProjectBlock } from "../store/projectSlice";

export interface Template {
  id: string;
  name: string;
  description: string;
  blocks: ProjectBlock[];
}

// Type for nested blocks (without x, y coordinates)
type NestedBlock = Omit<ProjectBlock, "x" | "y"> & {
  next?: { block: NestedBlock };
};

// Helper functions to create common block patterns
const createNumberBlock = (id: string, value: number): NestedBlock => ({
  type: "math_number",
  id,
  fields: { NUM: value },
});

const createSensorBlock = (type: string, id: string, port: string = "1"): NestedBlock => ({
  type,
  id,
  fields: { PORT: port },
});

const createCompareBlock = (
  id: string,
  operator: string,
  leftBlock: NestedBlock,
  rightBlock: NestedBlock
): NestedBlock => ({
  type: "logic_compare",
  id,
  fields: { OP: operator },
  inputs: {
    A: { block: leftBlock },
    B: { block: rightBlock },
  },
});

const createProgramBlock = (id: string, doBlock: NestedBlock): ProjectBlock => ({
  type: "my_program",
  id,
  x: 50,
  y: 50,
  inputs: {
    DO: { block: doBlock },
  },
});

export const templates: Template[] = [
  {
    id: "template-zigzag-zoom",
    name: "Zig-Zag Zoom",
    description: "Moves in a zigzag pattern by alternating left and right turns.",
    blocks: [
      createProgramBlock("program_start_zigzag", {
        type: "controls_repeat_ext",
        id: "repeat_3_times_zigzag",
        inputs: {
          TIMES: { block: createNumberBlock("num_3_zigzag", 3) },
          DO: {
            block: {
              type: "move_forward",
              id: "move_fwd1_zigzag",
              next: {
                block: {
                  type: "turn_left",
                  id: "turn_left_zigzag",
                  next: {
                    block: {
                      type: "move_forward",
                      id: "move_fwd2_zigzag",
                      next: {
                        block: {
                          type: "turn_right",
                          id: "turn_right_zigzag",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ],
  },
  {
    id: "template-square-dance",
    name: "Square Dance",
    description: "Makes the robot move in a square pattern four times.",
    blocks: [
      createProgramBlock("program_start_square", {
        type: "controls_repeat_ext",
        id: "repeat_4_times",
        inputs: {
          TIMES: { block: createNumberBlock("num_4", 4) },
          DO: {
            block: {
              type: "move_forward",
              id: "move_fwd_square",
              next: {
                block: {
                  type: "turn_right",
                  id: "turn_right_square",
                },
              },
            },
          },
        },
      }),
    ],
  },
  {
    id: "template-obstacle-avoider",
    name: "Obstacle Avoider",
    description: "Continuously moves forward and stops if an obstacle gets too close (within 20cm).",
    blocks: [
      createProgramBlock("program_start_avoider", {
        type: "controls_whileUntil",
        id: "main_loop_avoider",
        fields: { MODE: "WHILE" },
        inputs: {
          BOOL: {
            block: {
              type: "is_obstacle",
              id: "distance_check_avoider",
              fields: { COMPARISON: "FARTHER", DISTANCE: 20 },
            },
          },
          DO: {
            block: {
              type: "move_forward",
              id: "move_fwd_avoider",
            },
          },
        },
        next: {
          block: {
            type: "stop_movement",
            id: "stop_action_avoider",
          },
        },
      }),
    ],
  },
  {
    id: "template-ultrasonic-distance",
    name: "Ultrasonic Distance Monitor",
    description: "Moves forward while distance is greater than 30cm, then turns right.",
    blocks: [
      createProgramBlock("program_start_ultrasonic", {
        type: "controls_whileUntil",
        id: "main_loop_ultrasonic",
        fields: { MODE: "WHILE" },
        inputs: {
          BOOL: {
            block: createCompareBlock(
              "distance_compare",
              "GT",
              createSensorBlock("read_ultrasonic_port", "read_ultrasonic_1", "1"),
              createNumberBlock("num_30", 30)
            ),
          },
          DO: {
            block: {
              type: "move_forward",
              id: "move_fwd_ultrasonic",
            },
          },
        },
        next: {
          block: {
            type: "turn_right",
            id: "turn_right_ultrasonic",
          },
        },
      }),
    ],
  },
  {
    id: "template-ir-sensor-reactor",
    name: "IR Sensor Reactor",
    description: "Moves forward until IR sensor detects something, then turns left.",
    blocks: [
      createProgramBlock("program_start_ir", {
        type: "controls_whileUntil",
        id: "main_loop_ir",
        fields: { MODE: "WHILE" },
        inputs: {
          BOOL: {
            block: {
              type: "logic_negate",
              id: "ir_negate",
              inputs: {
                BOOL: {
                  block: createSensorBlock("read_ir", "read_ir_1", "1"),
                },
              },
            },
          },
          DO: {
            block: {
              type: "move_forward",
              id: "move_fwd_ir",
            },
          },
        },
        next: {
          block: {
            type: "turn_left",
            id: "turn_left_ir",
          },
        },
      }),
    ],
  },
  {
    id: "template-temperature-monitor",
    name: "Temperature Monitor",
    description: "Moves forward if temperature is above 24°C, otherwise turns right.",
    blocks: [
      createProgramBlock("program_start_temp", {
        type: "controls_repeat_ext",
        id: "repeat_10_times_temp",
        inputs: {
          TIMES: { block: createNumberBlock("num_10_temp", 10) },
          DO: {
            block: {
              type: "custom_if",
              id: "if_temp_check",
              inputs: {
                CONDITION: {
                  block: createCompareBlock(
                    "temp_compare",
                    "GT",
                    createSensorBlock("read_temperature", "read_temp_1", "1"),
                    createNumberBlock("num_24", 24)
                  ),
                },
                DO: {
                  block: {
                    type: "move_forward",
                    id: "move_fwd_temp",
                  },
                },
              },
              next: {
                block: {
                  type: "custom_if",
                  id: "if_temp_else",
                  inputs: {
                    CONDITION: {
                      block: createCompareBlock(
                        "temp_compare_else",
                        "LTE",
                        createSensorBlock("read_temperature", "read_temp_1_else", "1"),
                        createNumberBlock("num_24_else", 24)
                      ),
                    },
                    DO: {
                      block: {
                        type: "turn_right",
                        id: "turn_right_temp",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ],
  },
  {
    id: "template-light-follower",
    name: "Light Follower",
    description: "Moves forward if light level is above 400, otherwise turns left.",
    blocks: [
      createProgramBlock("program_start_ldr", {
        type: "controls_repeat_ext",
        id: "repeat_15_times_ldr",
        inputs: {
          TIMES: { block: createNumberBlock("num_15_ldr", 15) },
          DO: {
            block: {
              type: "custom_if",
              id: "if_ldr_check",
              inputs: {
                CONDITION: {
                  block: createCompareBlock(
                    "ldr_compare",
                    "GT",
                    createSensorBlock("read_ldr", "read_ldr_1", "1"),
                    createNumberBlock("num_400", 400)
                  ),
                },
                DO: {
                  block: {
                    type: "move_forward",
                    id: "move_fwd_ldr",
                  },
                },
              },
              next: {
                block: {
                  type: "custom_if",
                  id: "if_ldr_else",
                  inputs: {
                    CONDITION: {
                      block: createCompareBlock(
                        "ldr_compare_else",
                        "LTE",
                        createSensorBlock("read_ldr", "read_ldr_1_else", "1"),
                        createNumberBlock("num_400_else", 400)
                      ),
                    },
                    DO: {
                      block: {
                        type: "turn_left",
                        id: "turn_left_ldr",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ],
  },
  {
    id: "template-multi-sensor-demo",
    name: "Multi-Sensor Demo",
    description: "Demonstrates multiple sensors: uses ultrasonic to avoid obstacles and IR to detect objects.",
    blocks: [
      createProgramBlock("program_start_multi", {
        type: "controls_whileUntil",
        id: "main_loop_multi",
        fields: { MODE: "WHILE" },
        inputs: {
          BOOL: {
            block: {
              type: "is_obstacle",
              id: "is_obstacle_multi",
              fields: { COMPARISON: "FARTHER", DISTANCE: 25 },
            },
          },
          DO: {
            block: {
              type: "custom_if",
              id: "if_ir_check",
              inputs: {
                CONDITION: {
                  block: createSensorBlock("read_ir", "read_ir_multi", "2"),
                },
                DO: {
                  block: {
                    type: "move_forward",
                    id: "move_fwd_multi",
                    next: {
                      block: {
                        type: "turn_left",
                        id: "turn_left_multi",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        next: {
          block: {
            type: "turn_right",
            id: "turn_right_multi",
          },
        },
      }),
    ],
  },
];