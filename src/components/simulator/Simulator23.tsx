import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  startSimulation as startSimulationAction,
  stopSimulation as stopSimulationAction,
  resetSimulation,
  setObstacles,
  updateCarPosition,
  type Obstacle,
} from '../../store/simulatorSlice';
import { updateSensorReading } from '../../store/simulatorSlice';
import { useToast } from '../ToastManager';
import RemoteControls from './RemoteControls';
import Canvas from './Canvas';

interface ExecutionBlock {
  commands: string[];
  loopCount?: number;
}

const initialCarPosition = { x: 250, y: 200, angle: 0 };

const Simulator = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redux state
  const { position, isRunning, obstaclePositions, sensorReadings, trail, showTrail } =
    useSelector((state: RootState) => state.simulator);
  const codeState = useSelector((state: RootState) => state.code);
  const generatedCode = codeState.micropythonCode;

  // Local state
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  // Local car position for simulation runner (solution to your issue!)
  const currentPositionRef = useRef({ ...initialCarPosition });

  // Make local car position follow Redux state, when not running a simulation
  useEffect(() => {
    if (!isRunning) {
      currentPositionRef.current = { ...position };
    }
  }, [position, isRunning]);

  // Simulator execution logic
  const executionState = useRef<{
    blocks: ExecutionBlock[];
    currentBlockIndex: number;
    currentCommandIndex: number;
    isRunning: boolean;
    isPaused: boolean;
    maxIterations: number;
    iterationCount: number;
    timeoutId: number;
  }>({
    blocks: [],
    currentBlockIndex: 0,
    currentCommandIndex: 0,
    isRunning: false,
    isPaused: false,
    maxIterations: 1000,
    iterationCount: 0,
    timeoutId: 0,
  });

  // --- Movement functions: always use and update currentPositionRef! ---

  const moveForward = () => {
    const { x, y, angle } = currentPositionRef.current;
    const radians = (angle * Math.PI) / 180;
    const newX = x + Math.cos(radians) * 30;
    const newY = y + Math.sin(radians) * 30;
    currentPositionRef.current = { ...currentPositionRef.current, x: newX, y: newY };
    dispatch(updateCarPosition({ x: newX, y: newY }));
    showToast('Moving forward', 'info');
  };

  const moveBackward = () => {
    const { x, y, angle } = currentPositionRef.current;
    const radians = (angle * Math.PI) / 180;
    const newX = x - Math.cos(radians) * 30;
    const newY = y - Math.sin(radians) * 30;
    currentPositionRef.current = { ...currentPositionRef.current, x: newX, y: newY };
    dispatch(updateCarPosition({ x: newX, y: newY }));
    showToast('Moving backward', 'info');
  };

  const turnLeft = () => {
    const { angle } = currentPositionRef.current;
    let newAngle = (angle - 90) % 360;
    if (newAngle < 0) newAngle += 360;
    currentPositionRef.current = { ...currentPositionRef.current, angle: newAngle };
    dispatch(updateCarPosition({ angle: newAngle }));
    showToast('Turning left', 'info');
  };

  const turnRight = () => {
    const { angle } = currentPositionRef.current;
    let newAngle = (angle + 90) % 360;
    if (newAngle < 0) newAngle += 360;
    currentPositionRef.current = { ...currentPositionRef.current, angle: newAngle };
    dispatch(updateCarPosition({ angle: newAngle }));
    showToast('Turning right', 'info');
  };

  // --- Rest of code: mostly unchanged from your version ---

  const parseCode = (code: string) => {
    let simplifiedCode = code;
    if (
      code.includes('let') ||
      code.includes('var') ||
      (code.includes('for') && code.includes(';'))
    ) {
      try {
        const commands: string[] = [];
        const lines = code.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed.startsWith('moveForward') ||
            trimmed.startsWith('moveBackward') ||
            trimmed.startsWith('turnLeft') ||
            trimmed.startsWith('turnRight') ||
            trimmed.startsWith('stopMovement') ||
            trimmed.startsWith('wait')
          ) {
            commands.push(trimmed);
          }
        }
        simplifiedCode = commands.join('\n');
      } catch {
        simplifiedCode = code
          .split('\n')
          .map((line) => line.trim())
          .filter(
            (line) =>
              line.length > 0 &&
              (line.startsWith('moveForward') ||
                line.startsWith('moveBackward') ||
                line.startsWith('turnLeft') ||
                line.startsWith('turnRight') ||
                line.startsWith('stopMovement') ||
                line.startsWith('wait'))
          )
          .join('\n');
      }
    }

    const lines = simplifiedCode
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (
      !simplifiedCode.includes('while') &&
      !simplifiedCode.includes('for') &&
      !simplifiedCode.includes('{')
    ) {
      executionState.current.blocks = [{ commands: lines }];
      executionState.current.currentBlockIndex = 0;
      executionState.current.currentCommandIndex = 0;
      return;
    }

    if (simplifiedCode.includes('while')) {
      const commands = lines.filter(
        (line) =>
          line.startsWith('moveForward') ||
          line.startsWith('moveBackward') ||
          line.startsWith('turnLeft') ||
          line.startsWith('turnRight') ||
          line.startsWith('stopMovement') ||
          line.startsWith('wait')
      );
      executionState.current.blocks = [
        {
          commands: commands,
          loopCount: 10,
        },
      ];
      executionState.current.currentBlockIndex = 0;
      executionState.current.currentCommandIndex = 0;
      return;
    }

    const blocks: ExecutionBlock[] = [];
    blocks.push({ commands: lines });
    executionState.current.blocks = blocks;
    executionState.current.currentBlockIndex = 0;
    executionState.current.currentCommandIndex = 0;
  };

  const executeNextCommand = () => {
    if (!executionState.current.isRunning) return;

    const blocks = executionState.current.blocks;
    const blockIndex = executionState.current.currentBlockIndex;
    const cmdIndex = executionState.current.currentCommandIndex;

    if (blockIndex >= blocks.length) {
      stopSimulation();
      return;
    }

    const block = blocks[blockIndex];
    const commands = block.commands;

    if (cmdIndex >= commands.length) {
      if (block.loopCount !== undefined) {
        executionState.current.iterationCount++;
        if (executionState.current.iterationCount < block.loopCount) {
          executionState.current.currentCommandIndex = 0;
          executionState.current.timeoutId = window.setTimeout(executeNextCommand, 100);
          return;
        } else {
          executionState.current.currentBlockIndex++;
          executionState.current.currentCommandIndex = 0;
          executionState.current.iterationCount = 0;
          executionState.current.timeoutId = window.setTimeout(executeNextCommand, 100);
          return;
        }
      } else {
        executionState.current.currentBlockIndex++;
        executionState.current.currentCommandIndex = 0;
        executionState.current.timeoutId = window.setTimeout(executeNextCommand, 100);
        return;
      }
    }

    const command = commands[cmdIndex];
    const cleanCommand = command.endsWith(';')
      ? command.substring(0, command.length - 1)
      : command;

    if (cleanCommand.startsWith('moveForward')) {
      moveForward();
    } else if (cleanCommand.startsWith('moveBackward')) {
      moveBackward();
    } else if (cleanCommand.startsWith('turnLeft')) {
      turnLeft();
    } else if (cleanCommand.startsWith('turnRight')) {
      turnRight();
    } else if (cleanCommand.startsWith('stopMovement')) {
      dispatch(stopSimulationAction());
    } else if (cleanCommand.startsWith('wait')) {
      let waitTime = 1000;
      const waitMatch = cleanCommand.match(/wait\((\d+\.?\d*)\)/);
      if (waitMatch && waitMatch[1]) {
        waitTime = parseFloat(waitMatch[1]) * 1000;
      }
      executionState.current.currentCommandIndex++;
      executionState.current.timeoutId = window.setTimeout(executeNextCommand, waitTime);
      return;
    }
    executionState.current.currentCommandIndex++;
    executionState.current.timeoutId = window.setTimeout(executeNextCommand, 100);
  };

  const stopSimulation = () => {
    window.clearTimeout(executionState.current.timeoutId);
    executionState.current.isRunning = false;
    dispatch(stopSimulationAction());
    showToast('Simulation stopped', 'info');
  };

  const setupSimulator = () => {
    window.clearTimeout(executionState.current.timeoutId);
    executionState.current = {
      blocks: [],
      currentBlockIndex: 0,
      currentCommandIndex: 0,
      isRunning: true,
      isPaused: false,
      maxIterations: 1000,
      iterationCount: 0,
      timeoutId: 0,
    };
    // Use the latest Redux position as simulation/command starting point
    currentPositionRef.current = { ...position };
    if (generatedCode) {
      parseCode(generatedCode);
    }
  };

  const startSimulation = () => {
    if (executionState.current.isRunning) return;
    setupSimulator();
    dispatch(startSimulationAction());
    executeNextCommand();
  };

  const handleStart = () => {
    startSimulation();
    showToast('Simulation started', 'success');
  };

  const handleReset = () => {
    dispatch(resetSimulation());
    currentPositionRef.current = { ...initialCarPosition };
    dispatch(updateCarPosition({ ...initialCarPosition }));
    showToast('Simulation reset', 'info');
  };

  const addRandomObstacle = () => {
    const maxWidth = canvasSize.width - 20;
    const maxHeight = canvasSize.height - 20;
    let x, y;
    const minDistanceFromCar = 80;

    do {
      x = 20 + Math.random() * (maxWidth - 40);
      y = 20 + Math.random() * (maxHeight - 40);
    } while (
      Math.sqrt(Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)) < minDistanceFromCar
    );
    const newObstacle = { x, y, radius: 10 as number };
    dispatch(setObstacles([...obstaclePositions.map((o: Obstacle) => ({ ...o, radius: o.radius ?? 10 })), newObstacle]));
    showToast('Obstacle added', 'success');
  };

  // Sensor simulation unchanged
  const simulateSensor = () => {
    const carX = position.x;
    const carY = position.y;
    const carAngle = position.angle;
    const radians = (carAngle * Math.PI) / 180;
    const dirX = Math.cos(radians);
    const dirY = Math.sin(radians);
    const maxDistance = 150;
    let closestHit = maxDistance;
    obstaclePositions.forEach((obstacle: Obstacle) => {
      const toObstacleX = obstacle.x - carX;
      const toObstacleY = obstacle.y - carY;
      const dot = toObstacleX * dirX + toObstacleY * dirY;
      if (dot > 0) {
        const closestX = carX + dirX * dot;
        const closestY = carY + dirY * dot;
        const distanceToCenter = Math.sqrt(
          Math.pow(closestX - obstacle.x, 2) + Math.pow(closestY - obstacle.y, 2)
        );
        if (obstacle.radius && distanceToCenter < obstacle.radius) {
          const hitDist =
            dot - Math.sqrt(Math.pow(obstacle.radius, 2) - Math.pow(distanceToCenter, 2));
          if (hitDist < closestHit) {
            closestHit = hitDist;
          }
        }
      }
    });
    dispatch(updateSensorReading({ ultrasonic: closestHit }));

    return closestHit;
  };

  useEffect(() => {
    // fake sensor simulation; real update not shown here
    simulateSensor();
  }, [position, obstaclePositions]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const parent = canvasRef.current.parentElement;
        setCanvasSize({
          width: parent.clientWidth,
          height: parent.clientHeight,
        });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (executionState.current.timeoutId) {
        window.clearTimeout(executionState.current.timeoutId);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            onClick={handleStart}
            disabled={isRunning}
          >
            Start
          </button>
          <button
            className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            onClick={stopSimulation}
            disabled={!isRunning}
          >
            Stop
          </button>
          <button
            className="px-2 py-1 bg-customRed text-white rounded text-sm hover:bg-blue-700 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex-grow relative overflow-hidden">
        <Canvas
          position={position}
          obstacles={obstaclePositions.map((o: Obstacle) => ({ ...o, radius: o.radius ?? 10 }))}
          width={canvasSize.width}
          height={canvasSize.height}
          showTrail={showTrail}
          trail={trail}
          sensorReadings={sensorReadings}
        />
      </div>
      <div className="border-t">
        <RemoteControls
          canvasSize={canvasSize}
          onAddObstacle={addRandomObstacle}
        />
      </div>
    </div>
  );
};

export default Simulator;