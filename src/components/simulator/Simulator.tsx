import { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  startSimulation as startSimulationAction,
  stopSimulation as stopSimulationAction,
  resetSimulation,
  setObstacles,
  updateCarPosition,
  updateSensorReading,
  setCollisionShake,
  type Obstacle,
} from "../../store/simulatorSlice";
import { useToast } from "../ToastManager";
import RemoteControls from "./RemoteControls";
import Canvas from "./Canvas";
import {
  HEX_SIZE,
  HEX_HEIGHT,
  HEX_WIDTH,
  VERT_STEP,
  HORIZ_STEP,
} from "./hexConfig";
import { checkCollision, isColliding } from "../../utils/collisionDetection";
import { playCollisionSound, stopCollisionSound, type AudioRefs } from "../../utils/collisionAudio";
import { SIMULATOR_CONSTANTS } from "../../utils/simulatorConstants";
import {
  getUltrasonicReading,
  getIRSensorReading,
  getTemperatureSensorReading,
  getLDRSensorReading,
} from "../../utils/sensorSimulation";
import { validateCode } from "../../utils/codeValidation";

interface SimulatorProps {
  onOpenScanPopup?: () => void;
  onFirmwareFlash?: () => void;
  onShowCode?: () => void;
  onShowSimulator?: () => void;
  canFirmwareFlash?: boolean;
}

const initialCarPosition: { x: number; y: number; angle: number } = {
  x: SIMULATOR_CONSTANTS.INITIAL_CAR_X,
  y: SIMULATOR_CONSTANTS.INITIAL_CAR_Y,
  angle: SIMULATOR_CONSTANTS.INITIAL_CAR_ANGLE,
};

