import React from "react";

type MyProjectsBtnIconProps = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const MyProjectsBtnIcon: React.FC<MyProjectsBtnIconProps> = ({
  fillColor = "#C6FF00",
  text = "MY PROJECTS",
  ...props
}) => (
  <svg
    width="100"
    height="35"
    viewBox="0 0 100 35"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect
      width="100"
      height="35"
      rx="4"
      fill={fillColor}
      stroke="black"
    />

    {/* Text */}
    {text && (
      <text
        x="50"
        y="18"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fillColor === "limeGreen" ? "#fff" : "#000"}
        fontFamily="Poppins, Inter, sans-serif"
        fontWeight="600"
        fontSize="12"
        letterSpacing="0.6"
        style={{ userSelect: "none" }}
      >
        {text}
      </text>
    )}
  </svg>
);

export default MyProjectsBtnIcon;
