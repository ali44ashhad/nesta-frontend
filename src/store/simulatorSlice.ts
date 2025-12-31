import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Position {
  x: number;
  y: number;
  angle: number;
}

export interface Obstacle {
  x: number;
  y: number;
  radius?: number;
}

interface SensorReadings {
  ultrasonic: number;
}

// Trail point records the car's position at a moment in time
interface TrailPoint {
  x: number;
  y: number;
}

interface SimulatorState {
  isRunning: boolean;
  position: Position;
  obstaclePositions: Obstacle[];
  sensorReadings: SensorReadings;
  trail: TrailPoint[]; // Add trail to store the car's path
  showTrail: boolean;
  placeObstacleMode: boolean;
  collisionShake: boolean;
  // Remote controls state
  remoteEnabled: boolean;
  continuousMode: boolean;
  showMovementToasts: boolean;
  firmwareExecution: boolean;
}

const initialState: SimulatorState = {
  isRunning: false,
  position: {
    x: 200,
    y: 250,
    angle: 0,
  },
  obstaclePositions: [],
  sensorReadings: {
    ultrasonic: 150,
  },
  trail: [], // Initialize empty trail
  showTrail: true,
  placeObstacleMode: false,
  collisionShake: false,
  // Remote controls initial state
  remoteEnabled: true,
  continuousMode: false,
  showMovementToasts: true,
  firmwareExecution: false,
};

const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {
    startSimulation: (state) => {
      state.isRunning = true;
    },
    stopSimulation: (state) => {
      state.isRunning = false;
    },
    resetSimulation: (state) => {
      state.position = initialState.position;
      state.obstaclePositions = initialState.obstaclePositions;
      state.sensorReadings = initialState.sensorReadings;
      state.trail = []; // Clear the trail when resetting
      state.placeObstacleMode = false;
      state.collisionShake = false;
      // Reset remote controls to initial state
      state.remoteEnabled = initialState.remoteEnabled;
      state.continuousMode = initialState.continuousMode;
      state.showMovementToasts = initialState.showMovementToasts;
      state.firmwareExecution = initialState.firmwareExecution;
    },
    updateCarPosition: (state, action: PayloadAction<Partial<Position>>) => {
      // Add current position to trail before updating
      const MAX_TRAIL_LENGTH = 1000;
      const newTrailPoint = { x: state.position.x, y: state.position.y };
      
      // Optimized trail management: use shift() only when at max capacity
      // This is more efficient than slice(-1000) which creates a new array
      if (state.trail.length >= MAX_TRAIL_LENGTH) {
        // Remove oldest entry and add new one (maintains fixed size)
        state.trail.shift(); // Remove first element (O(n) but only when at max)
        state.trail.push(newTrailPoint); // Add new element (O(1))
      } else {
        // Add new entry (normal case - most efficient)
        state.trail.push(newTrailPoint);
      }

      // Update position
      state.position = {
        ...state.position,
        ...action.payload,
      };
    },
    setObstacles: (state, action: PayloadAction<Obstacle[]>) => {
      state.obstaclePositions = action.payload;
    },
    updateSensorReading: (state, action: PayloadAction<Partial<SensorReadings>>) => {
      state.sensorReadings = {
        ...state.sensorReadings,
        ...action.payload,
      };
    },
    clearTrail: (state) => {
      state.trail = [];
    },
    toggleTrail: (state) => {
      state.showTrail = !state.showTrail;
    },
    setPlaceObstacleMode: (state, action: PayloadAction<boolean>) => {
      state.placeObstacleMode = action.payload;
    },
    togglePlaceObstacleMode: (state) => {
      state.placeObstacleMode = !state.placeObstacleMode;
    },
    setCollisionShake: (state, action: PayloadAction<boolean>) => {
      state.collisionShake = action.payload;
    },
    // Remote controls actions
    setRemoteEnabled: (state, action: PayloadAction<boolean>) => {
      state.remoteEnabled = action.payload;
    },
    toggleRemoteEnabled: (state) => {
      state.remoteEnabled = !state.remoteEnabled;
    },
    setContinuousMode: (state, action: PayloadAction<boolean>) => {
      state.continuousMode = action.payload;
    },
    toggleContinuousMode: (state) => {
      state.continuousMode = !state.continuousMode;
    },
    setShowMovementToasts: (state, action: PayloadAction<boolean>) => {
      state.showMovementToasts = action.payload;
    },
    toggleShowMovementToasts: (state) => {
      state.showMovementToasts = !state.showMovementToasts;
    },
    setFirmwareExecution: (state, action: PayloadAction<boolean>) => {
      state.firmwareExecution = action.payload;
    },
    toggleFirmwareExecution: (state) => {
      state.firmwareExecution = !state.firmwareExecution;
    },
  },
});

export const {
  startSimulation,
  stopSimulation,
  resetSimulation,
  updateCarPosition,
  setObstacles,
  updateSensorReading,
  clearTrail,
  toggleTrail,
  setPlaceObstacleMode,
  togglePlaceObstacleMode,
  setCollisionShake,
  setRemoteEnabled,
  toggleRemoteEnabled,
  setContinuousMode,
  toggleContinuousMode,
  setShowMovementToasts,
  toggleShowMovementToasts,
  setFirmwareExecution,
  toggleFirmwareExecution,
} = simulatorSlice.actions;

export default simulatorSlice.reducer;