import React from "react";

type GamepadsimulatorbtnresetProps = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const Gamepadsimulatorbtnreset: React.FC<GamepadsimulatorbtnresetProps> = ({
  fillColor = "#DADADA",
  text = "RESET",
  ...props
}) => (
  <svg
    width="73"
    height="29"
    viewBox="0 0 73 29"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect width="73" height="29" rx="4" fill={fillColor} />

    {/* Border */}
    <rect
      x="0.5"
      y="0.5"
      width="72"
      height="28"
      rx="3.5"
      fill="none"
      stroke="#000"
    />

    {/* Text */}
    {text && (
      <text
        x="36.5"
        y="14.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#000"
        fontFamily="Poppins, Inter, sans-serif"
        fontWeight="600"
        fontSize="10"
        letterSpacing="0.6"
        style={{ userSelect: "none" }}
      >
        {text}
      </text>
    )}
  </svg>
);

export default Gamepadsimulatorbtnreset;
