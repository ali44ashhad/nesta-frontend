// import { useEffect, useRef } from 'react';

// // Define types for the Canvas component
// interface Position {
//   x: number;
//   y: number;
//   angle: number;
// }

// interface Obstacle {
//   x: number;
//   y: number;
//   radius?: number;
// }

// interface TrailPoint {
//   x: number;
//   y: number;
// }

// interface SensorReadings {
//   ultrasonic: number;
// }

// interface CanvasProps {
//   position: Position;
//   obstacles: Obstacle[];
//   width: number;
//   height: number;
//   showTrail: boolean;
//   trail: TrailPoint[];
//   sensorReadings: SensorReadings;
// }

// const Canvas = ({
//   position,
//   obstacles,
//   width,
//   height,
//   showTrail,
//   trail,
//   sensorReadings
// }: CanvasProps) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   // Draw the car and environment
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Set canvas size
//     canvas.width = width;
//     canvas.height = height;

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Draw grid
//     ctx.strokeStyle = '#eaeaea';
//     ctx.lineWidth = 1;
//     for (let i = 0; i < canvas.width; i += 20) {
//       ctx.beginPath();
//       ctx.moveTo(i, 0);
//       ctx.lineTo(i, canvas.height);
//       ctx.stroke();
//     }
//     for (let i = 0; i < canvas.height; i += 20) {
//       ctx.beginPath();
//       ctx.moveTo(0, i);
//       ctx.lineTo(canvas.width, i);
//       ctx.stroke();
//     }

//     // Draw trail if enabled
//     if (showTrail && trail.length > 0) {
//       ctx.lineWidth = 3;
//       ctx.lineCap = 'round';
//       ctx.lineJoin = 'round';
//       ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';

//       // Draw trail as a continuous line
//       ctx.beginPath();
//       ctx.moveTo(trail[0].x, trail[0].y);

//       for (let i = 1; i < trail.length; i++) {
//         ctx.lineTo(trail[i].x, trail[i].y);
//       }

//       // Connect to current position
//       ctx.lineTo(position.x, position.y);
//       ctx.stroke();

//       // Draw dots at each point for better visibility
//       ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
//       trail.forEach(point => {
//         ctx.beginPath();
//         ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
//         ctx.fill();
//       });
//     }

//     // Draw obstacles
//     ctx.fillStyle = '#e63946';
//     obstacles.forEach(obstacle => {
//       ctx.beginPath();
//       ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 10, 0, Math.PI * 2);
//       ctx.fill();
//     });

//     // Draw car
//     ctx.save();
//     ctx.translate(position.x, position.y);
//     ctx.rotate((position.angle * Math.PI) / 180);

//     // Car body
//     ctx.fillStyle = '#457b9d';
//     ctx.fillRect(-15, -10, 30, 20);

//     // Car details (front)
//     ctx.fillStyle = '#a8dadc';
//     ctx.fillRect(10, -5, 5, 10);

//     // Wheels
//     ctx.fillStyle = '#333';
//     ctx.fillRect(-12, -12, 6, 4);
//     ctx.fillRect(-12, 8, 6, 4);
//     ctx.fillRect(6, -12, 6, 4);
//     ctx.fillRect(6, 8, 6, 4);

//     ctx.restore();

//     // Draw ultrasonic sensor beam if close to an obstacle
//     if (sensorReadings.ultrasonic > 0 && sensorReadings.ultrasonic < 100) {
//       const distance = sensorReadings.ultrasonic;
//       ctx.strokeStyle = `rgba(255, 255, 0, ${1 - distance / 100})`;
//       ctx.lineWidth = 2;

//       const radians = (position.angle * Math.PI) / 180;
//       const sensorX = position.x + Math.cos(radians) * 15;
//       const sensorY = position.y + Math.sin(radians) * 15;
//       const beamEndX = sensorX + Math.cos(radians) * distance;
//       const beamEndY = sensorY + Math.sin(radians) * distance;

//       ctx.beginPath();
//       ctx.moveTo(sensorX, sensorY);
//       ctx.lineTo(beamEndX, beamEndY);
//       ctx.stroke();
//     }

//     // Draw direction indicator (heading)
//     const radians = (position.angle * Math.PI) / 180;
//     const headingX = position.x + Math.cos(radians) * 30;
//     const headingY = position.y + Math.sin(radians) * 30;

