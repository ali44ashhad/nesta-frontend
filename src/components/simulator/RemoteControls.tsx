import { useEffect, useState, useRef, useCallback } from "react";
import { useGamepadBLECommands } from "../../utils/useGamepadBLECommands";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  updateCarPosition,
  updateSensorReading,
  toggleTrail,
  togglePlaceObstacleMode,
  setCollisionShake,
  toggleRemoteEnabled,
  toggleContinuousMode,
  toggleShowMovementToasts,
  toggleFirmwareExecution,
  type Obstacle,
} from "../../store/simulatorSlice";
import { useToast } from "../ToastManager";
import { checkCollision, isColliding } from "../../utils/collisionDetection";
import { playCollisionSound, stopCollisionSound, type AudioRefs } from "../../utils/collisionAudio";
import GamepadUP from "../../components/icons/gamepadUP";
import GamepadDOWN from "../../components/icons/gamepadDOWN";
import GamepadLEFT from "../../components/icons/gamepadLEFT";
import GamepadRIGHT from "../../components/icons/gamepadRIGHT";
import GamepadCENTER from "../../components/icons/gamepadCENTER";
import Gamepadbt1 from "../../components/icons/gamepadbtn1";
import Gamepadbt2 from "../../components/icons/gamepadbtn2";
import Gamepadbt3 from "../../components/icons/gamepadbtn3";

// Constants
const LONG_PRESS_DURATION = 1000; // 1 second
const OBSTACLE_ACTIVE_DURATION = 300; // milliseconds
const MOVEMENT_TOAST_THROTTLE = 500; // milliseconds
const CONTINUOUS_MOVEMENT_INTERVAL = 100; // milliseconds
const MOVEMENT_DISTANCE = 10; // pixels
const CANVAS_BUFFER = 15; // pixels
const TURN_ANGLE = 15; // degrees
const COLLISION_SHAKE_DURATION = 300; // milliseconds
const DEG_TO_RAD = Math.PI / 180; // Degree to radian conversion
const FORWARD_COLLISION_FREQ = 100; // Hz
const BACKWARD_COLLISION_FREQ = 1000; // Hz

// Define types
type IntervalType = ReturnType<typeof setInterval> | null;
interface RemoteControlsProps {
  canvasSize: { width: number; height: number };
  onAddObstacle?: () => void;
}

// Keyboard action mapping (moved outside component to avoid recreation)
const KEY_ACTION_MAP: Record<string, string> = {
  ArrowUp: "moveForward",
  ArrowDown: "moveBackward",
  ArrowLeft: "turnLeft",
  ArrowRight: "turnRight",
};

