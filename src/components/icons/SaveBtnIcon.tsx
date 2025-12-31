import React from "react";

type SaveBtnIconProps = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  label?: string;
};

const SaveBtnIcon: React.FC<SaveBtnIconProps> = ({
  fillColor = "#2FC1E8",
  label = "SAVE",
  ...props
}) => (
  <svg
    width="122"
    height="41"
    viewBox="0 0 122 41"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect width="122" height="41" rx="6" fill={fillColor} />

    {/* Border */}
    <rect
      x="0.5"
      y="0.5"
      width="121"
      height="40"
      rx="5.5"
      fill="none"
      stroke="black"
    />

    {/* TEXT */}
    <text
      x="61"
      y="26"
      textAnchor="middle"
      fill="black"
      fontFamily="Poppins, Inter, sans-serif"
      fontWeight="600"
      fontSize="14"
      letterSpacing="0.5"
    >
      {label}
    </text>
  </svg>
);

export default SaveBtnIcon;