//     ctx.strokeStyle = 'rgba(0, 200, 0, 0.7)';
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(position.x, position.y);
//     ctx.lineTo(headingX, headingY);
//     ctx.stroke();

//   }, [position, obstacles, width, height, trail, showTrail, sensorReadings]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="w-full h-full"
//       style={{ backgroundColor: 'green' }}
//     />
//   );
// };

// export default Canvas;

// import { useEffect, useRef, useState } from "react";
// import carPng from "../../assets/Modern/Pasted Graphic.png";
// import carSvg from "../../assets/Modern/car.svg";
// interface Position {
//   x: number;
//   y: number;
//   angle: number;
// }

// interface Obstacle {
//   x: number;
//   y: number;
//   radius?: number;
// }

// interface TrailPoint {
//   x: number;
//   y: number;
// }

// interface SensorReadings {
//   ultrasonic: number;
// }

// interface CanvasProps {
//   position: Position;
//   obstacles: Obstacle[];
//   width: number;
//   height: number;
//   showTrail: boolean;
//   trail: TrailPoint[];
//   sensorReadings: SensorReadings;
// }

// const Canvas = ({
//   position,
//   obstacles,
//   width,
//   height,
//   showTrail,
//   trail,
//   sensorReadings,
// }: CanvasProps) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const carImageRef = useRef<HTMLImageElement | null>(null);
//   const imageLoadedRef = useRef(false);
//   const [useSvgCar, setUseSvgCar] = useState(true); // ✅ toggler (change true/false)

//   // === Load image or SVG ===
//   useEffect(() => {
//     const img = new Image();
//     img.onload = () => {
//       carImageRef.current = img;
//       imageLoadedRef.current = true;
//     };

//     // ✅ load SVG or PNG dynamically
//     if (useSvgCar) {
//       // convert SVG to base64 URL
//       fetch(carSvg)
//         .then((res) => res.text())
//         .then((svgText) => {
//           const blob = new Blob([svgText], { type: "image/svg+xml" });
//           img.src = URL.createObjectURL(blob);
//         });
//     } else {
//       img.src = carPng;
//     }
//   }, [useSvgCar]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     canvas.width = width;
//     canvas.height = height;

//     // === Background ===
//     ctx.fillStyle = "#151515";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     // === Honeycomb Grid ===
//     const hexSize = 15;
//     const hexHeight = Math.sqrt(3) * hexSize;
//     const hexWidth = 2 * hexSize;
//     const horizontalSpacing = 2;
//     const verticalSpacing = 3;
//     const vertStep = hexHeight + verticalSpacing;
//     const horizStep = (3 / 4) * hexWidth + horizontalSpacing;

//     ctx.strokeStyle = "rgba(255,255,255,0.15)";
//     ctx.lineWidth = 1;

//     for (let y = 0; y < height + hexHeight; y += vertStep) {
//       for (let x = 0; x < width + hexWidth; x += horizStep) {
//         const offsetY = (Math.floor(x / horizStep) % 2) * (hexHeight / 2);
//         drawHex(ctx, x, y + offsetY, hexSize);
//       }
//     }

//     // === Trail ===
//     if (showTrail && trail.length > 0) {
//       ctx.lineWidth = 3;
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";
//       ctx.strokeStyle = "rgba(255, 255, 255, 1)";

//       ctx.beginPath();
//       ctx.moveTo(trail[0].x, trail[0].y);
//       for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
//       ctx.lineTo(position.x, position.y);
//       ctx.stroke();

//       ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
//       trail.forEach((point) => {
//         ctx.beginPath();
//         ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
//         ctx.fill();
//       });
//     }

//     // === Obstacles ===
//     ctx.fillStyle = "#e63946";
//     obstacles.forEach((obstacle) => {
//       ctx.beginPath();
//       ctx.arc(obstacle.x, obstacle.y, obstacle.radius || 10, 0, Math.PI * 2);
//       ctx.fill();
//     });

//     // === Car ===
//     if (imageLoadedRef.current && carImageRef.current) {
//       const carImg = carImageRef.current;
//       const carWidth = 50;
//       const carHeight = (carImg.height / carImg.width) * carWidth;

