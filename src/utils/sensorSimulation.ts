import { SIMULATOR_CONSTANTS } from "./simulatorConstants";
import { HEX_SIZE } from "../components/simulator/hexConfig";
import type { Obstacle } from "../store/simulatorSlice";

interface SensorContext {
  position: { x: number; y: number; angle: number };
  obstacles: Obstacle[];
}

/**
 * Get ultrasonic sensor reading using ray-casting
 */
export const getUltrasonicReading = (
  context: SensorContext,
  _port?: number | string
): number => {
  const { x, y, angle } = context.position;
  const radians = (angle * Math.PI) / 180;
  
  // Sensor direction vector (forward direction)
  const dirX = Math.cos(radians);
  const dirY = Math.sin(radians);
  
  // Sensor position (slightly in front of robot center)
  const sensorX = x + dirX * SIMULATOR_CONSTANTS.SENSOR_OFFSET;
  const sensorY = y + dirY * SIMULATOR_CONSTANTS.SENSOR_OFFSET;
  
  const maxDistance = SIMULATOR_CONSTANTS.ULTRASONIC_MAX_DISTANCE;
  let closestHit: number = maxDistance;

  context.obstacles.forEach((obs) => {
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
        Math.pow(closestPointX - obs.x, 2) + Math.pow(closestPointY - obs.y, 2)
      );
      
      // Obstacle radius (hexagon size)
      const obstacleRadius = obs.radius || HEX_SIZE;
      
      // Check if the ray intersects with the obstacle
      if (distanceToRay < obstacleRadius) {
        // Calculate the actual hit distance along the ray
        const hitDistance = dot - Math.sqrt(
          Math.pow(obstacleRadius, 2) - Math.pow(distanceToRay, 2)
        );
        
        // Update closest hit if this is closer
        if (hitDistance > 0 && hitDistance < closestHit) {
          closestHit = hitDistance;
        }
      }
    }
  });

  return Math.max(0, Math.floor(closestHit));
};

/**
 * Get IR sensor reading (returns boolean - true if obstacle detected within threshold)
 */
export const getIRSensorReading = (
  context: SensorContext,
  _port?: number | string
): boolean => {
  const distance = getUltrasonicReading(context);
  return distance < SIMULATOR_CONSTANTS.IR_DETECTION_THRESHOLD;
};

/**
 * Get temperature sensor reading (simulated - returns temperature in Celsius)
 */
export const getTemperatureSensorReading = (
  _context: SensorContext,
  _port?: number | string
): number => {
  // Simulated temperature: base 25°C with slight variation
  return SIMULATOR_CONSTANTS.TEMP_BASE + 
    Math.sin(Date.now() / 10000) * SIMULATOR_CONSTANTS.TEMP_VARIATION;
};

/**
 * Get LDR (Light Dependent Resistor) sensor reading (simulated - returns light level 0-1023)
 */
export const getLDRSensorReading = (
  _context: SensorContext,
  _port?: number | string
): number => {
  // Simulated light level: base 500 with variation
  return Math.floor(
    SIMULATOR_CONSTANTS.LDR_BASE + 
    Math.sin(Date.now() / 5000) * SIMULATOR_CONSTANTS.LDR_VARIATION
  );
};

