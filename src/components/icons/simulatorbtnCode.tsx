import React from "react";

type GamepadsimulatorbtnCodeProps =
  React.SVGProps<SVGSVGElement> & {
    fillColor?: string;
    text?: string;
  };

const GamepadsimulatorbtnCode: React.FC<GamepadsimulatorbtnCodeProps> = ({
  fillColor = "#2FC1E8",
  text = "CODE",
  ...props
}) => (
  <svg
    width="77"
    height="30"
    viewBox="0 0 77 30"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect width="77" height="30" rx="4" fill={fillColor} />

    {/* Border */}
    <rect
      x="0.5"
      y="0.5"
      width="76"
      height="29"
      rx="3.5"
      fill="none"
      stroke="#000"
    />

    {/* Text */}
    {text && (
      <text
        x="38.5"
        y="15"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#000"
        fontFamily="Poppins, Inter, sans-serif"
        fontWeight="600"
        fontSize="9"
        letterSpacing="0.5"
        style={{ userSelect: "none" }}
      >
        {text}
      </text>
    )}
  </svg>
);

export default GamepadsimulatorbtnCode;