//       ctx.save();
//       ctx.translate(position.x, position.y);
//       ctx.rotate(((position.angle - 90) * Math.PI) / 180);
//       ctx.drawImage(carImg, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
//       ctx.restore();
//     } else {
//       // Placeholder while image not loaded
//       ctx.save();
//       ctx.translate(position.x, position.y);
//       ctx.rotate(((position.angle - 90) * Math.PI) / 180);
//       ctx.fillStyle = "#457b9d";
//       ctx.fillRect(-20, -10, 40, 20);
//       ctx.restore();
//     }

//     // === Ultrasonic Beam ===
//     if (sensorReadings.ultrasonic > 0 && sensorReadings.ultrasonic < 100) {
//       const distance = sensorReadings.ultrasonic;
//       ctx.strokeStyle = `rgba(255, 255, 0, ${1 - distance / 100})`;
//       ctx.lineWidth = 2;

//       const radians = (position.angle * Math.PI) / 180;
//       const sensorX = position.x + Math.cos(radians) * 15;
//       const sensorY = position.y + Math.sin(radians) * 15;
//       const beamEndX = sensorX + Math.cos(radians) * distance;
//       const beamEndY = sensorY + Math.sin(radians) * distance;

//       ctx.beginPath();
//       ctx.moveTo(sensorX, sensorY);
//       ctx.lineTo(beamEndX, beamEndY);
//       ctx.stroke();
//     }

//     // === Heading Indicator ===
//     const radians = (position.angle * Math.PI) / 180;
//     const headingX = position.x + Math.cos(radians) * 30;
//     const headingY = position.y + Math.sin(radians) * 30;

//     ctx.strokeStyle = "rgba(0, 200, 0, 0.7)";
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(position.x, position.y);
//     ctx.lineTo(headingX, headingY);
//     ctx.stroke();

//     // === Helper for hex ===
//     function drawHex(
//       ctx: CanvasRenderingContext2D,
//       x: number,
//       y: number,
//       size: number
//     ) {
//       const a = (Math.PI / 180) * 60;
//       ctx.beginPath();
//       for (let i = 0; i < 6; i++) {
//         const angle = a * i;
//         const px = x + size * Math.cos(angle);
//         const py = y + size * Math.sin(angle);
//         if (i === 0) ctx.moveTo(px, py);
//         else ctx.lineTo(px, py);
//       }
//       ctx.closePath();
//       ctx.stroke();
//     }
//   }, [position, obstacles, width, height, trail, showTrail, sensorReadings, useSvgCar]);

//   return (
//     <div className="relative w-full h-full">
//       <canvas ref={canvasRef} className="w-full h-full" />

//       {/* ✅ Optional on-screen toggler button */}
//       <button
//         onClick={() => setUseSvgCar((prev) => !prev)}
//         className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-3 py-1 rounded"
//       >
//         {useSvgCar ? "SVG Mode" : "PNG Mode"}
//       </button>
//     </div>
//   );
// };

// export default Canvas;

import { useEffect, useRef, useState } from "react";
import carPng from "../../assets/Modern/Pasted Graphic.png";
import carSvg from "../../assets/Modern/car.svg";
import Gamepadsimulatorbtnreset from "../icons/simulatorbtnRESET";
// import Gamepadsimulatorbtnstart from "../icons/simulatorbtnstart";
import Gamepadsimulatorbtnstop from "../icons/simulatorbtnSTOP";
import Gamepadsimulatorbtnstart from "../icons/simulatorbtnSTART";
import GamepadsimulatorbtnFirmwareFlash from "../icons/simulatorbtnfirmwareflash";
import GamepadsimulatorbtnSimulator from "../icons/simulatorbtnSimulator";
import GamepadsimulatorbtnCode from "../icons/simulatorbtnCode";

interface Position {
  x: number;
  y: number;
  angle: number;
}
interface Obstacle {
  x: number;
  y: number;
  radius?: number;
}
interface TrailPoint {
  x: number;
  y: number;
}
interface SensorReadings {
  ultrasonic: number;
}

