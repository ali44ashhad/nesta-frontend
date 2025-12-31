// import React from "react";

// const ProjectPlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ preserveAspectRatio, ...props }) => (
//   <svg width="207" height="64" viewBox="0 0 207 64" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio={preserveAspectRatio || "xMidYMid meet"} {...props}>
//     <path d="M200.4 7.59999H103.3C100.4 4.59999 98.7 3 95.7 0H6C3.6 2.4 2.3 3.7 0 6V57.4L5.9 63.3H191C197 57.3 200.3 54 206.3 48V13.5C204 11.2 202.7 9.89999 200.4 7.59999ZM94 2L97.5 5.5H95.4L91.9 2H94ZM87.8 2L91.3 5.5H89.2L85.7 2H87.8ZM81.6 2L85.1 5.5H83.1L79.6 2H81.6ZM203.5 46.3C198 51.8 194.9 54.9 189.3 60.5H8.4C6.2 58.4 5 57.2 2.9 55V16C5 13.8 6.2 12.6 8.4 10.5H198C200.2 12.6 201.3 13.8 203.5 16V46.3Z" fill="#2FC1E8"/>
//     <path d="M203.5 15.9V46.3C198 51.8 194.9 54.9 189.3 60.5H8.40002C6.20002 58.4 5.00002 57.2 2.90002 55V16C5.00002 13.8 6.20002 12.6 8.40002 10.5H198C200.1 12.6 201.3 13.8 203.5 15.9Z" fill="#BFE8EA"/>
//     <path d="M206.3 54.2V63.3H197.2C200.8 59.7 202.8 57.8 206.3 54.2Z" fill="#2FC1E8"/>
//   </svg>
// );

// export default ProjectPlaceholderIcon;

import React from "react";

const ProjectPlaceholderIcon: React.FC<
  React.SVGProps<SVGSVGElement>
> = ({ preserveAspectRatio, ...props }) => (
  <svg
    width="207"
    height="64"
    viewBox="0 0 207 64"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio={preserveAspectRatio || "xMidYMid meet"}
    {...props}
  >
    {/* Background */}
    <rect
      x="0"
      y="0"
      width="207"
      height="64"
      rx="6"
      fill="#BFE8EA"
    />

    {/* Thin Border */}
    <rect
      x="0.5"
      y="0.5"
      width="206"
      height="63"
      rx="5.5"
      fill="none"
      stroke="#2FC1E8"
      strokeWidth="1"
    />
  </svg>
);

export default ProjectPlaceholderIcon;
