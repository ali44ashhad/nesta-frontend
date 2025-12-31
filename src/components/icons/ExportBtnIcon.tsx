import React from "react";

type ExportBtnIconProps = React.SVGProps<SVGSVGElement> & {
  label?: string;
};

const ExportBtnIcon: React.FC<ExportBtnIconProps> = ({
  label = "EXPORT",
  ...props
}) => (
  <svg
    width="123"
    height="41"
    viewBox="0 0 123 41"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect width="123" height="41" rx="6" fill="#FBC413" />

    {/* Border */}
    <rect
      x="0.5"
      y="0.5"
      width="122"
      height="40"
      rx="5.5"
      fill="none"
      stroke="black"
    />

    {/* TEXT */}
    <text
      x="61.5"
      y="26"
      textAnchor="middle"
      fill="black"
      fontFamily="Poppins, Inter, sans-serif"
      fontWeight="600"
      fontSize="14"
      letterSpacing="0.6"
    >
      {label}
    </text>
  </svg>
);

export default ExportBtnIcon;
