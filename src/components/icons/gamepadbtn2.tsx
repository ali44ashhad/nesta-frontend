// import React from "react";

// type Gamepadbt2Props = React.SVGProps<SVGSVGElement> & {
//   fillColor?: string;
//   text?: string;
// };

// const Gamepadbt2: React.FC<Gamepadbt2Props> = ({
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
//       d="M46.0001 23C38.4001 23 29.5002 23 21.7002 23C15.8002 23 10.5001 23 7.1001 23C4.4001 23 3.00015 23 2.90015 23C1.40015 23 0.100098 21.8 0.100098 20.2V2.79999C0.100098 1.29999 1.30015 0 2.90015 0H56.0001L59.8002 3.79999L63.5001 7.5V22.7C63.5001 23 63.5001 23 46.0001 23Z"
//       fill="#DDDDDD"
//     />
//     <path
//       d="M56 0.200012C58.9 3.10001 60.6 4.80001 63.5 7.70001V22.9C63.5 23 55.9 23 46 23C32.5 23 15 23 7.09998 23C4.49998 23 3 23 3 23C1.5 23 0.300049 21.8 0.300049 20.3V2.90002C0.300049 1.40002 1.5 0.200012 3 0.200012H56ZM56.1 0H56H2.90002C1.30002 0 0 1.30002 0 2.90002V20.2C0 21.8 1.30002 23.1 2.90002 23.1H3C3.3 23.1 4.7 23.1 7 23.1C10.4 23.1 15.7 23.1 21.6 23.1C29.4 23.1 38.3 23.1 45.9 23.1C63.5 23.1 63.5 23.1 63.6 23L63.7001 22.9V22.8V7.60004V7.5L63.6 7.40002L58.7001 2.5L56.1 0Z"
//       fill="#3D3D3D"
//     />
//     <path
//       d="M56.7 21.5C54.3 21.5 51.4999 21.5 49.0999 21.5C47.1999 21.5 45.5999 21.5 44.4999 21.5C43.6999 21.5 43.3 21.5 43.2 21.5C43.2 21.2 43.2 20.2 43.2 19.5C43.2 18.9 43.2 18.7 43.2 18.6L45.2 16.6V6.60004L43.2 4.60004C43.2 4.50004 43.2 4.30001 43.2 3.70001C43.2 3.00001 43.2 1.80001 43.2 1.70001H55.4999L62.0999 8.40002V21.6C62.0999 21.6 61.9999 21.6 61.8999 21.6C61.2999 21.5 59.6 21.5 56.7 21.5Z"
//       fill={fillColor}
//     />
//     <path
//       d="M55.3999 1.70001C57.9999 4.30001 59.3999 5.69999 61.9999 8.29999V21.3C61.6999 21.3 60.4 21.4 56.7 21.4C54.3 21.4 51.4999 21.4 49.0999 21.4C47.1999 21.4 45.4999 21.4 44.3999 21.4C43.6999 21.4 43.4 21.4 43.2 21.4C43.2 21.1 43.2 20.1 43.2 19.5C43.2 19 43.2 18.7 43.2 18.6L44.3999 17.4L45.0999 16.7V16.6V6.60004V6.5L43.2 4.60004C43.2 4.50004 43.2 4.20001 43.2 3.70001C43.2 3.10001 43.2 2.09999 43.2 1.79999H55.3999M43.0999 1.60004C42.9999 1.60004 43.0999 4.60004 43.0999 4.60004C43.4999 5.00004 45.0999 6.60004 45.0999 6.60004V16.6C44.2999 17.4 43.8999 17.8 43.0999 18.6V21.6C43.0999 21.6 43.5999 21.6 44.4999 21.6C46.9999 21.6 52.4999 21.6 56.7999 21.6C59.8999 21.6 62.2999 21.6 62.2999 21.5V8.29999C59.6999 5.69999 58.1999 4.20004 55.5999 1.60004H43.0999Z"
//       fill="#3D3D3D"
//     />

//     {text &&
//       (() => {
//         if (text.includes("|")) {
//           const [firstLine, secondLine] = text.split("|", 2);
//           return (
//             <>
//               <text
//                 x="22"
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
//                 x="22"
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

// export default Gamepadbt2;


import React from "react";

type Gamepadbt2Props = React.SVGProps<SVGSVGElement> & {
  fillColor?: string;
  text?: string;
};

const Gamepadbt2: React.FC<Gamepadbt2Props> = ({
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
      rx="4"               // set 0 for sharp edges
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

export default Gamepadbt2;
