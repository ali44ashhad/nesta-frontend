import React from "react";

type GamepadsimulatorbtnFirmwareFlashProps =
  React.SVGProps<SVGSVGElement> & {
    fillColor?: string;
    text?: string;
  };

const GamepadsimulatorbtnFirmwareFlash: React.FC<
  GamepadsimulatorbtnFirmwareFlashProps
> = ({
  fillColor = "#DADADA",
  text = "FLASH|FIRMWARE",
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

    {/* Text (supports single or split with "|") */}
    {text &&
      (() => {
        const lines = text.includes("|")
          ? text.split("|")
          : [text];

        const centerX = 38.5;
        const centerY = 15;

        return (
          <>
            {lines.map((line, index) => {
              const yOffset =
                lines.length === 2
                  ? index === 0
                    ? -4
                    : 4
                  : 0;

              return (
                <text
                  key={index}
                  x={centerX}
                  y={centerY + yOffset}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                  fontFamily="Poppins, Inter, sans-serif"
                  fontWeight="600"
                  fontSize="9"
                  letterSpacing="0.4"
                  style={{ userSelect: "none" }}
                >
                  {line.trim()}
                </text>
              );
            })}
          </>
        );
      })()}
  </svg>
);

export default GamepadsimulatorbtnFirmwareFlash;
