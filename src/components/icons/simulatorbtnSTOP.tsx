// import React from "react";

// type GamepadsimulatorbtnstopProps = React.SVGProps<SVGSVGElement> & {
//   fillColor?: string;
//   text?: string;
// };

// const Gamepadsimulatorbtnstop: React.FC<GamepadsimulatorbtnstopProps> = ({
//   fillColor = "#2FC1E8",
//   text,
//   ...props
// }) => (
//   <svg
//     width="73"
//     height="29"
//     viewBox="0 0 73 29"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path
//       d="M6.09998 27.6L0.399902 21.9V0.5H66.3999L72.1 6.19995V21.9L66.3999 27.6H6.09998Z"
//       fill={fillColor}
//     />
//     <path
//       d="M66.2 1L71.6 6.39996V21.7L66.2 27.1H6.3999L1 21.7V1H66.2ZM66.6 0H0V22.1C2.3 24.4 3.7 25.8 6 28.1H66.6C68.9 25.8 70.3 24.4 72.6 22.1V6C70.2 3.7 68.9 2.4 66.6 0Z"
//       fill="#545454"
//     />
//     <path d="M32.6 1H34.3999L33.6 1.69995H31.8999L32.6 1Z" fill="#545454" />
//     <path d="M34.7 1H36.3999L35.7 1.69995H34L34.7 1Z" fill="#545454" />
//     <path d="M36.8 1H38.5001L37.8 1.69995H36.1001L36.8 1Z" fill="#545454" />
//     <path d="M38.9 1H40.6001L39.9 1.69995H38.1001L38.9 1Z" fill="#545454" />
//     <path
//       d="M32.6 26.3999H34.3999L33.6 27.0999H31.8999L32.6 26.3999Z"
//       fill="#545454"
//     />
//     <path
//       d="M34.7 26.3999H36.3999L35.7 27.0999H34L34.7 26.3999Z"
//       fill="#545454"
//     />
//     <path
//       d="M36.8 26.3999H38.5001L37.8 27.0999H36.1001L36.8 26.3999Z"
//       fill="#545454"
//     />
//     <path
//       d="M38.9 26.3999H40.6001L39.9 27.0999H38.1001L38.9 26.3999Z"
//       fill="#545454"
//     />
//     <path
//       d="M71.5999 7.09991V8.8999L70.7998 8.19989V6.3999L71.5999 7.09991Z"
//       fill="#545454"
//     />
//     <path
//       d="M71.5999 9.19995V11L70.7998 10.3V8.5L71.5999 9.19995Z"
//       fill="#545454"
//     />
//     <path
//       d="M62.3 1.69995H64.1001L63.3 1H61.6001L62.3 1.69995Z"
//       fill="#545454"
//     />
//     <path
//       d="M64.4001 1.69995H66.2002L65.4001 1H63.7002L64.4001 1.69995Z"
//       fill="#545454"
//     />
//     <path
//       d="M0.899902 21.0002V19.2002L1.69995 19.9002V21.7002L0.899902 21.0002Z"
//       fill="#545454"
//     />
//     <path
//       d="M0.899902 18.9001V17.1001L1.69995 17.8001V19.6001L0.899902 18.9001Z"
//       fill="#545454"
//     />
//     <path
//       d="M10.2 26.3999H8.3999L9.19995 27.0999H10.8999L10.2 26.3999Z"
//       fill="#545454"
//     />
//     <path
//       d="M8.09985 26.3999H6.2998L7.09985 27.0999H8.7998L8.09985 26.3999Z"
//       fill="#545454"
//     />
//      {text && (() => {
//       // Adjusts fontSize and positioning responsively based on SVG width
//       // Default SVG viewBox is "0 0 77 30"
//       // Calculate a scale factor based on actual width passed to the SVG
//       const baseWidth = 77;
//       const baseFontSize = 7;
//       // Get width prop from ...props or default
//       let width = 77;
//       if (props.width) {
//         if (typeof props.width === "number") width = props.width;
//         else if (typeof props.width === "string") {
//           // handle "100%" or "30px"
//           if (props.width.endsWith("%")) {
//             // fallback for percent: use base
//             width = baseWidth;
//           } else if (props.width.endsWith("px")) {
//             width = parseInt(props.width, 10);
//           }
//         }
//       }
//       const scale = width / baseWidth;
//       const fontSize = baseFontSize * scale;
//       const textX = 35 * scale;
//       const textY = 15 * scale;
//       return (
//         <text
//           x={textX}
//           y={textY}
//           textAnchor="middle"
//           fontSize={fontSize}
//           fontWeight="900"
//           fill="#000000"
//           fontFamily="Cyberank, Arial, sans-serif"
//           style={{
//             dominantBaseline: "middle",
//             userSelect: "none",
//           }}
//         >
//           {text}
//         </text>
//       );
//     })()}
//   </svg>
// );

// export default Gamepadsimulatorbtnstop;

import React from "react";

type GamepadsimulatorbtnstopProps = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const Gamepadsimulatorbtnstop: React.FC<GamepadsimulatorbtnstopProps> = ({
  fillColor = "#2FC1E8",
  text = "STOP",
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
      stroke="black"
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

export default Gamepadsimulatorbtnstop;