const RemoteControls = ({ 
  canvasSize, 
  onAddObstacle,
}: RemoteControlsProps) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  // Use individual selectors to prevent unnecessary re-renders
  const position = useSelector((state: RootState) => state.simulator.position);
  const showTrail = useSelector((state: RootState) => state.simulator.showTrail);
  const placeObstacleMode = useSelector((state: RootState) => state.simulator.placeObstacleMode);
  const obstaclePositions = useSelector((state: RootState) => state.simulator.obstaclePositions);
  const collisionShake = useSelector((state: RootState) => state.simulator.collisionShake);
  // Remote controls state from Redux
  const remoteEnabled = useSelector((state: RootState) => state.simulator.remoteEnabled);
  const continuousMode = useSelector((state: RootState) => state.simulator.continuousMode);
  const showMovementToasts = useSelector((state: RootState) => state.simulator.showMovementToasts);
  const firmwareExecution = useSelector((state: RootState) => state.simulator.firmwareExecution);

  // Local UI state (transient, doesn't need Redux)
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [lastMovementTime, setLastMovementTime] = useState(0);
  const [addObstacleActive, setAddObstacleActive] = useState(false);
  const longPressTimeoutRef = useRef<number | null>(null);
  const isLongPressingRef = useRef<boolean>(false);
  const obstaclePositionsRef = useRef<Obstacle[]>([]);
  const audioRefs = useRef<AudioRefs>({ audioContext: null, oscillator: null });

  const intervalRef = useRef<IntervalType>(null);
  const movementFunctions = useRef<Record<string, () => void>>({});
  const addObstacleTimeoutRef = useRef<number | null>(null);
  const collisionShakeTimeoutRef = useRef<number | null>(null);
  
  // Keep obstacle positions ref in sync with Redux state for real-time collision detection
  useEffect(() => {
    obstaclePositionsRef.current = obstaclePositions;
  }, [obstaclePositions]);

  // Stop collision shake and sound if obstacles are removed and car is no longer colliding
  useEffect(() => {
    if (collisionShake) {
      const stillColliding = isColliding(position, obstaclePositions);
      if (!stillColliding) {
        dispatch(setCollisionShake(false));
        stopCollisionSound(audioRefs.current);
      }
    }
  }, [collisionShake, obstaclePositions, position, dispatch]);

  // Helper function to handle collision effects (shake + sound)
  const handleCollisionEffects = useCallback((frequency: number) => {
    // Only trigger if obstacles exist
    if (obstaclePositionsRef.current.length === 0) return;
    
    dispatch(setCollisionShake(true));
    
    // Clear existing timeout if any
    if (collisionShakeTimeoutRef.current) {
      clearTimeout(collisionShakeTimeoutRef.current);
    }
    
    // Set timeout to stop shake
    collisionShakeTimeoutRef.current = window.setTimeout(() => {
      dispatch(setCollisionShake(false));
      collisionShakeTimeoutRef.current = null;
    }, COLLISION_SHAKE_DURATION);
    
    // Stop any existing sound and play new one
    stopCollisionSound(audioRefs.current);
    audioRefs.current = playCollisionSound(frequency);
  }, [dispatch]);

  // --- BLE Gamepad Commands ---
  const {
    isConnected: bleConnected,
    sendGamepadCommand,
    motorCommands,
  } = useGamepadBLECommands();

  // Helper function to calculate constrained position
  const constrainToCanvas = useCallback((x: number, y: number, width: number, height: number) => {
    return {
      x: Math.max(CANVAS_BUFFER, Math.min(width - CANVAS_BUFFER, x)),
      y: Math.max(CANVAS_BUFFER, Math.min(height - CANVAS_BUFFER, y)),
    };
  }, []);

  // --- Movement Logic ---
  const moveForward = useCallback(() => {
    if (bleConnected) sendGamepadCommand(motorCommands.UP);
    const { width, height } = canvasSize;
    const radians = position.angle * DEG_TO_RAD;
    
    // Check for obstacle collision using utility function
    const collision = checkCollision(
      position,
      obstaclePositionsRef.current,
      MOVEMENT_DISTANCE,
      1
    );
    
    // Calculate new position with safe distance
    const newX = position.x + Math.cos(radians) * collision.safeDistance;
    const newY = position.y + Math.sin(radians) * collision.safeDistance;
    
    // Handle collision effects
    if (collision.hasCollision && collision.safeDistance < MOVEMENT_DISTANCE - 1) {
      handleCollisionEffects(FORWARD_COLLISION_FREQ);
    }
    
    // Constrain to canvas bounds and update position
    const constrained = constrainToCanvas(newX, newY, width, height);
    dispatch(updateCarPosition({ x: constrained.x, y: constrained.y }));
  }, [
    dispatch,
    position,
    canvasSize,
    bleConnected,
    sendGamepadCommand,
    motorCommands.UP,
    handleCollisionEffects,
    constrainToCanvas,
  ]);

  const moveBackward = useCallback(() => {
    if (bleConnected) sendGamepadCommand(motorCommands.DOWN);
    const { width, height } = canvasSize;
    const radians = position.angle * DEG_TO_RAD;
    
    // Check for obstacle collision using utility function
    const collision = checkCollision(
      position,
      obstaclePositionsRef.current,
      MOVEMENT_DISTANCE,
      -1
    );
    
    // Calculate new position with safe distance
    const newX = position.x - Math.cos(radians) * collision.safeDistance;
    const newY = position.y - Math.sin(radians) * collision.safeDistance;
    
    // Handle collision effects
    if (collision.hasCollision && collision.safeDistance < MOVEMENT_DISTANCE - 1) {
      handleCollisionEffects(BACKWARD_COLLISION_FREQ);
    }
    
    // Constrain to canvas bounds and update position
    const constrained = constrainToCanvas(newX, newY, width, height);
    dispatch(updateCarPosition({ x: constrained.x, y: constrained.y }));
  }, [
    dispatch,
    position,
    canvasSize,
    bleConnected,
    sendGamepadCommand,
    motorCommands.DOWN,
    handleCollisionEffects,
    constrainToCanvas,
  ]);

  const turnLeft = useCallback(() => {
    if (bleConnected) sendGamepadCommand(motorCommands.LEFT);
    const newAngle = (position.angle - TURN_ANGLE) % 360;
    dispatch(updateCarPosition({ angle: newAngle }));
  }, [
    dispatch,
    position.angle,
    bleConnected,
    sendGamepadCommand,
    motorCommands.LEFT,
  ]);

  const turnRight = useCallback(() => {
    if (bleConnected) sendGamepadCommand(motorCommands.RIGHT);
    const newAngle = (position.angle + TURN_ANGLE) % 360;
    dispatch(updateCarPosition({ angle: newAngle }));
  }, [
    dispatch,
    position.angle,
    bleConnected,
    sendGamepadCommand,
    motorCommands.RIGHT,
  ]);

  useEffect(() => {
    movementFunctions.current = {
      moveForward,
      moveBackward,
      turnLeft,
      turnRight,
    };
  }, [moveForward, moveBackward, turnLeft, turnRight]);

  // --- Toast Notifications ---
  const showMovementToast = useCallback(
    (action: string) => {
      const now = Date.now();
      if (showMovementToasts && now - lastMovementTime > MOVEMENT_TOAST_THROTTLE) {
        showToast(`Moving ${action}`, "info", 1000);
        setLastMovementTime(now);
      }
      const distance = Math.floor(Math.random() * 150);
      if (distance < 15) {
        showToast("Obstacle detected!", "warning", 1500);
      }
      dispatch(updateSensorReading({ ultrasonic: distance }));
    },
    [showMovementToasts, lastMovementTime, dispatch, showToast]
  );

  // --- Continuous Movement Interval ---
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Interval only runs if remote is enabled
    if (remoteEnabled && continuousMode && activeButton) {
      intervalRef.current = setInterval(() => {
        const moveFunc = movementFunctions.current[activeButton];
        if (moveFunc) {
          moveFunc();
          showMovementToast(activeButton);
        }
      }, CONTINUOUS_MOVEMENT_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [remoteEnabled, continuousMode, activeButton, showMovementToast]);

  // --- Event Handlers for UI and Keyboard ---
  const handleInteractionStart = useCallback(
    (action: string) => {
      setActiveButton(action);
      const moveFunc = movementFunctions.current[action];
      if (moveFunc) {
        moveFunc();
        showMovementToast(action);
      }
    },
    [showMovementToast]
  );

  const handleInteractionEnd = useCallback(() => {
    if (bleConnected) sendGamepadCommand(motorCommands.STOP);
    setActiveButton(null);
  }, [bleConnected, sendGamepadCommand, motorCommands]);

  const toggleFirmwareExecutionMode = useCallback(() => {
    if (!bleConnected) return;
    const newState = !firmwareExecution;
    
    if (newState) {
      sendGamepadCommand("FIRMWARE_ON");
    } else {
      sendGamepadCommand("FIRMWARE_OFF");
    }

    dispatch(toggleFirmwareExecution());
    showToast(
      newState ? "Firmware execution enabled" : "Firmware execution disabled"
    );
  }, [bleConnected, sendGamepadCommand, showToast, firmwareExecution, dispatch]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard if remote is disabled
      if (!remoteEnabled || e.repeat) return;

      const action = KEY_ACTION_MAP[e.key];
      if (action) {
        handleInteractionStart(action);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_ACTION_MAP[e.key];
      if (action && action === activeButton) {
        handleInteractionEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    remoteEnabled,
    activeButton,
    handleInteractionStart,
    handleInteractionEnd,
  ]);

  const handleToggleContinuousMode = useCallback(() => {
    const newState = !continuousMode;
    dispatch(toggleContinuousMode());
    showToast(
      newState
        ? "Continuous movement enabled"
        : "Continuous movement disabled",
      "info"
    );
  }, [showToast, continuousMode, dispatch]);

  const toggleMovementToasts = useCallback(() => {
    const newState = !showMovementToasts;
    dispatch(toggleShowMovementToasts());
    showToast(
      newState
        ? "Movement notifications enabled"
        : "Movement notifications disabled",
      "info"
    );
  }, [showToast, showMovementToasts, dispatch]);

  const handleAddObstacleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If in placement mode, just toggle it off immediately
    if (placeObstacleMode) {
      dispatch(togglePlaceObstacleMode());
      return;
    }

    // Start long press timer for placement mode
    isLongPressingRef.current = true;
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (isLongPressingRef.current) {
        dispatch(togglePlaceObstacleMode());
        isLongPressingRef.current = false;
      }
    }, LONG_PRESS_DURATION);
  }, [placeObstacleMode, dispatch]);

  const handleAddObstacleMouseUp = useCallback(() => {
    const wasLongPressTimerActive = longPressTimeoutRef.current !== null;
    
    // Clean up long press timer
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    isLongPressingRef.current = false;
    
    // If long press timer was still running, it was a quick click - add obstacle
    if (wasLongPressTimerActive && !placeObstacleMode && onAddObstacle) {
      setAddObstacleActive(true);
      onAddObstacle();
      addObstacleTimeoutRef.current = window.setTimeout(() => {
        setAddObstacleActive(false);
        addObstacleTimeoutRef.current = null;
      }, OBSTACLE_ACTIVE_DURATION);
    }
  }, [onAddObstacle, placeObstacleMode]);

  const handleAddObstacleMouseLeave = useCallback(() => {
    // Cancel long press if mouse leaves the button
    if (longPressTimeoutRef.current) {
      window.clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    isLongPressingRef.current = false;
    
    // Cancel the quick click timeout if it exists
    if (addObstacleTimeoutRef.current) {
      window.clearTimeout(addObstacleTimeoutRef.current);
      addObstacleTimeoutRef.current = null;
    }
  }, []);


  // Cleanup effect for timeouts and audio
  useEffect(() => {
    return () => {
      if (addObstacleTimeoutRef.current) {
        window.clearTimeout(addObstacleTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        window.clearTimeout(longPressTimeoutRef.current);
      }
      if (collisionShakeTimeoutRef.current) {
        window.clearTimeout(collisionShakeTimeoutRef.current);
      }
      // Cleanup: stop any playing collision sound on unmount
      stopCollisionSound(audioRefs.current);
    };
  }, []);

  const handleToggleTrail = useCallback(() => {
    dispatch(toggleTrail());
    showToast(
      showTrail ? "Path trail hidden" : "Path trail visible",
      "info"
    );
  }, [dispatch, showTrail, showToast]);

  const handleToggleRemoteEnabled = useCallback(() => {
    const newState = !remoteEnabled;
    // If we are disabling, make sure to stop any active movement
    if (remoteEnabled) {
      handleInteractionEnd();
    }
    dispatch(toggleRemoteEnabled());
    showToast(newState ? "Remote enabled" : "Remote disabled", "info");
  }, [handleInteractionEnd, showToast, remoteEnabled, dispatch]);

  return (
    <div className="relative z-30 flex items-end justify-center w-full h-fit px-4 pb-1">
  {/* Left Spacer */}
  {/* <div className="flex-1"></div> */}

  {/* === Center Gamepad Cluster === */}
  <div className="flex flex-col items-center justify-end">
    {/* --- Gamepad Grid --- */}
    <div className="grid grid-cols-3 gap-1 w-32 mb-0 scale-90">
      <div></div>
      <button
        className={`control-button ${
          activeButton === "moveForward" ? "bg-blue-200" : ""
        }`}
        onMouseDown={() => handleInteractionStart("moveForward")}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={() => handleInteractionStart("moveForward")}
        onTouchEnd={handleInteractionEnd}
        aria-label="Move Forward"
        disabled={!remoteEnabled}
      >
        <GamepadUP />
      </button>
      <div></div>

      <button
        className={`control-button ${
          activeButton === "turnLeft" ? "bg-green-600" : ""
        }`}
        onMouseDown={() => handleInteractionStart("turnLeft")}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={() => handleInteractionStart("turnLeft")}
        onTouchEnd={handleInteractionEnd}
        aria-label="Turn Left"
        disabled={!remoteEnabled}
      >
        <GamepadLEFT />
      </button>

      {/* Center Power Button */}
      <button
        className="control-button"
        onClick={handleToggleRemoteEnabled}
        title={remoteEnabled ? "Disable Remote" : "Enable Remote"}
      >
        <GamepadCENTER fillColor={remoteEnabled ? "#8AD53B" : "#3D3D3D"} />
      </button>

      <button
        className={`control-button ${
          activeButton === "turnRight" ? "bg-blue-200" : ""
        }`}
        onMouseDown={() => handleInteractionStart("turnRight")}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={() => handleInteractionStart("turnRight")}
        onTouchEnd={handleInteractionEnd}
        aria-label="Turn Right"
        disabled={!remoteEnabled}
      >
        <GamepadRIGHT />
      </button>

      <div></div>
      <button
        className={`control-button ${
          activeButton === "moveBackward" ? "bg-blue-200" : ""
        }`}
        onMouseDown={() => handleInteractionStart("moveBackward")}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={() => handleInteractionStart("moveBackward")}
        onTouchEnd={handleInteractionEnd}
        aria-label="Move Backward"
        disabled={!remoteEnabled}
      >
        <GamepadDOWN />
      </button>
      <div></div>
    </div>

    {/* --- Bottom Button Row --- */}
    <div className="flex flex-row justify-center items-center gap-3 text-xs mt-1">
      <button
        onClick={handleToggleContinuousMode}
        disabled={!remoteEnabled}
        className={`transition-all ${
          !remoteEnabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Continuous Movement"
      >
        <Gamepadbt1
          fillColor={continuousMode ? "#8CCC00" : "#5392F3"}
          text="AUTO|MOVE"

        />
      </button>
      <button
        onClick={toggleFirmwareExecutionMode}
        disabled={!bleConnected}
        className={`flex flex-col items-center gap-1 transition-all ${
          !bleConnected ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Execute Firmware"
      >
        <Gamepadbt2
          fillColor={firmwareExecution ? "#8CCC00" : "#5392F3"}
          text="AUTO|RUN"
        />
      </button>

      <button
        onClick={toggleMovementToasts}
        className="flex flex-col items-center gap-1 transition-all"
        title="Show movement notifications"
      >
        <Gamepadbt3 fillColor={showMovementToasts ? "#8CCC00" : "#4CD6FF"} />
      </button>

      <button
        onClick={handleToggleTrail}
        className="transition-all"
        title="Toggle path trail"
      >
        <Gamepadbt1
          fillColor={showTrail ? "#8CCC00" : "#4CD6FF"}
          text="SHOW|PATH"
        />
      </button>
      <button
        onMouseDown={handleAddObstacleMouseDown}
        onMouseUp={handleAddObstacleMouseUp}
        onMouseLeave={handleAddObstacleMouseLeave}
        disabled={!onAddObstacle}
        className={`flex flex-col items-center gap-1 transition-all ${
          !onAddObstacle ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={placeObstacleMode 
          ? "Click to exit placement mode, then click on canvas to place obstacles" 
          : "Quick click to add random obstacle, Long Press (1s) to enter placement mode"}
      >
        <Gamepadbt2
          fillColor={placeObstacleMode || addObstacleActive ? "#8CCC00" : "#4CD6FF"}
          text="ADD|HURDLE"
        />
      </button>
    </div>
  </div>

  {/* === Right Side Console Label === */}
  {/* <div className="flex-1 flex items-end justify-end pr-2 pb-2 sm:pr-4 sm:pb-3 md:pr-6 md:pb-4">
    <p
      className={`
        font-bold tracking-widest text-nearBlack
        transform translate-x-1 translate-y-2
        font-saiba-outline
        text-2xl sm:text-3xl md:text-3xl
        `}
      style={{
        writingMode: "sideways-lr",
        textOrientation: "mixed",
        letterSpacing: "0.1em",
        // WebkitTextStroke: "1px #161616",
        // textStroke: "1px #161616",
        fontFamily: "Saiba Outline",
      }}
    >
      CONSOLE
    </p>
  </div> */}
</div>

  );
};

export default RemoteControls;