interface CanvasProps {
  position: Position;
  obstacles: Obstacle[];
  width: number;
  height: number;
  showTrail: boolean;
  trail: TrailPoint[];
  sensorReadings: SensorReadings;
  // Simulator Control handlers
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  onFirmwareFlash?: () => void;
  onShowSimulator?: () => void;
  onShowCode?: () => void;
  canFirmwareFlash?: boolean;
  placeObstacleMode?: boolean;
  onAddObstacleAtPosition?: (x: number, y: number) => void;
  onUpdateObstaclePosition?: (index: number, x: number, y: number) => void;
  onRemoveObstacle?: (index: number) => void;
  collisionShake?: boolean;
  onPositionChange?: (newPosition: { x: number; y: number }) => void;
}

const Canvas = ({
  position,
  obstacles,
  width,
  height,
  showTrail,
  trail,
  sensorReadings,
  onStart,
  onStop,
  onReset,
  isRunning = false,
  onFirmwareFlash,
  onShowSimulator,
  onShowCode,
  canFirmwareFlash = true,
  placeObstacleMode = false,
  onAddObstacleAtPosition,
  onUpdateObstaclePosition,
  onRemoveObstacle,
  collisionShake = false,
  onPositionChange,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carImageRef = useRef<HTMLImageElement | null>(null);
  const [useSvgCar] = useState(true);
  const [imageReady, setImageReady] = useState(false); // ✅ track when ready
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingObstacle, setIsDraggingObstacle] = useState(false);
  const [draggedObstacleIndex, setDraggedObstacleIndex] = useState<number | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<{ x: number; y: number } | null>(null);
  const obstacleUpdateRef = useRef<{ index: number; x: number; y: number } | null>(null);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0, rotation: 0 });
  const shakeAnimationRef = useRef<number | null>(null);

  const HEX_SIZE = 10;
  const HORIZONTAL_SPACING = 1;
  const VERTICAL_SPACING = 1;
  const HEX_HEIGHT = Math.sqrt(3) * HEX_SIZE;
  const HEX_WIDTH = 2 * HEX_SIZE;
  const VERT_STEP = HEX_HEIGHT + VERTICAL_SPACING;
  const HORIZ_STEP = (3 / 4) * HEX_WIDTH + HORIZONTAL_SPACING;

  // === Load image (SVG or PNG) ===
  useEffect(() => {
    setImageReady(false);
    const img = new Image();
    img.onload = () => {
      carImageRef.current = img;
      setImageReady(true); // ✅ trigger re-render when ready
    };

    if (useSvgCar) {
      fetch(carSvg)
        .then((res) => res.text())
        .then((svgText) => {
          const blob = new Blob([svgText], { type: "image/svg+xml" });
          img.src = URL.createObjectURL(blob);
        })
        .catch(() => setImageReady(false));
    } else {
      img.src = carPng;
    }
  }, [useSvgCar]);

  // === Draw everything ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    //sharper graphics
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#E4F7FB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Honeycomb grid
    const hexSize = HEX_SIZE;
    const hexHeight = HEX_HEIGHT;
    const hexWidth = HEX_WIDTH;
    // const horizontalSpacing = HORIZONTAL_SPACING;
    // const verticalSpacing = VERTICAL_SPACING;
    const vertStep = VERT_STEP;
    const horizStep = HORIZ_STEP;

    // ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.strokeStyle = "rgba(57, 8, 236, 0.25)";

    ctx.lineWidth = 0.12;

    for (let y = 0; y < height + hexHeight; y += vertStep) {
      for (let x = 0; x < width + hexWidth; x += horizStep) {
        const offsetY = (Math.floor(x / horizStep) % 2) * (hexHeight / 2);
        drawHex(ctx, x, y + offsetY, hexSize);
      }
    }

    // Trail
    if (showTrail && trail.length > 0) {
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#CDECF8";
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      trail.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // === Hexagon Obstacles ===
    ctx.fillStyle = "#2FC1E8"; // red hexes
    obstacles.forEach((o) => {
      drawFilledHex(ctx, o.x, o.y, HEX_SIZE);
    });

    // helper for filled hexagons
    function drawFilledHex(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number
    ) {
      const angle = (Math.PI / 180) * 60;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = angle * i;
        const px = x + size * Math.cos(a);
        const py = y + size * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }

    // === Car ===
    const carImg = carImageRef.current;
    if (imageReady && carImg) {
      const carWidth = 35;
      const carHeight = (carImg.height / carImg.width) * carWidth;
      ctx.save();
      // Apply shake offset to car position
      ctx.translate(position.x + shakeOffset.x, position.y + shakeOffset.y);
      ctx.rotate(((position.angle - 90) * Math.PI) / 180 + shakeOffset.rotation);
      ctx.drawImage(carImg, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
      ctx.restore();
    } else {
      // Fallback placeholder until SVG/PNG loads
      ctx.save();
      // Apply shake offset to car position
      ctx.translate(position.x + shakeOffset.x, position.y + shakeOffset.y);
      ctx.rotate(((position.angle - 90) * Math.PI) / 180 + shakeOffset.rotation);
      ctx.fillStyle = "#457b9d";
      ctx.fillRect(-20, -10, 40, 20);
      ctx.restore();
    }

    // Ultrasonic Beam
    if (sensorReadings.ultrasonic > 0 && sensorReadings.ultrasonic < 100) {
      const d = sensorReadings.ultrasonic;
      ctx.strokeStyle = `rgba(255,255,0,${1 - d / 100})`;
      ctx.lineWidth = 2;
      const rad = (position.angle * Math.PI) / 180;
      const sx = position.x + Math.cos(rad) * 15;
      const sy = position.y + Math.sin(rad) * 15;
      const ex = sx + Math.cos(rad) * d;
      const ey = sy + Math.sin(rad) * d;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Heading indicator
    const rad = (position.angle * Math.PI) / 180;
    const hx = position.x + Math.cos(rad) * 30;
    const hy = position.y + Math.sin(rad) * 30;
    ctx.strokeStyle = "rgba(0,100,0,0.1)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    // helper
    function drawHex(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      s: number
    ) {
      const a = (Math.PI / 180) * 60;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = a * i;
        const px = x + s * Math.cos(ang);
        const py = y + s * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }, [
    position,
    obstacles,
    width,
    height,
    trail,
    showTrail,
    sensorReadings,
    useSvgCar,
    imageReady, // ✅ ensures redraw when image finishes loading
    shakeOffset.x,
    shakeOffset.y,
    shakeOffset.rotation,
  ]);

  // Shake animation effect for car when collision occurs
  useEffect(() => {
    if (collisionShake) {
      const duration = 100; // 0.1s in milliseconds
      const startTime = Date.now();
      const steps = [
        { x: 0, y: 0, rotation: 0 },
        { x: -3, y: -3, rotation: -1 * Math.PI / 180 },
        { x: 3, y: 3, rotation: 1 * Math.PI / 180 },
        { x: -3, y: -3, rotation: -1 * Math.PI / 180 },
        { x: 3, y: 3, rotation: 1 * Math.PI / 180 },
        { x: -3, y: -3, rotation: -1 * Math.PI / 180 },
        { x: 3, y: 3, rotation: 1 * Math.PI / 180 },
        { x: -3, y: -3, rotation: -1 * Math.PI / 180 },
        { x: 3, y: 3, rotation: 1 * Math.PI / 180 },
        { x: 0, y: 0, rotation: 0 },
      ];
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const stepIndex = Math.floor(progress * (steps.length - 1));
        const currentStep = steps[stepIndex];
        
        setShakeOffset({
          x: currentStep.x,
          y: currentStep.y,
          rotation: currentStep.rotation,
        });
        
        if (progress < 1) {
          shakeAnimationRef.current = requestAnimationFrame(animate);
        } else {
          setShakeOffset({ x: 0, y: 0, rotation: 0 });
          shakeAnimationRef.current = null;
        }
      };
      
      shakeAnimationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (shakeAnimationRef.current) {
          cancelAnimationFrame(shakeAnimationRef.current);
          shakeAnimationRef.current = null;
        }
        setShakeOffset({ x: 0, y: 0, rotation: 0 });
      };
    } else {
      setShakeOffset({ x: 0, y: 0, rotation: 0 });
    }
  }, [collisionShake]);

  // Helper function to check if a point is on the car
  const isPointOnCar = (x: number, y: number): boolean => {
    const carWidth = 35;
    const carHeight = carImageRef.current 
      ? (carImageRef.current.height / carImageRef.current.width) * carWidth 
      : 20;
    const carRadius = Math.max(carWidth, carHeight) / 2;
    const distance = Math.sqrt(
      Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
    );
    return distance <= carRadius + 5; // 5px tolerance
  };

  // Helper function to check if a point is on an obstacle
  const getObstacleAtPoint = (x: number, y: number): number | null => {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      const distance = Math.sqrt(
        Math.pow(x - obs.x, 2) + Math.pow(y - obs.y, 2)
      );
      const radius = obs.radius || HEX_SIZE;
      if (distance <= radius + 5) { // 5px tolerance
        return i;
      }
    }
    return null;
  };


  // Mouse down handler - start dragging or place obstacle
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Use logical width/height, not scaled canvas dimensions
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    
    // Right-click: Remove obstacle
    if (e.button === 2 && onRemoveObstacle) {
      const obstacleIndex = getObstacleAtPoint(coords.x, coords.y);
      if (obstacleIndex !== null) {
        onRemoveObstacle(obstacleIndex);
        e.preventDefault();
        return;
      }
    }
    
    // Note: Double-click removal is handled in handleDoubleClick below
    
    // If in place obstacle mode, place obstacle at click position
    if (placeObstacleMode && onAddObstacleAtPosition) {
      onAddObstacleAtPosition(coords.x, coords.y);
      e.preventDefault();
      return;
    }
    
    // Check for obstacle dragging first (before car)
    if (onUpdateObstaclePosition) {
      const obstacleIndex = getObstacleAtPoint(coords.x, coords.y);
      if (obstacleIndex !== null) {
        setIsDraggingObstacle(true);
        setDraggedObstacleIndex(obstacleIndex);
        dragStartRef.current = { x: coords.x, y: coords.y };
        e.preventDefault();
        return;
      }
    }
    
    // Handle car dragging (allowed even during simulation)
    if (!onPositionChange) return;
    
    if (isPointOnCar(coords.x, coords.y)) {
      setIsDragging(true);
      dragStartRef.current = { x: coords.x, y: coords.y };
      e.preventDefault();
    }
  };

  // Mouse move handler - update position while dragging (throttled with RAF)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    // Use logical width/height, not scaled canvas dimensions
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    
    // Handle obstacle dragging
    if (isDraggingObstacle && draggedObstacleIndex !== null && onUpdateObstaclePosition) {
      const buffer = 20; // Keep obstacle within bounds
      let newX = coords.x;
      let newY = coords.y;
      
      // Constrain to canvas bounds
      newX = Math.max(buffer, Math.min(width - buffer, newX));
      newY = Math.max(buffer, Math.min(height - buffer, newY));
      
      // Store the latest position
      obstacleUpdateRef.current = { index: draggedObstacleIndex, x: newX, y: newY };
      
      // Throttle updates using requestAnimationFrame
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (obstacleUpdateRef.current && onUpdateObstaclePosition) {
            onUpdateObstaclePosition(
              obstacleUpdateRef.current.index,
              obstacleUpdateRef.current.x,
              obstacleUpdateRef.current.y
            );
          }
          rafRef.current = null;
        });
      }
      return;
    }
    
    // Handle car dragging
    if (!isDragging || !onPositionChange) return;
    
    const buffer = 20; // Keep car within bounds
    
    // Calculate new position
    let newX = coords.x;
    let newY = coords.y;
    
    // Constrain to canvas bounds
    newX = Math.max(buffer, Math.min(width - buffer, newX));
    newY = Math.max(buffer, Math.min(height - buffer, newY));
    
    // Store the latest position
    lastUpdateRef.current = { x: newX, y: newY };
    
    // Throttle updates using requestAnimationFrame
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (lastUpdateRef.current && onPositionChange) {
          onPositionChange(lastUpdateRef.current);
        }
        rafRef.current = null;
      });
    }
  };

  // Double click handler - remove obstacle
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onRemoveObstacle) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    
    const coords = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    
    // Check if double-click is on an obstacle
    const obstacleIndex = getObstacleAtPoint(coords.x, coords.y);
    if (obstacleIndex !== null) {
      onRemoveObstacle(obstacleIndex);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Mouse up handler - stop dragging
  const handleMouseUp = () => {
    // Handle obstacle dragging end
    if (isDraggingObstacle) {
      // Cancel any pending RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Ensure final position is updated
      if (obstacleUpdateRef.current && onUpdateObstaclePosition) {
        onUpdateObstaclePosition(
          obstacleUpdateRef.current.index,
          obstacleUpdateRef.current.x,
          obstacleUpdateRef.current.y
        );
        obstacleUpdateRef.current = null;
      }
      
      setIsDraggingObstacle(false);
      setDraggedObstacleIndex(null);
      dragStartRef.current = null;
    }
    
    // Handle car dragging end
    if (isDragging) {
      // Cancel any pending RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Ensure final position is updated
      if (lastUpdateRef.current && onPositionChange) {
        onPositionChange(lastUpdateRef.current);
        lastUpdateRef.current = null;
      }
      
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  // Mouse leave handler - stop dragging if mouse leaves canvas
  const handleMouseLeave = () => {
    if (isDragging) {
      // Cancel any pending RAF
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      
      // Ensure final position is updated
      if (lastUpdateRef.current && onPositionChange) {
        onPositionChange(lastUpdateRef.current);
        lastUpdateRef.current = null;
      }
      
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging || isDraggingObstacle) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        // Use logical width/height, not scaled canvas dimensions
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        
        const coords = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
        
        const buffer = 20; // Keep within bounds
        
        // Handle obstacle dragging
        if (isDraggingObstacle && draggedObstacleIndex !== null && onUpdateObstaclePosition) {
          let newX = coords.x;
          let newY = coords.y;
          
          // Constrain to canvas bounds
          newX = Math.max(buffer, Math.min(width - buffer, newX));
          newY = Math.max(buffer, Math.min(height - buffer, newY));
          
          // Store the latest position
          obstacleUpdateRef.current = { index: draggedObstacleIndex, x: newX, y: newY };
          
          // Throttle updates using requestAnimationFrame
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              if (obstacleUpdateRef.current && onUpdateObstaclePosition) {
                onUpdateObstaclePosition(
                  obstacleUpdateRef.current.index,
                  obstacleUpdateRef.current.x,
                  obstacleUpdateRef.current.y
                );
              }
              rafRef.current = null;
            });
          }
          return;
        }
        
        // Handle car dragging
        if (!isDragging || !onPositionChange) return;
        
        // Calculate new position
        let newX = coords.x;
        let newY = coords.y;
        
        // Constrain to canvas bounds
        newX = Math.max(buffer, Math.min(width - buffer, newX));
        newY = Math.max(buffer, Math.min(height - buffer, newY));
        
        // Store the latest position
        lastUpdateRef.current = { x: newX, y: newY };
        
        // Throttle updates using requestAnimationFrame
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            if (lastUpdateRef.current && onPositionChange) {
              onPositionChange(lastUpdateRef.current);
            }
            rafRef.current = null;
          });
        }
      };
      
      const handleGlobalMouseUp = () => {
        // Cancel any pending RAF
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        
        // Handle obstacle dragging end
        if (isDraggingObstacle) {
          if (obstacleUpdateRef.current && onUpdateObstaclePosition) {
            onUpdateObstaclePosition(
              obstacleUpdateRef.current.index,
              obstacleUpdateRef.current.x,
              obstacleUpdateRef.current.y
            );
            obstacleUpdateRef.current = null;
          }
          setIsDraggingObstacle(false);
          setDraggedObstacleIndex(null);
        }
        
        // Handle car dragging end
        if (isDragging) {
          if (lastUpdateRef.current && onPositionChange) {
            onPositionChange(lastUpdateRef.current);
            lastUpdateRef.current = null;
          }
          setIsDragging(false);
        }
        
        dragStartRef.current = null;
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        // Cancel any pending RAF on cleanup
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isDraggingObstacle, draggedObstacleIndex, onPositionChange, onUpdateObstaclePosition, width, height]);

  // Update cursor style based on hover
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (placeObstacleMode) {
      canvas.style.cursor = 'crosshair';
      return;
    }

    if (!onPositionChange) {
      canvas.style.cursor = 'default';
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Use logical width/height, not scaled canvas dimensions
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // Check for obstacle first (obstacles have priority for cursor)
      if (onUpdateObstaclePosition && getObstacleAtPoint(x, y) !== null) {
        canvas.style.cursor = isDraggingObstacle ? 'grabbing' : 'grab';
      } else if (isPointOnCar(x, y)) {
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, isDraggingObstacle, isRunning, onPositionChange, onUpdateObstaclePosition, placeObstacleMode, position, obstacles, width, height]);

  return (
    <div 
      className="relative w-full h-full"
      style={{
        clipPath:
          window.innerWidth >= 1024
            // Big devices: use the "upper one"
            ? "polygon(0% 0%, 91% 0%, 100% 8%, 100% 35%, 97% 38%, 97% 62%, 100% 65%, 100% 92%, 91% 100%, 0% 100%, 0% 100%)"
            // Tablets: use the "lower one"
            : "polygon(0% 0%, 90% 0%, 100% 4%, 100% 36%, 97% 39%, 97% 62%, 100% 65%, 100% 96%, 91% 100%, 0% 100%, 0% 100%)"
      }}
    >
    
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()} // Prevent default right-click menu
      />

      {/* Top controls: Firmware flash / Simulator / Code */}
      {(onFirmwareFlash || onShowSimulator || onShowCode) && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-3">
          {(onFirmwareFlash || !canFirmwareFlash) && (
            <button
              onClick={onFirmwareFlash}
              disabled={!onFirmwareFlash || !canFirmwareFlash}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                onFirmwareFlash && canFirmwareFlash
                  ? "text-white"
                  : "text-white cursor-not-allowed opacity-70"
              }`}
              style={{ minWidth: "120px", minHeight: "48px" }}
            >
              <span className="block w-full h-full">
                <GamepadsimulatorbtnFirmwareFlash
                  fillColor={onFirmwareFlash && canFirmwareFlash ? "#2FC1E8" : "#dddddd"}
                  text="FIRMWARE|FLASH"
                  className="w-36 h-12 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%" }}
                />
              </span>
            </button>
          )}
          {onShowSimulator && (
            <button
              onClick={onShowSimulator}
              className="px-3 py-1 text-white rounded text-xs transition-colors"
              style={{ minWidth: "120px", minHeight: "48px" }}
            >
              <span className="block w-full h-full">
                <GamepadsimulatorbtnSimulator 
                  fillColor="#ffffff" 
                  text="SIMULATOR" 
                  className="w-36 h-12 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%" }}
                />
              </span>
            </button>
          )}
          {onShowCode && (
            <button
              onClick={onShowCode}
              className="px-3 py-1 text-white rounded text-xs transition-colors"
              style={{ minWidth: "120px", minHeight: "48px" }}
            >
              <span className="block w-full h-full">
                <GamepadsimulatorbtnCode 
                  fillColor="#ffffff" 
                  text="CODE" 
                  className="w-36 h-12 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%" }}
                />
              </span>
            </button>
          )}
        </div>
      )}

      {/* Bottom controls: Start / Reset / Stop */}
      {(onStart || onStop || onReset) && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0">
          {onStart && (
            <button
              onClick={onStart}
              disabled={isRunning}
              className="px-3 py-1 text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: "120px", minHeight: "54px" }}
            >
              <span className="block w-full h-full">
                <Gamepadsimulatorbtnstart
                  fillColor="#0bd70eff"
                  text="START"
                  className="w-40 h-14 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%" }}
                />
              </span>
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-2 py-1 rounded text-xs text-white transition-colors"
              style={{ minWidth: "120px", minHeight: "54px" }}
            >
              <span className="block w-full h-full">
                <Gamepadsimulatorbtnreset
                  fillColor="#FED139"
                  text="RESET"
                  className="w-40 h-14 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%" }}
                />
              </span>
            </button>
          )}
          {onStop && (
            <button
              onClick={onStop}
              disabled={!isRunning}
              className="px-2 py-1 bg-red-600 rounded text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: "120px", minHeight: "54px" }}
            >
              <span className="block w-full h-full">
                <Gamepadsimulatorbtnstop
                  fillColor="#ffffff"
                  text="STOP"
                  className="w-44 h-16 max-w-full max-h-full"
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </span>
            </button>
          )}
        </div>
      )}

      {/* <button
        onClick={() => setUseSvgCar((p) => !p)}
        className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-3 py-1 rounded"
      >
        {useSvgCar ? "SVG Mode" : "PNG Mode"}
      </button> */}
    </div>
  );
};

export default Canvas;
