import { Obstacle } from '../store/simulatorSlice';
import { HEX_SIZE } from '../components/simulator/hexConfig';

interface Position {
  x: number;
  y: number;
  angle: number;
}

interface CollisionResult {
  hasCollision: boolean;
  safeDistance: number;
  closestObstacleDistance: number;
}

/**
 * Check for obstacle collision in a given direction
 * @param position Current car position
 * @param obstacles Array of obstacles
 * @param moveDistance Distance to move
 * @param direction Direction multiplier (1 for forward, -1 for backward)
 * @returns Collision detection result
 */
export const checkCollision = (
  position: Position,
  obstacles: Obstacle[],
  moveDistance: number,
  direction: 1 | -1 = 1
): CollisionResult => {
  const radians = (position.angle * Math.PI) / 180;
  const sensorX = position.x + Math.cos(radians) * 15 * direction;
  const sensorY = position.y + Math.sin(radians) * 15 * direction;
  const dirX = Math.cos(radians) * direction;
  const dirY = Math.sin(radians) * direction;
  
  let closestObstacleDistance = moveDistance + 20; // Safe distance
  
  obstacles.forEach((obs) => {
    const toObstacleX = obs.x - sensorX;
    const toObstacleY = obs.y - sensorY;
    const dot = toObstacleX * dirX + toObstacleY * dirY;
    
    if (dot > 0 && dot < moveDistance + 20) {
      const closestPointX = sensorX + dirX * dot;
      const closestPointY = sensorY + dirY * dot;
      const distanceToRay = Math.sqrt(
        Math.pow(closestPointX - obs.x, 2) + Math.pow(closestPointY - obs.y, 2)
      );
      const obstacleRadius = obs.radius || HEX_SIZE;
      
      if (distanceToRay < obstacleRadius + 10) { // 10px buffer
        const hitDistance = dot - Math.sqrt(
          Math.pow(obstacleRadius + 10, 2) - Math.pow(distanceToRay, 2)
        );
        if (hitDistance > 0 && hitDistance < closestObstacleDistance) {
          closestObstacleDistance = hitDistance;
        }
      }
    }
  });
  
  const hasCollision = closestObstacleDistance < moveDistance && obstacles.length > 0;
  const safeDistance = hasCollision ? Math.max(0, closestObstacleDistance - 5) : moveDistance;
  
  return {
    hasCollision,
    safeDistance,
    closestObstacleDistance,
  };
};

/**
 * Check if car is currently colliding with any obstacle
 * @param position Current car position
 * @param obstacles Array of obstacles
 * @returns True if colliding
 */
export const isColliding = (position: Position, obstacles: Obstacle[]): boolean => {
  const radians = (position.angle * Math.PI) / 180;
  const dirX = Math.cos(radians);
  const dirY = Math.sin(radians);
  const sensorX = position.x + dirX * 15;
  const sensorY = position.y + dirY * 15;
  
  return obstacles.some((obs) => {
    const toObstacleX = obs.x - sensorX;
    const toObstacleY = obs.y - sensorY;
    const dot = toObstacleX * dirX + toObstacleY * dirY;
    
    if (dot > 0 && dot < 50) {
      const closestPointX = sensorX + dirX * dot;
      const closestPointY = sensorY + dirY * dot;
      const distanceToRay = Math.sqrt(
        Math.pow(closestPointX - obs.x, 2) + Math.pow(closestPointY - obs.y, 2)
      );
      const obstacleRadius = obs.radius || HEX_SIZE;
      
      return distanceToRay < obstacleRadius + 10;
    }
    return false;
  });
};