const Simulator = ({
  // onOpenScanPopup,
  onFirmwareFlash,
  onShowCode,
  onShowSimulator,
  canFirmwareFlash,
}: SimulatorProps) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use memoized selectors to prevent unnecessary re-renders
  const position = useSelector((state: RootState) => state.simulator.position);
  const isRunning = useSelector(
    (state: RootState) => state.simulator.isRunning
  );
  const obstaclePositions = useSelector(
    (state: RootState) => state.simulator.obstaclePositions
  );
  const sensorReadings = useSelector(
    (state: RootState) => state.simulator.sensorReadings
  );
  const trail = useSelector((state: RootState) => state.simulator.trail);
  const showTrail = useSelector(
    (state: RootState) => state.simulator.showTrail
  );
  const placeObstacleMode = useSelector(
    (state: RootState) => state.simulator.placeObstacleMode
  );
  const collisionShake = useSelector(
    (state: RootState) => state.simulator.collisionShake
  );

  // Use javascriptCode for simulation logic
  const javascriptCode = useSelector(
    (state: RootState) => state.code.javascriptCode
  );

  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: SIMULATOR_CONSTANTS.INITIAL_CANVAS_WIDTH,
    height: SIMULATOR_CONSTANTS.INITIAL_CANVAS_HEIGHT,
  });
  const currentPositionRef = useRef({ ...initialCarPosition });
  const audioRefs = useRef<AudioRefs>({ audioContext: null, oscillator: null });
  const obstaclePositionsRef = useRef<Obstacle[]>([]);

  const executionState = useRef<{
    commands: (() => Promise<void>)[];
    commandIndex: number;
    isRunning: boolean;
    timeoutId: number | null;
    variables: Record<string, number | boolean>; // Variable store
    constVariables: Set<string>; // Track const variables that cannot be reassigned
    variableUsage: Record<
      string,
      { assigned: boolean; used: boolean; line?: number }
    >; // Track variable usage for warnings
    functions: Record<string, { body: string; params: string[] }>; // Function definitions store (name -> {body, params})
    functionCalls: Array<{ name: string; args: number; line?: number }>; // Track function calls for validation
    recursionDepth: number; // Track recursion depth for function calls
    maxRecursionDepth: number; // Maximum allowed recursion depth
    queueSize: number; // Track queue size to prevent memory issues
    maxQueueSize: number; // Maximum allowed queue size
  }>({
    commands: [],
    commandIndex: 0,
    isRunning: false,
    timeoutId: null,
    variables: {}, // Initialize empty variable store
    constVariables: new Set(), // Track const variables
    variableUsage: {}, // Track variable usage
    functions: {}, // Initialize empty function store
    functionCalls: [], // Track function calls
    recursionDepth: 0,
    maxRecursionDepth: SIMULATOR_CONSTANTS.MAX_RECURSION_DEPTH,
    queueSize: 0,
    maxQueueSize: SIMULATOR_CONSTANTS.MAX_QUEUE_SIZE,
  });

  // ... [Keep existing movement methods: moveForward, moveBackward, turnLeft, turnRight, stopMovement, getSensorReading] ...
  // (Rest of the file remains largely the same, except using `javascriptCode` in `handleStart`)

  useEffect(() => {
    if (!isRunning) {
      currentPositionRef.current = { ...position };
    }
  }, [position, isRunning]);

  // Keep obstacle positions ref in sync with Redux state for real-time collision detection
  useEffect(() => {
    obstaclePositionsRef.current = obstaclePositions;
  }, [obstaclePositions]);

  // Helper function to handle collision effects
  const handleCollisionEffects = useCallback(() => {
    if (obstaclePositionsRef.current.length === 0) return;

    dispatch(setCollisionShake(true));
    setTimeout(
      () => dispatch(setCollisionShake(false)),
      SIMULATOR_CONSTANTS.COLLISION_SHAKE_DURATION
    );

    stopCollisionSound(audioRefs.current);
    if (obstaclePositionsRef.current.length > 0) {
      audioRefs.current = playCollisionSound(
        SIMULATOR_CONSTANTS.COLLISION_SOUND_FREQUENCY
      );
    }
  }, [dispatch]);

  const moveForward = useCallback(() => {
    const { x, y, angle } = currentPositionRef.current;
    const { width, height } = canvasSize;
    const radians = (angle * Math.PI) / 180;
    const moveDistance = SIMULATOR_CONSTANTS.MOVE_DISTANCE;

    // Check for obstacle collision using utility function
    const collision = checkCollision(
      currentPositionRef.current,
      obstaclePositionsRef.current,
      moveDistance,
      1
    );

    // Calculate new position
    let newX = x + Math.cos(radians) * collision.safeDistance;
    let newY = y + Math.sin(radians) * collision.safeDistance;

    // Handle collision effects
    if (collision.hasCollision && collision.safeDistance < moveDistance - 1) {
      handleCollisionEffects();
    }

    // Constrain to canvas bounds
    const buffer = SIMULATOR_CONSTANTS.CAR_BUFFER;
    newX = Math.max(buffer, Math.min(width - buffer, newX));
    newY = Math.max(buffer, Math.min(height - buffer, newY));

    // Update position
    currentPositionRef.current = {
      ...currentPositionRef.current,
      x: newX,
      y: newY,
    };
    dispatch(updateCarPosition({ x: newX, y: newY }));
  }, [canvasSize, dispatch, handleCollisionEffects]);

  const moveBackward = useCallback(() => {
    const { x, y, angle } = currentPositionRef.current;
    const { width, height } = canvasSize;
    const radians = (angle * Math.PI) / 180;
    const moveDistance = SIMULATOR_CONSTANTS.MOVE_DISTANCE;

    // Check for obstacle collision using utility function
    const collision = checkCollision(
      currentPositionRef.current,
      obstaclePositionsRef.current,
      moveDistance,
      -1
    );

    // Calculate new position
    let newX = x - Math.cos(radians) * collision.safeDistance;
    let newY = y - Math.sin(radians) * collision.safeDistance;

    // Handle collision effects
    if (collision.hasCollision && collision.safeDistance < moveDistance - 1) {
      handleCollisionEffects();
    }

    // Constrain to canvas bounds
    const buffer = SIMULATOR_CONSTANTS.CAR_BUFFER;
    newX = Math.max(buffer, Math.min(width - buffer, newX));
    newY = Math.max(buffer, Math.min(height - buffer, newY));

    // Update position
    currentPositionRef.current = {
      ...currentPositionRef.current,
      x: newX,
      y: newY,
    };
    dispatch(updateCarPosition({ x: newX, y: newY }));
  }, [canvasSize, dispatch, handleCollisionEffects]);

  const turnLeft = useCallback(() => {
    const { angle } = currentPositionRef.current;
    const newAngle = (angle - SIMULATOR_CONSTANTS.TURN_ANGLE) % 360;
    currentPositionRef.current = {
      ...currentPositionRef.current,
      angle: newAngle,
    };
    dispatch(updateCarPosition({ angle: newAngle }));
  }, [dispatch]);

  const turnRight = useCallback(() => {
    const { angle } = currentPositionRef.current;
    const newAngle = (angle + SIMULATOR_CONSTANTS.TURN_ANGLE) % 360;
    currentPositionRef.current = {
      ...currentPositionRef.current,
      angle: newAngle,
    };
    dispatch(updateCarPosition({ angle: newAngle }));
  }, [dispatch]);

  const stopMovement = () => {
    stopSimulation();
  };

  // Sensor reading functions using utility functions
  const getSensorReading = useCallback(
    (_port?: number | string): number => {
      const sensorContext = {
        position: currentPositionRef.current,
        obstacles: obstaclePositionsRef.current,
      };
      const reading = getUltrasonicReading(sensorContext, _port);
      dispatch(updateSensorReading({ ultrasonic: reading }));
      return reading;
    },
    [dispatch]
  );

  const getIRSensorReadingLocal = useCallback(
    (_port?: number | string): boolean => {
      const sensorContext = {
        position: currentPositionRef.current,
        obstacles: obstaclePositionsRef.current,
      };
      return getIRSensorReading(sensorContext, _port);
    },
    []
  );

  const getTemperatureSensorReadingLocal = useCallback(
    (_port?: number | string): number => {
      const sensorContext = {
        position: currentPositionRef.current,
        obstacles: obstaclePositionsRef.current,
      };
      return getTemperatureSensorReading(sensorContext, _port);
    },
    []
  );

  const getLDRSensorReadingLocal = useCallback(
    (_port?: number | string): number => {
      const sensorContext = {
        position: currentPositionRef.current,
        obstacles: obstaclePositionsRef.current,
      };
      return getLDRSensorReading(sensorContext, _port);
    },
    []
  );

  // Safe math expression evaluator with variable and function call support
  const evaluateMathExpression = (expr: string): number => {
    try {
      let processedExpr = expr;

      // Replace function calls with their return values
      const functionCallRegex = /\b(\w+)\s*\(([^)]*)\)/g;
      let match;
      while ((match = functionCallRegex.exec(processedExpr)) !== null) {
        const funcName = match[1];
        const funcArgs = match[2];

        if (funcName in executionState.current.functions) {
          // Parse and evaluate function arguments
          const parseArguments = (argString: string): string[] => {
            const args: string[] = [];
            let currentArg = "";
            let depth = 0;

            for (let i = 0; i < argString.length; i++) {
              const char = argString[i];
              if (char === "(") depth++;
              else if (char === ")") depth--;
              else if (char === "," && depth === 0) {
                args.push(currentArg.trim());
                currentArg = "";
                continue;
              }
              currentArg += char;
            }
            if (currentArg.trim()) {
              args.push(currentArg.trim());
            }
            return args;
          };

          const args = parseArguments(funcArgs);

          // Check for missing/undefined arguments
          const missingArgs: number[] = [];
          args.forEach((arg, idx) => {
            const trimmedArg = arg.trim();
            // Check if argument is empty
            if (
              trimmedArg === "" ||
              trimmedArg === undefined ||
              trimmedArg === null
            ) {
              missingArgs.push(idx);
            } else {
              // Check if it's a variable name that doesn't exist
              // Only check if it looks like a variable name (not a number, not an expression)
              if (
                /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg) &&
                !(trimmedArg in executionState.current.variables) &&
                isNaN(parseFloat(trimmedArg))
              ) {
                missingArgs.push(idx);
              }
            }
          });

          if (missingArgs.length > 0) {
            const funcDef = executionState.current.functions[funcName];
            const paramNames = missingArgs
              .map((idx) => funcDef.params[idx] || `argument ${idx + 1}`)
              .join(", ");
            const warningMsg = `Function "${funcName}" is called with missing or undefined arguments: [${paramNames}]. These will default to 0, which may cause incorrect results.`;
            console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
            // Note: showToast is not available in evaluateMathExpression scope, so we only log to console
          }

          const evaluatedArgs = args.map((arg) => {
            const trimmedArg = arg.trim();

            // If argument is empty or undefined, default to 0
            if (
              trimmedArg === "" ||
              trimmedArg === undefined ||
              trimmedArg === null
            ) {
              return 0;
            }

            if (!isNaN(parseFloat(trimmedArg))) {
              return parseFloat(trimmedArg);
            } else if (trimmedArg in executionState.current.variables) {
              return executionState.current.variables[trimmedArg] as number;
            } else {
              // Check if it's a variable name that doesn't exist (not a math expression)
              if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg)) {
                // It's a variable name that doesn't exist, default to 0
                return 0;
              }
              const result = evaluateMathExpression(trimmedArg);
              // If evaluation resulted in NaN, default to 0
              return isNaN(result) ? 0 : result;
            }
          });

          const funcDef = executionState.current.functions[funcName];
          const returnMatch = funcDef.body.match(/return\s+(.+);?/);
          if (returnMatch) {
            let returnExpr = returnMatch[1].trim();
            funcDef.params.forEach((param: string, idx: number) => {
              const paramRegex = new RegExp(`\\b${param}\\b`, "g");
              returnExpr = returnExpr.replace(
                paramRegex,
                String(evaluatedArgs[idx] || 0)
              );
            });
            const funcResult = evaluateMathExpression(returnExpr);
            processedExpr = processedExpr.replace(match[0], String(funcResult));
          } else {
            processedExpr = processedExpr.replace(match[0], "0");
          }
        }
      }

      // Replace variable references with their values
      const varNames = Object.keys(executionState.current.variables);
      for (const varName of varNames) {
        const varValue = executionState.current.variables[varName];
        // Replace variable name (but not as part of another word)
        const varRegex = new RegExp(`\\b${varName}\\b`, "g");
        if (typeof varValue === "number") {
          processedExpr = processedExpr.replace(varRegex, String(varValue));
        }
      }

      // Replace sensor function calls with actual values
      // Handle readUltrasonicSensor with optional port parameter
      processedExpr = processedExpr.replace(
        /readUltrasonicSensor\s*\(([^)]*)\)/g,
        (_match, args) => {
          const port = args.trim();
          if (port === "") {
            return String(getSensorReading());
          }
          // Parse port number (could be a number or variable)
          const portNum = isNaN(parseFloat(port)) ? 1 : parseFloat(port);
          return String(getSensorReading(portNum));
        }
      );

      // Handle readIRSensor with optional port parameter (returns boolean as 1/0)
      processedExpr = processedExpr.replace(
        /readIRSensor\s*\(([^)]*)\)/g,
        (_match, args) => {
          const port = args.trim();
          const portNum =
            port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
          return getIRSensorReadingLocal(portNum) ? "1" : "0";
        }
      );

      // Handle readTemperatureSensor with optional port parameter
      processedExpr = processedExpr.replace(
        /readTemperatureSensor\s*\(([^)]*)\)/g,
        (_match, args) => {
          const port = args.trim();
          const portNum =
            port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
          return String(getTemperatureSensorReadingLocal(portNum));
        }
      );

      // Handle readLDRSensor with optional port parameter
      processedExpr = processedExpr.replace(
        /readLDRSensor\s*\(([^)]*)\)/g,
        (_match, args) => {
          const port = args.trim();
          const portNum =
            port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
          return String(getLDRSensorReadingLocal(portNum));
        }
      );

      // Remove whitespace for easier parsing
      processedExpr = processedExpr.replace(/\s+/g, "");

      // Handle parentheses by evaluating inner expressions first
      // Add protection against infinite recursion or malformed expressions
      let parenIterations = 0;
      while (
        processedExpr.includes("(") &&
        processedExpr.includes(")") &&
        parenIterations < SIMULATOR_CONSTANTS.MAX_PAREN_ITERATIONS
      ) {
        parenIterations++;
        const parenMatch = processedExpr.match(/\(([^()]+)\)/);
        if (parenMatch) {
          const innerExpr = parenMatch[1];
          const innerResult = evaluateMathExpression(innerExpr);
          processedExpr = processedExpr.replace(
            `(${innerExpr})`,
            String(innerResult)
          );
        } else {
          break;
        }
      }

      if (parenIterations >= SIMULATOR_CONSTANTS.MAX_PAREN_ITERATIONS) {
        console.warn(
          `⚠️ [SIMULATOR] Math expression has too many nested parentheses or malformed expression: "${expr}"`
        );
      }

      // Evaluate arithmetic operations in order of precedence
      // First: modulo (%)
      while (processedExpr.includes("%")) {
        // Handle negative numbers: (-5) % 3 or 5 % (-3)
        const modMatch = processedExpr.match(
          /([+-]?\d+(?:\.\d+)?)\s*%\s*([+-]?\d+(?:\.\d+)?)/
        );
        if (modMatch) {
          const left = parseFloat(modMatch[1]);
          const right = parseFloat(modMatch[2]);
          const result = left % right;
          processedExpr = processedExpr.replace(modMatch[0], String(result));
        } else {
          break;
        }
      }

      // Second: multiplication and division (*, /)
      while (processedExpr.includes("*") || processedExpr.includes("/")) {
        // Handle negative numbers: (-5) * 3 or 5 / (-3)
        const mulDivMatch = processedExpr.match(
          /([+-]?\d+(?:\.\d+)?)\s*([*/])\s*([+-]?\d+(?:\.\d+)?)/
        );
        if (mulDivMatch) {
          const left = parseFloat(mulDivMatch[1]);
          const op = mulDivMatch[2];
          const right = parseFloat(mulDivMatch[3]);
          // Protect against division by zero
          if (op === "/" && right === 0) {
            console.warn(
              `⚠️ [SIMULATOR] Division by zero detected in expression: "${expr}"`
            );
            return 0; // Return 0 to prevent Infinity or NaN
          }
          const result = op === "*" ? left * right : left / right;
          processedExpr = processedExpr.replace(mulDivMatch[0], String(result));
        } else {
          break;
        }
      }

      // Third: addition and subtraction (+, -)
      while (
        processedExpr.match(/[+-]/) &&
        !processedExpr.match(/^[+-]?\d+(?:\.\d+)?$/)
      ) {
        // Handle negative numbers: (-5) + 3 or 5 - (-3)
        // Match pattern: number operator number, but avoid matching unary minus at start
        const addSubMatch = processedExpr.match(
          /([+-]?\d+(?:\.\d+)?)\s*([+-])\s*([+-]?\d+(?:\.\d+)?)/
        );
        if (addSubMatch) {
          const left = parseFloat(addSubMatch[1]);
          const op = addSubMatch[2];
          const right = parseFloat(addSubMatch[3]);
          const result = op === "+" ? left + right : left - right;
          processedExpr = processedExpr.replace(addSubMatch[0], String(result));
        } else {
          break;
        }
      }

      // Final result
      const result = parseFloat(processedExpr);
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error("Error evaluating math expression:", expr, error);
      return 0;
    }
  };

  // Enhanced condition evaluator with math, variable, and function call support
  const evaluateCondition = (condition: string): boolean => {
    // Handle boolean literals
    if (condition.trim() === "true") return true;
    if (condition.trim() === "false") return false;

    // Replace function calls with their return values
    let processedCondition = condition;
    const functionCallRegex = /\b(\w+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = functionCallRegex.exec(condition)) !== null) {
      const funcName = match[1];
      const funcArgs = match[2];

      if (funcName in executionState.current.functions) {
        // Parse and evaluate function arguments
        const parseArguments = (argString: string): string[] => {
          const args: string[] = [];
          let currentArg = "";
          let depth = 0;

          for (let i = 0; i < argString.length; i++) {
            const char = argString[i];
            if (char === "(") depth++;
            else if (char === ")") depth--;
            else if (char === "," && depth === 0) {
              args.push(currentArg.trim());
              currentArg = "";
              continue;
            }
            currentArg += char;
          }
          if (currentArg.trim()) {
            args.push(currentArg.trim());
          }
          return args;
        };

        const args = parseArguments(funcArgs);

        // Check for missing/undefined arguments
        const missingArgs: number[] = [];
        args.forEach((arg, idx) => {
          const trimmedArg = arg.trim();
          // Check if argument is empty
          if (
            trimmedArg === "" ||
            trimmedArg === undefined ||
            trimmedArg === null
          ) {
            missingArgs.push(idx);
          } else {
            // Check if it's a variable name that doesn't exist
            // Only check if it looks like a variable name (not a number, not an expression)
            if (
              /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg) &&
              !(trimmedArg in executionState.current.variables) &&
              isNaN(parseFloat(trimmedArg))
            ) {
              missingArgs.push(idx);
            }
          }
        });

        if (missingArgs.length > 0) {
          const funcDef = executionState.current.functions[funcName];
          const paramNames = missingArgs
            .map((idx) => funcDef.params[idx] || `argument ${idx + 1}`)
            .join(", ");
          const warningMsg = `Function "${funcName}" is called with missing or undefined arguments: [${paramNames}]. These will default to 0, which may cause incorrect results.`;
          console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
          // Note: showToast is not available in evaluateCondition scope, so we only log to console
        }

        const evaluatedArgs = args.map((arg) => {
          const trimmedArg = arg.trim();

          // If argument is empty or undefined, default to 0
          if (
            trimmedArg === "" ||
            trimmedArg === undefined ||
            trimmedArg === null
          ) {
            return 0;
          }

          if (!isNaN(parseFloat(trimmedArg))) {
            return parseFloat(trimmedArg);
          } else if (trimmedArg in executionState.current.variables) {
            return executionState.current.variables[trimmedArg] as number;
          } else {
            // Check if it's a variable name that doesn't exist (not a math expression)
            if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg)) {
              // It's a variable name that doesn't exist, default to 0
              return 0;
            }
            const result = evaluateMathExpression(trimmedArg);
            // If evaluation resulted in NaN, default to 0
            return isNaN(result) ? 0 : result;
          }
        });

        const funcDef = executionState.current.functions[funcName];
        const returnMatch = funcDef.body.match(/return\s+(.+);?/);
        if (returnMatch) {
          let returnExpr = returnMatch[1].trim();
          funcDef.params.forEach((param, idx) => {
            const paramRegex = new RegExp(`\\b${param}\\b`, "g");
            returnExpr = returnExpr.replace(
              paramRegex,
              String(evaluatedArgs[idx] || 0)
            );
          });
          const funcResult = evaluateMathExpression(returnExpr);
          processedCondition = processedCondition.replace(
            match[0],
            String(funcResult)
          );
        } else {
          processedCondition = processedCondition.replace(match[0], "0");
        }
      }
    }

    // Replace variable references in condition
    const varNames = Object.keys(executionState.current.variables);
    for (const varName of varNames) {
      const varValue = executionState.current.variables[varName];
      const varRegex = new RegExp(`\\b${varName}\\b`, "g");
      if (typeof varValue === "boolean") {
        processedCondition = processedCondition.replace(
          varRegex,
          varValue ? "true" : "false"
        );
      } else if (typeof varValue === "number") {
        processedCondition = processedCondition.replace(
          varRegex,
          String(varValue)
        );
      }
    }

    // Use processed condition for evaluation
    condition = processedCondition;

    // Helper function to parse sensor function call and get reading
    const parseSensorCall = (sensorCall: string): number | boolean | null => {
      // Ultrasonic sensor
      const ultrasonicMatch = sensorCall.match(
        /readUltrasonicSensor\s*\(([^)]*)\)/
      );
      if (ultrasonicMatch) {
        const port = ultrasonicMatch[1].trim();
        const portNum =
          port === ""
            ? undefined
            : isNaN(parseFloat(port))
            ? 1
            : parseFloat(port);
        return getSensorReading(portNum);
      }

      // IR sensor (returns boolean, convert to number for math operations)
      const irMatch = sensorCall.match(/readIRSensor\s*\(([^)]*)\)/);
      if (irMatch) {
        const port = irMatch[1].trim();
        const portNum =
          port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
        return getIRSensorReadingLocal(portNum) ? 1 : 0;
      }

      // Temperature sensor
      const tempMatch = sensorCall.match(/readTemperatureSensor\s*\(([^)]*)\)/);
      if (tempMatch) {
        const port = tempMatch[1].trim();
        const portNum =
          port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
        return getTemperatureSensorReadingLocal(portNum);
      }

      // LDR sensor
      const ldrMatch = sensorCall.match(/readLDRSensor\s*\(([^)]*)\)/);
      if (ldrMatch) {
        const port = ldrMatch[1].trim();
        const portNum =
          port === "" ? 1 : isNaN(parseFloat(port)) ? 1 : parseFloat(port);
        return getLDRSensorReadingLocal(portNum);
      }

      return null;
    };

    // Handle sensor comparisons with math: readUltrasonicSensor(1) + 10 < 50
    const sensorMathMatch = condition.match(
      /(read\w+Sensor\s*\([^)]*\))\s*([+\-*/%])\s*(\d+(?:\.\d+)?)\s*([<>]?=?)\s*(\d+(?:\.\d+)?)/
    );
    if (sensorMathMatch) {
      const sensorCall = sensorMathMatch[1];
      const reading = parseSensorCall(sensorCall);
      if (reading !== null) {
        const mathOp = sensorMathMatch[2];
        const mathVal = parseFloat(sensorMathMatch[3]);
        const compOp = sensorMathMatch[4];
        const compVal = parseFloat(sensorMathMatch[5]);

        const numReading =
          typeof reading === "boolean" ? (reading ? 1 : 0) : reading;
        let mathResult = numReading;
        if (mathOp === "+") mathResult = numReading + mathVal;
        else if (mathOp === "-") mathResult = numReading - mathVal;
        else if (mathOp === "*") mathResult = numReading * mathVal;
        else if (mathOp === "/") mathResult = numReading / mathVal;
        else if (mathOp === "%") mathResult = numReading % mathVal;

        if (compOp === ">=") return mathResult >= compVal;
        if (compOp === "<=") return mathResult <= compVal;
        if (compOp === ">") return mathResult > compVal;
        if (compOp === "<") return mathResult < compVal;
        if (compOp === "==") return mathResult === compVal;
        if (compOp === "!=") return mathResult !== compVal;
        return mathResult < compVal;
      }
    }

    // Handle simple sensor comparisons: readUltrasonicSensor(1) < 20 or readIRSensor(1) == 1
    const sensorMatch = condition.match(
      /(read\w+Sensor\s*\([^)]*\))\s*([<>]?=?)\s*(\d+(?:\.\d+)?)/
    );
    if (sensorMatch) {
      const sensorCall = sensorMatch[1];
      const reading = parseSensorCall(sensorCall);
      if (reading !== null) {
        const op = sensorMatch[2];
        const val = parseFloat(sensorMatch[3]);
        const numReading =
          typeof reading === "boolean" ? (reading ? 1 : 0) : reading;
        if (op === ">=") return numReading >= val;
        if (op === "<=") return numReading <= val;
        if (op === ">") return numReading > val;
        if (op === "<") return numReading < val;
        if (op === "==") return numReading === val;
        if (op === "!=") return numReading !== val;
        return numReading < val;
      }
    }

    // Handle boolean sensor comparisons: readIRSensor(1) (for direct boolean checks)
    const booleanSensorMatch = condition.match(/readIRSensor\s*\([^)]*\)/);
    if (booleanSensorMatch) {
      const sensorCall = booleanSensorMatch[0];
      const reading = parseSensorCall(sensorCall);
      if (reading !== null) {
        return typeof reading === "boolean" ? reading : reading > 0;
      }
    }

    // Handle math expressions in comparisons: (5 + 3) > 7, (10 * 2) < 25
    const mathComparisonMatch = condition.match(
      /\(([^)]+)\)\s*([<>]?=?)\s*(\d+(?:\.\d+)?)/
    );
    if (mathComparisonMatch) {
      const mathExpr = mathComparisonMatch[1];
      const op = mathComparisonMatch[2];
      const val = parseFloat(mathComparisonMatch[3]);
      const mathResult = evaluateMathExpression(mathExpr);

      if (op === ">=") return mathResult >= val;
      if (op === "<=") return mathResult <= val;
      if (op === ">") return mathResult > val;
      if (op === "<") return mathResult < val;
      if (op === "==") return mathResult === val;
      if (op === "!=") return mathResult !== val;
      return mathResult < val;
    }

    // Handle math expressions on both sides: (5 + 3) > (2 * 2)
    const bothSidesMatch = condition.match(
      /\(([^)]+)\)\s*([<>]?=?)\s*\(([^)]+)\)/
    );
    if (bothSidesMatch) {
      const leftExpr = bothSidesMatch[1];
      const op = bothSidesMatch[2];
      const rightExpr = bothSidesMatch[3];
      const leftResult = evaluateMathExpression(leftExpr);
      const rightResult = evaluateMathExpression(rightExpr);

      if (op === ">=") return leftResult >= rightResult;
      if (op === "<=") return leftResult <= rightResult;
      if (op === ">") return leftResult > rightResult;
      if (op === "<") return leftResult < rightResult;
      if (op === "==") return leftResult === rightResult;
      if (op === "!=") return leftResult !== rightResult;
      return leftResult < rightResult;
    }

    // Handle simple numeric comparisons: 5 > 3, 10 <= 20
    const simpleComparisonMatch = condition.match(
      /(\d+(?:\.\d+)?)\s*([<>]?=?)\s*(\d+(?:\.\d+)?)/
    );
    if (simpleComparisonMatch) {
      const left = parseFloat(simpleComparisonMatch[1]);
      const op = simpleComparisonMatch[2];
      const right = parseFloat(simpleComparisonMatch[3]);
      if (op === ">=") return left >= right;
      if (op === "<=") return left <= right;
      if (op === ">") return left > right;
      if (op === "<") return left < right;
      if (op === "==") return left === right;
      if (op === "!=") return left !== right;
      return left === right;
    }

    // Handle modulo checks: (5 % 2) === 0 (for even/odd checks)
    const moduloCheckMatch = condition.match(
      /\((\d+(?:\.\d+)?)\s*%\s*(\d+(?:\.\d+)?)\)\s*(===|!==|==|!=)\s*(\d+)/
    );
    if (moduloCheckMatch) {
      const left = parseFloat(moduloCheckMatch[1]);
      const right = parseFloat(moduloCheckMatch[2]);
      const op = moduloCheckMatch[3];
      const expected = parseFloat(moduloCheckMatch[4]);
      const result = left % right;

      if (op === "===" || op === "==") return result === expected;
      if (op === "!==" || op === "!=") return result !== expected;
      return result === expected;
    }

    return false;
  };

  const parseCodeToFunctions = useCallback(
    (code: string, depth: number = 0): (() => Promise<void>)[] => {
      try {
        // Check recursion depth
        if (depth > executionState.current.maxRecursionDepth) {
          console.warn(
            `⚠️ [SIMULATOR] Maximum recursion depth (${executionState.current.maxRecursionDepth}) exceeded`
          );
          showToast(
            `Maximum recursion depth exceeded. Check for infinite recursion.`,
            "warning"
          );
          return [];
        }

        const lines = code
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#") && !l.startsWith("//"));
        const functionQueue: (() => Promise<void>)[] = [];

        let i = 0;
        while (i < lines.length) {
          const line = lines[i];

          // Skip empty lines
          if (!line) {
            i++;
            continue;
          }

          if (line.startsWith("moveForward")) {
            functionQueue.push(
              () =>
                new Promise((resolve) => {
                  moveForward();
                  setTimeout(resolve, 500);
                })
            );
          } else if (line.startsWith("moveBackward")) {
            functionQueue.push(
              () =>
                new Promise((resolve) => {
                  moveBackward();
                  setTimeout(resolve, 500);
                })
            );
          } else if (line.startsWith("turnLeft")) {
            functionQueue.push(
              () =>
                new Promise((resolve) => {
                  turnLeft();
                  setTimeout(resolve, 500);
                })
            );
          } else if (line.startsWith("turnRight")) {
            functionQueue.push(
              () =>
                new Promise((resolve) => {
                  turnRight();
                  setTimeout(resolve, 500);
                })
            );
          } else if (line.startsWith("stopMovement")) {
            functionQueue.push(() => new Promise(() => stopMovement()));
          } else if (line.startsWith("wait")) {
            const time =
              parseFloat(line.match(/\(([^)]+)\)/)?.[1] || "1") * 1000;
            functionQueue.push(
              () => new Promise((resolve) => setTimeout(resolve, time))
            );
          }

          // Handle function definitions: function circle() { ... }
          else if (line.match(/^function\s+(\w+)\s*\([^)]*\)\s*{/)) {
            const funcMatch = line.match(/^function\s+(\w+)\s*\([^)]*\)\s*{/);
            if (funcMatch) {
              const funcName = funcMatch[1];
              const funcBodyLines: string[] = [];
              i++; // Move past function declaration line
              // Collect function body until closing brace
              let braceCount = 1; // Start with 1 for the opening brace
              while (i < lines.length && braceCount > 0) {
                const bodyLine = lines[i];
                // Count braces to handle nested blocks
                const openBraces = (bodyLine.match(/{/g) || []).length;
                const closeBraces = (bodyLine.match(/}/g) || []).length;
                braceCount += openBraces - closeBraces;

                if (braceCount > 0) {
                  funcBodyLines.push(bodyLine);
                }
                i++;
              }
              // Extract function parameters from definition
              const paramMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
              const params: string[] =
                paramMatch && paramMatch[1]
                  ? paramMatch[1]
                      .split(",")
                      .map((p) => p.trim())
                      .filter((p) => p)
                  : [];

              // Warn if function is being redefined
              if (funcName in executionState.current.functions) {
                console.warn(
                  `⚠️ [SIMULATOR] Function "${funcName}" is being redefined. Previous definition will be overwritten.`
                );
                showToast(
                  `Function "${funcName}" is being redefined. Previous definition will be overwritten.`,
                  "warning"
                );
              }

              // Check for parameter mismatch in return statement
              const funcBody = funcBodyLines.join("\n");
              const returnMatch = funcBody.match(/return\s+(.+);?/);
              if (returnMatch && params.length > 0) {
                const returnExpr = returnMatch[1].trim();

                // Extract all variable names from return expression (simple identifiers)
                // Match word boundaries to avoid matching parts of other words
                const variableRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
                const usedVariables = new Set<string>();
                let match;
                while ((match = variableRegex.exec(returnExpr)) !== null) {
                  const varName = match[1];
                  // Skip known keywords and function calls
                  if (
                    ![
                      "return",
                      "true",
                      "false",
                      "if",
                      "else",
                      "for",
                      "while",
                      "var",
                      "let",
                      "const",
                    ].includes(varName) &&
                    !varName.match(/^\d+$/)
                  ) {
                    usedVariables.add(varName);
                  }
                }

                // Check if any used variables are not in the parameter list
                const unusedParams = params.filter(
                  (p) => !usedVariables.has(p)
                );
                const undefinedVars = Array.from(usedVariables).filter(
                  (v) => !params.includes(v)
                );

                if (undefinedVars.length > 0) {
                  const warningMsg = `Function "${funcName}" uses variables [${undefinedVars.join(
                    ", "
                  )}] in return statement, but parameters are [${params.join(
                    ", "
                  )}]. This may cause incorrect results.`;
                  console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                  showToast(warningMsg, "warning");
                } else if (unusedParams.length > 0 && usedVariables.size > 0) {
                  // Some parameters are not used (less critical, but still worth noting)
                  const infoMsg = `Function "${funcName}" has unused parameters: [${unusedParams.join(
                    ", "
                  )}]`;
                  console.log(`ℹ️ [SIMULATOR] ${infoMsg}`);
                }
              }

              // Store function definition with parameters
              executionState.current.functions[funcName] = {
                body: funcBody,
                params: params,
              };
              console.log(
                `📦 [SIMULATOR] Function defined: ${funcName}(${params.join(
                  ", "
                )})`
              );
              continue; // Don't increment i again, we already did in the loop
            }
          }

          // Handle function calls: circle() or addWith(4, 5)
          else if (line.match(/^(\w+)\s*\([^)]*\)\s*;?$/)) {
            const callMatch = line.match(/^(\w+)\s*\([^)]*\)\s*;?$/);
            if (callMatch) {
              const funcName = callMatch[1];
              // Check if it's a known function
              if (funcName in executionState.current.functions) {
                console.log(`📞 [SIMULATOR] Calling function: ${funcName}()`);

                // Check queue size
                if (
                  executionState.current.queueSize >=
                  executionState.current.maxQueueSize
                ) {
                  console.warn(
                    `⚠️ [SIMULATOR] Maximum queue size (${executionState.current.maxQueueSize}) reached`
                  );
                  showToast(
                    `Maximum queue size exceeded. Code may be too complex.`,
                    "warning"
                  );
                  break;
                }

                // Inline the function body
                const funcDef = executionState.current.functions[funcName];

                // Check for empty function body
                if (!funcDef.body || funcDef.body.trim() === "") {
                  console.warn(
                    `⚠️ [SIMULATOR] Function ${funcName} has empty body, skipping call`
                  );
                } else {
                  // Increment recursion depth
                  executionState.current.recursionDepth++;
                  const inlinedFunctions = parseCodeToFunctions(
                    funcDef.body,
                    depth + 1
                  );
                  executionState.current.recursionDepth--;

                  // Add all inlined functions to the queue
                  for (const func of inlinedFunctions) {
                    executionState.current.queueSize++;
                    functionQueue.push(func);
                  }
                }
              } else {
                // Unknown function call - check if it's a user-defined function that's missing
                const isUserDefined = Object.keys(
                  executionState.current.functions
                ).some((f) => f.toLowerCase() === funcName.toLowerCase());
                if (isUserDefined) {
                  const warningMsg = `Function "${funcName}" is called but not yet defined. Make sure the function definition comes before the call.`;
                  console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                  showToast(warningMsg, "warning");
                } else {
                  // Unknown function call - skip it (could be a built-in or undefined function)
                  console.warn(
                    `⚠️ [SIMULATOR] Unknown function call: ${funcName}() - this call will be skipped`
                  );
                }
              }
            }
          }

          // Handle variable assignments: var x = 5; or let count = 0; or const value = 10;
          // Also handle reassignments: x = 5; (without var/let/const)
          else if (
            line.match(/^(var|let|const)\s+(\w+)\s*=\s*(.+);?$/) ||
            line.match(/^(\w+)\s*=\s*(.+);?$/)
          ) {
            const declMatch = line.match(
              /^(var|let|const)\s+(\w+)\s*=\s*(.+);?$/
            );
            const reassignMatch = line.match(/^(\w+)\s*=\s*(.+);?$/);

            let varName: string;
            let varValue: string;

            if (declMatch) {
              // New variable declaration
              varName = declMatch[2];
              varValue = declMatch[3].trim();
              const isConst = declMatch[1] === "const";

              // Track const variables
              if (isConst) {
                executionState.current.constVariables.add(varName);
              }

              // Track variable usage
              if (!executionState.current.variableUsage[varName]) {
                executionState.current.variableUsage[varName] = {
                  assigned: false,
                  used: false,
                };
              }
              executionState.current.variableUsage[varName].assigned = true;
              executionState.current.variableUsage[varName].line = i;
            } else if (reassignMatch) {
              // Variable reassignment (must be existing variable)
              varName = reassignMatch[1];
              varValue = reassignMatch[2].trim();

              // Check if trying to reassign const variable
              if (executionState.current.constVariables.has(varName)) {
                const warningMsg = `Cannot reassign constant variable "${varName}". Const variables cannot be changed after declaration.`;
                console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                showToast(warningMsg, "warning");
                i++;
                continue;
              }

              // Check if variable exists
              if (!(varName in executionState.current.variables)) {
                // Check if variable is used before assignment
                const warningMsg = `Variable "${varName}" is used before it's assigned a value. This may cause incorrect results.`;
                console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                showToast(warningMsg, "warning");
                // Still continue to allow the assignment
              }
            } else {
              i++;
              continue;
            }

            // Remove trailing semicolon if present
            varValue = varValue.replace(/;$/, "");

            console.log(
              `🔍 [SIMULATOR] Parsing variable assignment: ${varName} = "${varValue}"`
            );

            // Evaluate the value (could be number, math expression, function call, or sensor call)
            let evaluatedValue: number | boolean;

            // Check if it's a boolean
            if (varValue === "true") {
              evaluatedValue = true;
              console.log(`🔍 [SIMULATOR] Evaluated as boolean: true`);
            } else if (varValue === "false") {
              evaluatedValue = false;
              console.log(`🔍 [SIMULATOR] Evaluated as boolean: false`);
            } else if (varValue.match(/^\w+\s*\([^)]*\)$/)) {
              // It's a function call like add(4, 8) - need to execute it
              const funcCallMatch = varValue.match(/^(\w+)\s*\(([^)]*)\)$/);
              if (funcCallMatch) {
                const funcName = funcCallMatch[1];
                const funcArgs = funcCallMatch[2];
                console.log(
                  `🔍 [SIMULATOR] Detected function call: ${funcName}(${funcArgs})`
                );

                // Check if function exists
                if (funcName in executionState.current.functions) {
                  // Get function definition
                  const funcDef = executionState.current.functions[funcName];

                  // Parse function arguments properly (handles nested function calls and expressions)
                  const parseArguments = (argString: string): string[] => {
                    const args: string[] = [];
                    let currentArg = "";
                    let depth = 0;

                    for (let i = 0; i < argString.length; i++) {
                      const char = argString[i];
                      if (char === "(") depth++;
                      else if (char === ")") depth--;
                      else if (char === "," && depth === 0) {
                        args.push(currentArg.trim());
                        currentArg = "";
                        continue;
                      }
                      currentArg += char;
                    }
                    if (currentArg.trim()) {
                      args.push(currentArg.trim());
                    }
                    return args;
                  };

                  const args = parseArguments(funcArgs);

                  // Check argument count mismatch
                  const expectedArgs = funcDef.params.length;
                  const receivedArgs = args.length;
                  if (receivedArgs !== expectedArgs) {
                    const warningMsg = `Function "${funcName}" expects ${expectedArgs} argument(s) but received ${receivedArgs}. This may cause incorrect results.`;
                    console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                    showToast(warningMsg, "warning");
                  }

                  // Check for missing/undefined arguments
                  const missingArgs: number[] = [];
                  args.forEach((arg, idx) => {
                    const trimmedArg = arg.trim();
                    // Check if argument is empty
                    if (
                      trimmedArg === "" ||
                      trimmedArg === undefined ||
                      trimmedArg === null
                    ) {
                      missingArgs.push(idx);
                    } else {
                      // Check if it's a variable name that doesn't exist
                      // Only check if it looks like a variable name (not a number, not an expression)
                      if (
                        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg) &&
                        !(trimmedArg in executionState.current.variables) &&
                        isNaN(parseFloat(trimmedArg))
                      ) {
                        missingArgs.push(idx);
                      }
                    }
                  });

                  if (missingArgs.length > 0) {
                    const paramNames = missingArgs
                      .map(
                        (idx) => funcDef.params[idx] || `argument ${idx + 1}`
                      )
                      .join(", ");
                    const warningMsg = `Function "${funcName}" is called with missing or undefined arguments: [${paramNames}]. These will default to 0, which may cause incorrect results.`;
                    console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
                    showToast(warningMsg, "warning");
                  }

                  const evaluatedArgs = args.map((arg) => {
                    // Check if it's a function call
                    if (arg.match(/^\w+\s*\([^)]*\)$/)) {
                      const nestedCallMatch = arg.match(
                        /^(\w+)\s*\(([^)]*)\)$/
                      );
                      if (
                        nestedCallMatch &&
                        nestedCallMatch[1] in executionState.current.functions
                      ) {
                        // Recursively evaluate nested function call
                        const nestedFuncName = nestedCallMatch[1];
                        const nestedFuncArgs = nestedCallMatch[2];
                        const nestedArgs = parseArguments(nestedFuncArgs);
                        const nestedEvaluatedArgs = nestedArgs.map(
                          (nestedArg) => {
                            if (!isNaN(parseFloat(nestedArg))) {
                              return parseFloat(nestedArg);
                            } else if (
                              nestedArg in executionState.current.variables
                            ) {
                              return executionState.current.variables[
                                nestedArg
                              ];
                            } else {
                              return evaluateMathExpression(nestedArg);
                            }
                          }
                        );

                        const nestedFuncDef =
                          executionState.current.functions[nestedFuncName];
                        const nestedReturnMatch =
                          nestedFuncDef.body.match(/return\s+(.+);?/);
                        if (nestedReturnMatch) {
                          let nestedReturnExpr = nestedReturnMatch[1].trim();
                          // Replace parameters
                          nestedFuncDef.params.forEach((param, idx) => {
                            const paramRegex = new RegExp(
                              `\\b${param}\\b`,
                              "g"
                            );
                            nestedReturnExpr = nestedReturnExpr.replace(
                              paramRegex,
                              String(nestedEvaluatedArgs[idx] || 0)
                            );
                          });
                          return evaluateMathExpression(nestedReturnExpr);
                        }
                        return 0;
                      }
                    }
                    // Try to evaluate each argument (could be number, variable, or expression)
                    const trimmedArg = arg.trim();

                    // If argument is empty or undefined, default to 0
                    if (
                      trimmedArg === "" ||
                      trimmedArg === undefined ||
                      trimmedArg === null
                    ) {
                      return 0;
                    }

                    if (!isNaN(parseFloat(trimmedArg))) {
                      return parseFloat(trimmedArg);
                    } else if (trimmedArg in executionState.current.variables) {
                      return executionState.current.variables[
                        trimmedArg
                      ] as number;
                    } else {
                      // Check if it's a variable name that doesn't exist (not a math expression)
                      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg)) {
                        // It's a variable name that doesn't exist, default to 0
                        return 0;
                      }
                      const result = evaluateMathExpression(trimmedArg);
                      // If evaluation resulted in NaN, default to 0
                      return isNaN(result) ? 0 : result;
                    }
                  });

                  console.log(
                    `🔍 [SIMULATOR] Function arguments evaluated:`,
                    evaluatedArgs
                  );

                  // Get function definition and execute it with arguments (already have funcDef above)
                  // For return statements, we need to evaluate the return expression
                  const returnMatch = funcDef.body.match(/return\s+(.+);?/);
                  if (returnMatch) {
                    let returnExpr = returnMatch[1].trim();
                    // Replace function parameters with actual values using actual parameter names
                    funcDef.params.forEach((param: string, idx: number) => {
                      const paramRegex = new RegExp(`\\b${param}\\b`, "g");
                      returnExpr = returnExpr.replace(
                        paramRegex,
                        String(evaluatedArgs[idx] || 0)
                      );
                    });
                    console.log(
                      `🔍 [SIMULATOR] Evaluating return expression: "${returnExpr}"`
                    );
                    evaluatedValue = evaluateMathExpression(returnExpr);
                    console.log(
                      `🔍 [SIMULATOR] Function return value: ${evaluatedValue}`
                    );
                  } else {
                    // No return statement, default to 0
                    evaluatedValue = 0;
                  }
                } else {
                  console.warn(
                    `⚠️ [SIMULATOR] Function ${funcName} not found, evaluating as math expression`
                  );
                  evaluatedValue = evaluateMathExpression(varValue);
                }
              }
            } else {
              // Check if it's wrapped in parentheses (math expression)
              if (varValue.startsWith("(") && varValue.endsWith(")")) {
                // Extract the expression inside parentheses
                const mathExpr = varValue.slice(1, -1);
                console.log(
                  `🔍 [SIMULATOR] Evaluating math expression in parentheses: "${mathExpr}"`
                );
                evaluatedValue = evaluateMathExpression(mathExpr);
                console.log(
                  `🔍 [SIMULATOR] Math expression result: ${evaluatedValue}`
                );
              } else {
                // Evaluate as math expression (handles numbers, math ops, sensor calls, variables)
                console.log(
                  `🔍 [SIMULATOR] Evaluating as math expression: "${varValue}"`
                );
                evaluatedValue = evaluateMathExpression(varValue);
                console.log(
                  `🔍 [SIMULATOR] Math expression result: ${evaluatedValue}`
                );
              }
            }

            // Store variable
            const varAssignment = () => {
              executionState.current.variables[varName] = evaluatedValue;
              console.log(
                `📝 [SIMULATOR] Variable assigned: ${varName} = ${evaluatedValue}`
              );
            };
            functionQueue.push(() => Promise.resolve(varAssignment()));
          }

          // Handle if and if-else statements
          else if (line.match(/if \((.*)\)/)) {
            const condition = line.match(/if \((.*)\)/)?.[1] || "false";

            const ifBodyLines: string[] = [];
            i++;
            // Scan for closing brace '}' to find end of if block
            while (i < lines.length && lines[i] !== "}") {
              ifBodyLines.push(lines[i]);
              i++;
            }

            // Check if there's an else block after the closing brace
            const elseBodyLines: string[] = [];
            if (
              i + 1 < lines.length &&
              lines[i + 1].trim().startsWith("else")
            ) {
              i += 2; // Skip "}" and "else {" lines
              while (i < lines.length && lines[i] !== "}") {
                elseBodyLines.push(lines[i]);
                i++;
              }
            }

            const ifBodyFunctions = parseCodeToFunctions(
              ifBodyLines.join("\n"),
              depth
            );
            const elseBodyFunctions = parseCodeToFunctions(
              elseBodyLines.join("\n"),
              depth
            );

            // Use the enhanced condition evaluator with math support
            const checkCondition = () => evaluateCondition(condition);

            const ifFunction = async () => {
              // Execute if body if condition is true
              if (checkCondition()) {
                for (const func of ifBodyFunctions) {
                  if (!executionState.current.isRunning) break;
                  await func();
                }
              } else if (elseBodyFunctions.length > 0) {
                // Execute else body if condition is false and else block exists
                for (const func of elseBodyFunctions) {
                  if (!executionState.current.isRunning) break;
                  await func();
                }
              }
            };

            functionQueue.push(ifFunction);
          } else if (line.match(/for\s*\([^)]*\w+\s*<\s*[^;)]+/)) {
            // Handle for loops with variable, literal, math expression, or function call count
            // Match: for (let count = 0; count < VALUE; count++)
            // Also matches: for (let count2 = 0; count2 < VALUE; count2++)
            // VALUE can be: number, variable, math expression like (4 + 5), or function call like add(4, 8)
            // Blockly's controls_repeat_ext may also use: for (let count = 0; count < repeat_end; count++)
            // Need to properly extract the value after <, handling nested parentheses and function calls
            let countValue = "";
            let repeatCount = 0;
            let isVariableReference = false;

            // Extract the part after "< " and before ";"
            // Handle nested parentheses and function calls properly
            // Find the position of "<" that comes after a variable name (like count, count2, etc.)
            // Match pattern: for (let VAR = 0; VAR < VALUE; VAR++)
            // First, try to find the variable name used in the loop
            const varMatch = line.match(/for\s*\([^)]*(\w+)\s*=\s*\d+\s*;/);
            if (varMatch) {
              const loopVar = varMatch[1]; // e.g., "count" or "count2"
              // Now find where this variable is used with "<"
              const varLessThanPattern = new RegExp(`${loopVar}\\s*<\\s*`);
              const varLessThanIndex = line.search(varLessThanPattern);

              if (varLessThanIndex !== -1) {
                // Start from after the variable name and "<"
                let startPos = varLessThanIndex + loopVar.length;
                // Find the "<"
                while (startPos < line.length && line[startPos] !== "<") {
                  startPos++;
                }
                startPos++; // Skip the "<"

                // Skip whitespace
                while (startPos < line.length && /\s/.test(line[startPos])) {
                  startPos++;
                }

                // Now parse until we find the semicolon, handling nested parentheses
                let endPos = startPos;
                let depth = 0;
                while (endPos < line.length) {
                  const char = line[endPos];
                  if (char === "(") depth++;
                  else if (char === ")") depth--;
                  else if (char === ";" && depth === 0) break;
                  endPos++;
                }

                countValue = line.substring(startPos, endPos).trim();
              }
            }

            // Fallback: if we couldn't extract using the variable name, try generic approach
            if (!countValue) {
              const lessThanIndex = line.indexOf("<");
              if (lessThanIndex !== -1) {
                // Start from after "<"
                let startPos = lessThanIndex + 1;
                // Skip whitespace
                while (startPos < line.length && /\s/.test(line[startPos])) {
                  startPos++;
                }

                // Now parse until we find the semicolon, handling nested parentheses
                let endPos = startPos;
                let depth = 0;
                while (endPos < line.length) {
                  const char = line[endPos];
                  if (char === "(") depth++;
                  else if (char === ")") depth--;
                  else if (char === ";" && depth === 0) break;
                  endPos++;
                }

                countValue = line.substring(startPos, endPos).trim();
              }
            }

            if (countValue) {
              console.log(
                `🔍 [SIMULATOR] For loop detected. Count value: "${countValue}"`
              );

              // Check if it's a function call first (e.g., add(4, 8))
              if (countValue.match(/^\w+\s*\([^)]*\)$/)) {
                const funcCallMatch = countValue.match(/^(\w+)\s*\(([^)]*)\)$/);
                if (funcCallMatch) {
                  const funcName = funcCallMatch[1];
                  const funcArgs = funcCallMatch[2];

                  // Check if function exists
                  if (funcName in executionState.current.functions) {
                    const funcDef = executionState.current.functions[funcName];

                    // Parse function arguments
                    const parseArguments = (argString: string): string[] => {
                      const args: string[] = [];
                      let currentArg = "";
                      let depth = 0;

                      for (let i = 0; i < argString.length; i++) {
                        const char = argString[i];
                        if (char === "(") depth++;
                        else if (char === ")") depth--;
                        else if (char === "," && depth === 0) {
                          args.push(currentArg.trim());
                          currentArg = "";
                          continue;
                        }
                        currentArg += char;
                      }
                      if (currentArg.trim()) {
                        args.push(currentArg.trim());
                      }
                      return args;
                    };

                    const args = parseArguments(funcArgs);
                    const evaluatedArgs = args.map((arg) => {
                      const trimmedArg = arg.trim();
                      if (
                        trimmedArg === "" ||
                        trimmedArg === undefined ||
                        trimmedArg === null
                      ) {
                        return 0;
                      }
                      if (!isNaN(parseFloat(trimmedArg))) {
                        return parseFloat(trimmedArg);
                      } else if (
                        trimmedArg in executionState.current.variables
                      ) {
                        return executionState.current.variables[
                          trimmedArg
                        ] as number;
                      } else {
                        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedArg)) {
                          return 0;
                        }
                        const result = evaluateMathExpression(trimmedArg);
                        return isNaN(result) ? 0 : result;
                      }
                    });

                    // Get return value from function
                    const returnMatch = funcDef.body.match(/return\s+(.+);?/);
                    if (returnMatch) {
                      let returnExpr = returnMatch[1].trim();
                      funcDef.params.forEach((param, idx) => {
                        const paramRegex = new RegExp(`\\b${param}\\b`, "g");
                        returnExpr = returnExpr.replace(
                          paramRegex,
                          String(evaluatedArgs[idx] || 0)
                        );
                      });
                      repeatCount = Math.floor(
                        evaluateMathExpression(returnExpr)
                      );
                      console.log(
                        `🔍 [SIMULATOR] Function call "${funcName}(${funcArgs})" evaluated to: ${repeatCount}`
                      );
                    } else {
                      repeatCount = 0;
                      console.warn(
                        `⚠️ [SIMULATOR] Function "${funcName}" has no return statement, defaulting to 0`
                      );
                    }
                  } else {
                    // Function doesn't exist, try to evaluate as math expression
                    console.warn(
                      `⚠️ [SIMULATOR] Function "${funcName}" not found, attempting to evaluate as expression`
                    );
                    repeatCount = Math.floor(
                      evaluateMathExpression(countValue)
                    );
                  }
                }
              }
              // Check if it's wrapped in parentheses (math expression)
              else if (countValue.startsWith("(") && countValue.endsWith(")")) {
                // Extract the expression inside parentheses
                const mathExpr = countValue.slice(1, -1);
                console.log(
                  `🔍 [SIMULATOR] Evaluating math expression: "${mathExpr}"`
                );
                repeatCount = Math.floor(evaluateMathExpression(mathExpr));
                console.log(
                  `🔍 [SIMULATOR] Math expression result: ${repeatCount}`
                );
              } else if (!isNaN(parseFloat(countValue))) {
                // It's a number - evaluate immediately
                // It's a number
                repeatCount = parseInt(countValue) || 0;
                console.log(
                  `🔍 [SIMULATOR] Using literal number: ${repeatCount}`
                );
              } else {
                // Check if it's a variable name (alphanumeric + underscore)
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(countValue)) {
                  // Always mark as variable reference for lazy evaluation
                  // This ensures we re-evaluate at execution time, even if variable exists during parsing
                  // (because it might be set to 0 initially and then updated later)
                  isVariableReference = true;
                  if (countValue in executionState.current.variables) {
                    const varValue =
                      executionState.current.variables[countValue];
                    repeatCount =
                      typeof varValue === "number"
                        ? varValue
                        : parseInt(String(varValue)) || 0;
                    console.log(
                      `🔍 [SIMULATOR] Variable "${countValue}" found during parsing = ${repeatCount}, but will re-evaluate at execution time`
                    );
                  } else {
                    console.log(
                      `🔍 [SIMULATOR] Variable "${countValue}" not found yet - will evaluate at execution time`
                    );
                    repeatCount = 0; // Will be re-evaluated at execution time
                  }
                } else {
                  // Try to evaluate as math expression (might contain variables or be a complex expression)
                  console.log(
                    `🔍 [SIMULATOR] Attempting to evaluate as math expression: "${countValue}"`
                  );
                  repeatCount = Math.floor(evaluateMathExpression(countValue));
                  console.log(
                    `🔍 [SIMULATOR] Math expression result: ${repeatCount}`
                  );
                }
              }
            } else {
              console.warn(
                `⚠️ [SIMULATOR] For loop pattern matched but couldn't extract count value from: "${line}"`
              );
            }

            const MAX_LOOPS = 1000;
            const MIN_LOOPS = 0;

            // Protect against negative loop counts
            if (repeatCount < MIN_LOOPS) {
              console.warn(
                `⚠️ [SIMULATOR] Negative loop count detected: ${repeatCount}, setting to 0`
              );
              repeatCount = 0;
            }

            // Protect against excessive loop counts
            if (repeatCount > MAX_LOOPS) {
              showToast(`Loop should be less than ${MAX_LOOPS}.`, "warning");
              repeatCount = MAX_LOOPS;
            }

            const loopBodyLines = [];
            i++;
            // Scan for closing brace '}' to find end of loop
            // Add protection against infinite loop if closing brace is missing
            let scanIterations = 0;
            while (
              i < lines.length &&
              lines[i] !== "}" &&
              scanIterations < SIMULATOR_CONSTANTS.MAX_SCAN_ITERATIONS
            ) {
              scanIterations++;
              loopBodyLines.push(lines[i]);
              i++;
            }

            if (scanIterations >= SIMULATOR_CONSTANTS.MAX_SCAN_ITERATIONS) {
              console.warn(
                `⚠️ [SIMULATOR] For loop body scanning exceeded max iterations, possible missing closing brace`
              );
              showToast(
                "Warning: Loop may be missing closing brace. Check your code structure.",
                "warning"
              );
            }

            // Check for empty loop body
            const loopBodyCode = loopBodyLines.join("\n").trim();
            if (!loopBodyCode || loopBodyCode === "") {
              const warningMsg =
                "Loop has an empty body. This loop will do nothing.";
              console.warn(`⚠️ [SIMULATOR] ${warningMsg}`);
              showToast(warningMsg, "warning");
            }

            const bodyFunctions = parseCodeToFunctions(
              loopBodyLines.join("\n"),
              depth
            );

            const loopBlock = async () => {
              // Re-evaluate the count at execution time (in case variable was set during execution)
              let finalRepeatCount = repeatCount;

              // If it was a variable reference, look it up at execution time
              // Wait for the variable to be set if it's not available yet
              if (isVariableReference && countValue) {
                // Retry mechanism: wait for variable to be set (up to 10 attempts with 10ms delay)
                let attempts = 0;
                const maxAttempts = 10;
                while (
                  attempts < maxAttempts &&
                  !(countValue in executionState.current.variables)
                ) {
                  await new Promise((resolve) => setTimeout(resolve, 10));
                  attempts++;
                }

                if (countValue in executionState.current.variables) {
                  const varValue = executionState.current.variables[countValue];
                  finalRepeatCount =
                    typeof varValue === "number"
                      ? varValue
                      : parseInt(String(varValue)) || 0;
                  console.log(
                    `🔁 [SIMULATOR] Re-evaluated loop count from variable "${countValue}": ${finalRepeatCount}`
                  );
                } else {
                  // Variable still not found - try one more time after a longer wait
                  await new Promise((resolve) => setTimeout(resolve, 50));
                  if (countValue in executionState.current.variables) {
                    const varValue =
                      executionState.current.variables[countValue];
                    finalRepeatCount =
                      typeof varValue === "number"
                        ? varValue
                        : parseInt(String(varValue)) || 0;
                    console.log(
                      `🔁 [SIMULATOR] Re-evaluated loop count from variable "${countValue}" (after wait): ${finalRepeatCount}`
                    );
                  } else {
                    console.warn(
                      `⚠️ [SIMULATOR] Variable "${countValue}" still not found at execution time after waiting, using 0`
                    );
                    finalRepeatCount = 0;
                  }
                }
              }

              console.log(
                `🔁 [SIMULATOR] Starting for loop: ${finalRepeatCount} iterations`
              );
              for (let j = 0; j < finalRepeatCount; j++) {
                if (!executionState.current.isRunning) break;
                console.log(
                  `🔁 [SIMULATOR] Loop iteration ${j + 1}/${finalRepeatCount}`
                );

                for (const func of bodyFunctions) {
                  if (!executionState.current.isRunning) break;
                  await func();
                }
              }
              console.log(
                `✅ [SIMULATOR] For loop completed: ${finalRepeatCount} iterations`
              );
            };
            functionQueue.push(loopBlock);
          } else if (line.match(/while \((.*)\)/)) {
            const condition = line.match(/while \((.*)\)/)?.[1] || "false";

            const loopBodyLines: string[] = [];
            i++;
            // Add protection against infinite loop if closing brace is missing
            let scanIterations = 0;
            while (
              i < lines.length &&
              lines[i] !== "}" &&
              scanIterations < SIMULATOR_CONSTANTS.MAX_SCAN_ITERATIONS
            ) {
              scanIterations++;
              loopBodyLines.push(lines[i]);
              i++;
            }

            if (scanIterations >= SIMULATOR_CONSTANTS.MAX_SCAN_ITERATIONS) {
              console.warn(
                `⚠️ [SIMULATOR] While loop body scanning exceeded max iterations, possible missing closing brace`
              );
              showToast(
                "Warning: Loop may be missing closing brace. Check your code structure.",
                "warning"
              );
            }

            const bodyFunctions = parseCodeToFunctions(
              loopBodyLines.join("\n"),
              depth
            );

            const loopFunction = async () => {
              console.log(
                `🔄 [SIMULATOR] Starting while loop with condition: "${condition}"`
              );
              let iterationCount = 0;

              // Use the enhanced condition evaluator with math support
              while (evaluateCondition(condition)) {
                if (!executionState.current.isRunning) break;

                // Protect against infinite loops
                iterationCount++;
                if (iterationCount > SIMULATOR_CONSTANTS.MAX_WHILE_ITERATIONS) {
                  console.warn(
                    `⚠️ [SIMULATOR] While loop exceeded ${SIMULATOR_CONSTANTS.MAX_WHILE_ITERATIONS} iterations, stopping to prevent infinite loop`
                  );
                  showToast(
                    `Loop exceeded maximum iterations (${SIMULATOR_CONSTANTS.MAX_WHILE_ITERATIONS}). Stopping to prevent infinite loop.`,
                    "warning"
                  );
                  break;
                }

                console.log(
                  `🔄 [SIMULATOR] While loop iteration ${iterationCount}, condition: "${condition}" = true`
                );

                for (const func of bodyFunctions) {
                  if (!executionState.current.isRunning) break;
                  await func();
                }

                await new Promise((r) => setTimeout(r, 0));
              }
              console.log(
                `✅ [SIMULATOR] While loop completed after ${iterationCount} iterations`
              );
            };

            functionQueue.push(loopFunction);
          }
          i++;
        }
        return functionQueue;
      } catch (error) {
        console.error("Error parsing code:", error);
        const errorMessage =
          error instanceof Error
            ? `Error parsing code: ${error.message}`
            : "Error parsing code. Please check your blocks.";
        showToast(errorMessage, "error");
        return [];
      }
    },
    [
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
      stopMovement,
      showToast,
      evaluateCondition,
      evaluateMathExpression,
    ]
  );

  const executeNextCommand = async () => {
    try {
      if (
        !executionState.current.isRunning ||
        executionState.current.commandIndex >=
          executionState.current.commands.length
      ) {
        stopSimulation();
        return;
      }

      const command =
        executionState.current.commands[executionState.current.commandIndex];
      executionState.current.commandIndex++;

      await command();

      if (executionState.current.isRunning) {
        executeNextCommand();
      }
    } catch (error) {
      console.error("Error executing command:", error);
      showToast(
        "Error during simulation execution. Simulation stopped.",
        "error"
      );
      stopSimulation();
    }
  };

  const stopSimulation = () => {
    if (executionState.current.timeoutId) {
      clearTimeout(executionState.current.timeoutId);
      executionState.current.timeoutId = null;
    }
    if (executionState.current.isRunning) {
      executionState.current.isRunning = false;
      dispatch(stopSimulationAction());
      showToast("Simulation finished", "info");
    }
  };

  const handleStart = () => {
    if (isRunning) return;

    // Use javascriptCode for validation and execution
    const validationError = validateCode(javascriptCode);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    // Start simulation from current position (don't reset position)
    dispatch(stopSimulationAction());
    // Note: Trail will continue from current position (not cleared)
    // User can use RESET button if they want to clear everything
    // Keep the current position - use it for the simulation
    currentPositionRef.current = { ...position };

    // Since we are using JS code, we don't need to strip python headers/footers
    // The code generation logic provides the raw statements.
    const codeToRun = javascriptCode;

    executionState.current = {
      commands: parseCodeToFunctions(codeToRun, 0),
      commandIndex: 0,
      isRunning: true,
      timeoutId: null,
      variables: {}, // Reset variables for each simulation run
      constVariables: new Set(), // Reset const variables
      variableUsage: {}, // Reset variable usage tracking
      functions: {}, // Reset functions for each simulation run
      functionCalls: [], // Reset function calls tracking
      recursionDepth: 0,
      maxRecursionDepth: SIMULATOR_CONSTANTS.MAX_RECURSION_DEPTH,
      queueSize: 0,
      maxQueueSize: SIMULATOR_CONSTANTS.MAX_QUEUE_SIZE,
    };

    // After parsing, check for unused variables
    const unusedVars = Object.entries(
      executionState.current.variableUsage
    ).filter(
      ([name, usage]) =>
        usage.assigned &&
        !usage.used &&
        !executionState.current.constVariables.has(name)
    );

    if (unusedVars.length > 0) {
      const unusedNames = unusedVars.map(([name]) => name).join(", ");
      const infoMsg = `Variable(s) [${unusedNames}] are assigned but never used.`;
      console.log(`ℹ️ [SIMULATOR] ${infoMsg}`);
      // Don't show toast for unused variables as it's just informational
    }

    if (executionState.current.commands.length === 0) {
      showToast("No code to run!", "warning");
      executionState.current.isRunning = false;
      return;
    }

    dispatch(startSimulationAction());
    showToast("Simulation started", "success");
    executeNextCommand();
  };

  // ... (Rest of the file remains unchanged: handleReset, addRandomObstacle, useEffects, render) ...
  const handleReset = () => {
    stopSimulation();
    dispatch(resetSimulation()); // This already clears obstacles (resets to initial state)
    currentPositionRef.current = { ...initialCarPosition };
    showToast("Simulation reset", "info");
  };

  const addRandomObstacle = () => {
    const { width, height } = canvasSize;
    const hexHeight = HEX_HEIGHT;
    const hexWidth = HEX_WIDTH;
    const vertStep = VERT_STEP;
    const horizStep = HORIZ_STEP;

    const hexCenters: { x: number; y: number }[] = [];

    for (let y = 0; y < height + hexHeight; y += vertStep) {
      for (let x = 0; x < width + hexWidth; x += horizStep) {
        const offsetY = (Math.floor(x / horizStep) % 2) * (hexHeight / 2);
        hexCenters.push({ x, y: y + offsetY });
      }
    }

    const validCenters = hexCenters.filter(
      (c) => Math.sqrt((c.x - position.x) ** 2 + (c.y - position.y) ** 2) > 80
    );

    if (validCenters.length === 0) {
      showToast("No valid hex cells available!", "warning");
      return;
    }

    const randomCenter =
      validCenters[Math.floor(Math.random() * validCenters.length)];

    dispatch(
      setObstacles([
        ...obstaclePositions,
        {
          x: randomCenter.x,
          y: randomCenter.y,
          radius: HEX_SIZE,
        },
      ])
    );

    showToast("Obstacle added to a hex cell", "success");
  };

  const addObstacleAtPosition = (x: number, y: number) => {
    // Check if position is too close to robot
    const distance = Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2);
    if (distance < 20) {
      showToast("Cannot place obstacle too close to robot!", "warning");
      return;
    }

    // Check if position overlaps with existing obstacles
    const overlaps = obstaclePositions.some(
      (obs: { x: number; y: number; radius?: number }) => {
        const obsDistance = Math.sqrt((x - obs.x) ** 2 + (y - obs.y) ** 2);
        return obsDistance < HEX_SIZE * 2;
      }
    );

    if (overlaps) {
      showToast("Obstacle overlaps with existing obstacle!", "warning");
      return;
    }

    dispatch(
      setObstacles([
        ...obstaclePositions,
        {
          x,
          y,
          radius: HEX_SIZE,
        },
      ])
    );

    showToast("Obstacle placed", "success");
  };

  const updateObstaclePosition = (
    index: number,
    newX: number,
    newY: number
  ) => {
    // Check if new position is too close to robot
    const distance = Math.sqrt(
      (newX - position.x) ** 2 + (newY - position.y) ** 2
    );
    if (distance < 40) {
      showToast("Cannot place obstacle too close to robot!", "warning");
      return;
    }

    // Check if new position overlaps with other obstacles
    const overlaps = obstaclePositions.some(
      (obs: { x: number; y: number; radius?: number }, i: number) => {
        if (i === index) return false; // Skip the obstacle being moved
        const obsDistance = Math.sqrt(
          (newX - obs.x) ** 2 + (newY - obs.y) ** 2
        );
        return obsDistance < HEX_SIZE * 2;
      }
    );

    if (overlaps) {
      showToast("Obstacle overlaps with another obstacle!", "warning");
      return;
    }

    const updatedObstacles = [...obstaclePositions];
    updatedObstacles[index] = { ...updatedObstacles[index], x: newX, y: newY };
    dispatch(setObstacles(updatedObstacles));

    // If car was shaking due to collision with this obstacle, check if still colliding
    if (collisionShake) {
      const stillColliding = isColliding(
        currentPositionRef.current,
        updatedObstacles
      );
      if (!stillColliding) {
        dispatch(setCollisionShake(false));
        // Stop any playing collision sound when obstacle is moved away
        stopCollisionSound(audioRefs.current);
      }
    }
  };

  const removeObstacle = (index: number) => {
    const updatedObstacles = obstaclePositions.filter(
      (_: Obstacle, i: number) => i !== index
    );
    dispatch(setObstacles(updatedObstacles));

    // Stop collision shake and sound if obstacle is removed during collision
    if (collisionShake) {
      dispatch(setCollisionShake(false));
    }

    // Stop any playing collision sound
    stopCollisionSound(audioRefs.current);

    showToast("Obstacle removed", "success");
  };

  // Stop collision shake if obstacles are removed and car is no longer colliding
  useEffect(() => {
    if (collisionShake) {
      const stillColliding = isColliding(
        currentPositionRef.current,
        obstaclePositions
      );
      if (!stillColliding) {
        dispatch(setCollisionShake(false));
      }
    }
  }, [obstaclePositions, collisionShake, dispatch]);

  // Update sensor reading when position or obstacles change (when not running simulation)
  useEffect(() => {
    if (!isRunning) {
      // Update sensor reading based on current position and obstacles
      const { x, y, angle } = currentPositionRef.current;
      const radians = (angle * Math.PI) / 180;

      // Sensor direction vector (forward direction)
      const dirX = Math.cos(radians);
      const dirY = Math.sin(radians);

      // Sensor position (slightly in front of robot center)
      const sensorX = x + dirX * 15;
      const sensorY = y + dirY * 15;

      const maxDistance = 300;
      let closestHit = maxDistance;

      obstaclePositions.forEach(
        (obs: { x: number; y: number; radius?: number }) => {
          // Vector from sensor to obstacle center
          const toObstacleX = obs.x - sensorX;
          const toObstacleY = obs.y - sensorY;

          // Project obstacle position onto sensor direction using dot product
          const dot = toObstacleX * dirX + toObstacleY * dirY;

          // Only check obstacles in front of the sensor
          if (dot > 0) {
            // Find the closest point on the sensor ray to the obstacle center
            const closestPointX = sensorX + dirX * dot;
            const closestPointY = sensorY + dirY * dot;

            // Distance from obstacle center to the sensor ray
            const distanceToRay = Math.sqrt(
              Math.pow(closestPointX - obs.x, 2) +
                Math.pow(closestPointY - obs.y, 2)
            );

            // Obstacle radius (hexagon size)
            const obstacleRadius = obs.radius || HEX_SIZE;

            // Check if the ray intersects with the obstacle
            if (distanceToRay < obstacleRadius) {
              // Calculate the actual hit distance along the ray
              const hitDistance =
                dot -
                Math.sqrt(
                  Math.pow(obstacleRadius, 2) - Math.pow(distanceToRay, 2)
                );

              // Update closest hit if this is closer
              if (hitDistance > 0 && hitDistance < closestHit) {
                closestHit = hitDistance;
              }
            }
          }
        }
      );

      const reading = Math.max(0, Math.floor(closestHit));
      dispatch(updateSensorReading({ ultrasonic: reading }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, obstaclePositions, isRunning]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.clientWidth,
          height: canvasRef.current.clientHeight,
        });
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      stopSimulation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col bg-[#CDECF8] h-full">
      <div className="flex-grow relative overflow-hidden" ref={canvasRef}>
        <div className="absolute top-0 right-0 z-20 pointer-events-none">
          <svg
            width="32"
            height="31"
            viewBox="0 0 32 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.8312 30.6646C28.7014 30.6646 28.4417 30.5975 28.247 30.3962L0.589689 1.81176C0.329997 1.54336 0.330044 1.14077 0.394967 0.872367C0.524814 0.603969 0.784474 0.335571 1.17401 0.335571H28.8312C29.2857 0.335571 29.6753 0.738168 29.6753 1.20787V29.7923C29.6753 30.1278 29.5454 30.3291 29.4155 30.3962C29.2857 30.5975 29.026 30.6646 28.8312 30.6646Z"
              fill="#DDDDDD"
            />
            <path
              d="M1.17401 0.670996H28.8312C29.0909 0.670996 29.3506 0.939393 29.3506 1.20779V29.7922C29.3506 29.9264 29.2858 30.0606 29.2208 30.1948C29.091 30.2619 28.9611 30.329 28.8312 30.329C28.7014 30.329 28.5715 30.2619 28.5066 30.1948L0.784491 1.54329C0.589722 1.34199 0.654676 1.07359 0.654676 0.939395C0.719599 0.939395 0.849398 0.670996 1.17401 0.670996ZM1.17401 0C0.135244 0 -0.384093 1.27489 0.330061 2.08009L27.9873 30.6645C28.247 30.9329 28.5066 31 28.8312 31C29.4155 31 29.9999 30.5303 29.9999 29.7922V1.20779C29.9999 0.536796 29.4805 0 28.8312 0H1.17401Z"
              fill="black"
            />
          </svg>
        </div>

        <Canvas
          position={position}
          obstacles={obstaclePositions}
          width={canvasSize.width}
          height={canvasSize.height}
          showTrail={showTrail}
          trail={trail}
          sensorReadings={sensorReadings}
          onStart={handleStart}
          onStop={stopSimulation}
          onReset={handleReset}
          isRunning={isRunning}
          onFirmwareFlash={onFirmwareFlash}
          onShowSimulator={onShowSimulator}
          onShowCode={onShowCode}
          canFirmwareFlash={canFirmwareFlash}
          placeObstacleMode={placeObstacleMode}
          onAddObstacleAtPosition={addObstacleAtPosition}
          onUpdateObstaclePosition={updateObstaclePosition}
          onRemoveObstacle={removeObstacle}
          collisionShake={collisionShake}
          onPositionChange={(newPosition) => {
            // Update Redux state with new position
            dispatch(updateCarPosition(newPosition));
            // Also update local ref for simulation
            currentPositionRef.current = {
              ...currentPositionRef.current,
              ...newPosition,
            };
          }}
        />
        {/* Scan Device Button - positioned in canvas area */}
        {/* <button
          type="button"
          onClick={() => onOpenScanPopup?.()}
          className="absolute left-7 bottom-1 -rotate-6 z-10"
          aria-label="Scan Device"
          title="Scan Device"
        >
          <RemoteControlScanDevice 
            fillColor={bleIsConnected ? "#2FC1E8" : "#e32626"} 
            className="w-28 h-28" 
          />
        </button> */}
      </div>

      {/* Bottom Section: Gamepad Controls */}
      <div
        className="flex-shrink-0 relative bg-[#CDECF8]"
        style={{
          clipPath: "polygon(5.5% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 5.75%)",
        }}
      >
        <RemoteControls
          canvasSize={canvasSize}
          onAddObstacle={addRandomObstacle}
        />
      </div>
    </div>
  );
};

export default Simulator;
