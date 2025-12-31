import React from "react";

type GamepadsimulatorbtnBacktoSimulatorProps = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const GamepadsimulatorbtnBacktoSimulator: React.FC<
  GamepadsimulatorbtnBacktoSimulatorProps
> = ({
  fillColor = "#2FC1E8",
  text,
  ...props
}) => (
  <svg
    width="77"
    height="30"
    viewBox="0 0 77 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0.5 29.1001V6.6001L6.5 0.600098H70.1L76.1 6.6001V29.1001H0.5Z"
      fill={fillColor}
    />
    <path
      d="M69.9 1.1L72.9 4.1L75.6 6.8V28.6H1V6.8L3.90002 3.9L6.79993 1H69.9M70.2999 0H6.29993C3.79993 2.5 2.4 3.9 0 6.3V29.6H76.7V6.4C74.1 3.9 72.7999 2.5 70.2999 0Z"
      fill="black"
    />
    <path
      d="M42.0999 1.1001H40.2998L41.0999 1.8001H42.8999L42.0999 1.1001Z"
      fill="black"
    />
    <path
      d="M39.9001 1.1001H38.1001L38.8 1.8001H40.7001L39.9001 1.1001Z"
      fill="black"
    />
    <path
      d="M37.6998 1.1001H35.8999L36.5999 1.8001H38.4999L37.6998 1.1001Z"
      fill="black"
    />
    <path d="M35.5 1.1001H33.7L34.4 1.8001H36.2999L35.5 1.1001Z" fill="black" />
    <path
      d="M42.0999 27.7998H40.2998L41.0999 28.5998H42.8999L42.0999 27.7998Z"
      fill="black"
    />
    <path
      d="M39.9001 27.7998H38.1001L38.8 28.5998H40.7001L39.9001 27.7998Z"
      fill="black"
    />
    <path
      d="M37.6998 27.7998H35.8999L36.5999 28.5998H38.4999L37.6998 27.7998Z"
      fill="black"
    />
    <path
      d="M35.5 27.7998H33.7L34.4 28.5998H36.2999L35.5 27.7998Z"
      fill="black"
    />
    <path d="M1 7.5998V9.3998L1.79993 8.5998V6.7998L1 7.5998Z" fill="black" />
    <path d="M1 9.8V11.6L1.79993 10.8V9L1 9.8Z" fill="black" />
    <path
      d="M10.7998 1.8001H8.8999L9.69983 1.1001H11.5999L10.7998 1.8001Z"
      fill="black"
    />
    <path
      d="M8.59998 1.8001H6.69995L7.5 1.1001H9.29993L8.59998 1.8001Z"
      fill="black"
    />
     {text && (() => {
      // Adjusts fontSize and positioning responsively based on SVG width
      // Default SVG viewBox is "0 0 77 30"
      // Calculate a scale factor based on actual width passed to the SVG
      const baseWidth = 77;
      const baseFontSize = 7;
      // Get width prop from ...props or default
      let width = 77;
      if (props.width) {
        if (typeof props.width === "number") width = props.width;
        else if (typeof props.width === "string") {
          // handle "100%" or "30px"
          if (props.width.endsWith("%")) {
            // fallback for percent: use base
            width = baseWidth;
          } else if (props.width.endsWith("px")) {
            width = parseInt(props.width, 10);
          }
        }
      }
      const scale = width / baseWidth;
      const fontSize = baseFontSize * scale;
      const textX = 35 * scale;
      const textY = 15 * scale;
      return (
        <text
          x={textX}
          y={textY}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="900"
          fill="#000000"
          fontFamily="Cyberank, Arial, sans-serif"
          style={{
            dominantBaseline: "middle",
            userSelect: "none",
          }}
        >
          {text}
        </text>
      );
    })()}
    <path
      d="M75.5999 7.60029V9.40029L74.7998 8.60029V6.80029L75.5999 7.60029Z"
      fill="black"
    />
    <path
      d="M75.5999 9.80049V11.6005L74.7998 10.8005V9.00049L75.5999 9.80049Z"
      fill="black"
    />
    <path
      d="M65.7999 1.8001H67.6L66.9 1.1001H65L65.7999 1.8001Z"
      fill="black"
    />
    <path d="M68 1.8001H69.7999L69.1 1.1001H67.2L68 1.8001Z" fill="black" />
  </svg>
);

export default GamepadsimulatorbtnBacktoSimulator;
