import React from "react";

const LeftPanelBgIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ preserveAspectRatio, ...props }) => (
  <svg width="211" height="669" viewBox="0 0 211 669" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio={preserveAspectRatio || "xMidYMid meet"} {...props}>
    <path d="M186.4 669H99C60.3 630.3 38.6 608.6 0 570V23.7C9.2 14.5 14.4 9.3 23.7 0H186.5C195.7 9.2 200.9 14.4 210.2 23.7V645.3C200.9 654.6 195.7 659.8 186.4 669Z" fill="#1D1D1D"/>
  </svg>
);

export default LeftPanelBgIcon;

