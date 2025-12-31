// import React from "react";

// type Gamepadbt1Props = React.SVGProps<SVGSVGElement> & {
//   fillColor?: string;
//   text?: string;
// };

// const Gamepadbt1: React.FC<Gamepadbt1Props> = ({
//   fillColor = "#2FC1E8",
//   text,
//   ...props
// }) => (
//   <svg
//     width="64"
//     height="24"
//     viewBox="0 0 64 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <path
//       d="M17.9 23C0.400024 23 0.300049 23 0.300049 22.9V7.70001L7.80005 0.100037H61C62.5 0.100037 63.8 1.30002 63.8 2.90002V20.2C63.8 21.7 62.6 23 61 23C60.9 23 59.5 23 56.8 23C53.4 23 48.1001 23 42.2001 23C34.4001 23 25.5 23 17.9 23Z"
//       fill="#DDDDDD"
//     />
//     <path
//       d="M1.69995 21.5V8.29999C4.29995 5.69999 5.7999 4.20004 8.3999 1.60004H20.7999C20.8999 1.60004 20.7999 4.60004 20.7999 4.60004C20.3999 5.00004 18.7999 6.60004 18.7999 6.60004V16.6C19.5999 17.4 19.9999 17.8 20.7999 18.6V21.6C20.5999 21.5 1.69995 21.7 1.69995 21.5Z"
//       fill={fillColor}
//     />
//     <path
//       d="M60.9 0.200012C62.4 0.200012 63.6 1.40002 63.6 2.90002V20.2C63.6 21.7 62.4 22.9 60.9 22.9C60.9 22.9 59.3 22.9 56.8 22.9C48.9 22.9 31.3 22.9 17.9 22.9C8.00002 22.9 0.400024 22.9 0.400024 22.8V7.60004C3.30002 4.70004 5.00002 3.00004 7.90002 0.100037H60.9M60.9 0H7.80005H7.70007L7.59998 0.100037L4.90002 2.79999L0.0999756 7.60004L0 7.70001V7.79999V23V23.1L0.0999756 23.2C0.199976 23.3 0.200048 23.3 17.8 23.3C25.4 23.3 34.4 23.3 42.1 23.3C48 23.3 53.3001 23.3 56.7001 23.3C59.0001 23.3 60.4001 23.3 60.7001 23.3H60.8C62.4 23.3 63.7001 22 63.7001 20.4V3C63.8001 1.3 62.5 0 60.9 0Z"
//       fill="#3D3D3D"
//     />
//     {text &&
//       (() => {
//         if (text.includes("|")) {
//           const [firstLine, secondLine] = text.split("|", 2);
//           return (
//             <>
//               <text
//                 x="42"
//                 y="10"
//                 textAnchor="middle"
//                 fontSize="5"
//                 fontWeight="900"
//                 fill="#1D1D1D"
//                 fontFamily="Cyberank, Arial, sans-serif"
//               >
//                 {firstLine}
//               </text>
//               <text
//                 x="42"
//                 y="17"
//                 textAnchor="middle"
//                 fontSize="5"
//                 fontWeight="900"
//                 fill="#1D1D1D"
//                 fontFamily="Cyberank, Arial, sans-serif"
//               >
//                 {secondLine}
//               </text>
//             </>
//           );
//         }
//         return (
//           <text
//             x="42"
//             y="10"
//             textAnchor="middle"
//             fontSize="5"
//             fontWeight="900"
//             fill="#1D1D1D"
//             fontFamily="Cyberank, Arial, sans-serif"
//           >
//             {text}
//           </text>
//         );
//       })()}
//   </svg>
// );

// export default Gamepadbt1;


import React from "react";

type Gamepadbt1Props = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const Gamepadbt1: React.FC<Gamepadbt1Props> = ({
  fillColor = "#2FC1E8",
  text,
  ...props
}) => (
  <svg
    width="64"
    height="24"
    viewBox="0 0 64 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Background */}
    <rect
      x="0"
      y="0"
      width="64"
      height="24"
      rx="4"              // set 0 for sharp edges
      fill={fillColor}
    />

    {/* Thin Border */}
    <rect
      x="0.5"
      y="0.5"
      width="63"
      height="23"
      rx="3.5"
      fill="none"
      stroke="#3D3D3D"
      strokeWidth="1"
    />

    {/* Optional Text (supports "|" for two lines) */}
    {text &&
      (() => {
        if (text.includes("|")) {
          const [firstLine, secondLine] = text.split("|", 2);
          return (
            <>
              <text
                x="32"
                y="10"
                textAnchor="middle"
                fontSize="5"
                fontWeight="900"
                fill="#1D1D1D"
                fontFamily="Cyberank, Arial, sans-serif"
                style={{ userSelect: "none" }}
              >
                {firstLine}
              </text>
              <text
                x="32"
                y="17"
                textAnchor="middle"
                fontSize="5"
                fontWeight="900"
                fill="#1D1D1D"
                fontFamily="Cyberank, Arial, sans-serif"
                style={{ userSelect: "none" }}
              >
                {secondLine}
              </text>
            </>
          );
        }

        return (
          <text
            x="32"
            y="14"
            textAnchor="middle"
            fontSize="5"
            fontWeight="900"
            fill="#1D1D1D"
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
  </svg>
);

export default Gamepadbt1;
