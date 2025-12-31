// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace";
// import RightPanel from "../components/RightPanel";
// import { RootState } from "../store";
// import {
//   toggleSidebar,
//   toggleRightPanel,
//   setRightPanelOpen,
//   openSidebar,
//   closeSidebar,
//   openRightPanel,
//   closeRightPanel,
// } from "../store/uiState";

// const BlocklyLayout = () => {
//   const dispatch = useDispatch();
//   const isSidebarOpen = useSelector(
//     (state: RootState) => state.uiState.isSidebarOpen
//   );
//   const isRightPanelOpen = useSelector(
//     (state: RootState) => state.uiState.isRightPanelOpen
//   );

//   // Responsive sidebar and right panel auto-hide/show
//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth;
//       if (width < 1024) {
//         dispatch(closeSidebar());
//         dispatch(closeRightPanel());
//       } else {
//         dispatch(openSidebar());
//         dispatch(openRightPanel());
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     // Run on mount
//     handleResize();
//     return () => window.removeEventListener("resize", handleResize);
//   }, [dispatch]);

//   // Warn user before closing tab or browser
//   useEffect(() => {
//     const handleBeforeUnload = (e: BeforeUnloadEvent) => {
//       e.preventDefault();
//       e.returnValue = '';
//     };
//     window.addEventListener('beforeunload', handleBeforeUnload);
//     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//   }, []);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === "s") {
//         e.preventDefault();
//         // Dispatch save action here
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <Navbar />
//       <div className="flex flex-1 overflow-hidden">
//         {/* Sidebar (conditionally rendered) */}
//         {isSidebarOpen && (
//           <div className="w-[250px] min-w-[250px] max-w-[300px] border-r border-gray-200 bg-white shrink-0">
//             <Sidebar />
//           </div>
//         )}
//         {/* Main Content always fills remaining space */}
//         <main className="flex-grow overflow-hidden bg-gray-50">
//           {/* Show Sidebar Button */}{" "}
//           {!isSidebarOpen && (
//             <button
//               className="fixed bottom-6 left-1 z-[9999]
//  bg-white border border-gray-300 rounded-full shadow-lg p-2 hover:bg-gray-100 transition-colors"
//               title="Show Sidebar"
//               onClick={() => dispatch(toggleSidebar())}
//             >
//               {" "}
//               <svg
//                 className="w-6 h-6 text-gray-600"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 {" "}
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M9 5l7 7-7 7"
//                 />{" "}
//               </svg>{" "}
//             </button>
//           )}
//           <BlocklyWorkspace />
//         </main>
//         {/* Right Panel (conditionally rendered) */}
//         {isRightPanelOpen && (
//           <div className="flex-shrink-0 w-1/3 min-w-[250px] max-w-[500px] resize-x overflow-auto border-l border-gray-200 bg-white">
//             <RightPanel />
//           </div>
//         )}
//       </div>

//       {/* Show Right Panel Button */}
//       {!isRightPanelOpen && (
//         <button
//           className="fixed bottom-6 left-6 z-50 bg-white border border-gray-300 rounded-full shadow-lg p-2 hover:bg-gray-100 transition-colors"
//           title="Show Right Panel"
//           onClick={() => dispatch(toggleRightPanel())}
//         >
//           <svg
//             className="w-6 h-6 text-gray-600"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// };

// export default BlocklyLayout;
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace";
import RightPanel from "../components/RightPanel";
import { RootState, AppDispatch } from "../store";
import {
  toggleSidebar,
  toggleRightPanel,
  updatePanelsForScreenSize,
} from "../store/uiState";
import NewProjectPopup from "../components/NewProjectPopup";
import { colors } from "../config/colors";

const BlocklyLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isSidebarOpen = useSelector(
    (state: RootState) => state.uiState.isSidebarOpen
  );
  const isRightPanelOpen = useSelector(
    (state: RootState) => state.uiState.isRightPanelOpen
  );

  // Responsive sidebar and right panel auto-hide/show - handled via Redux thunk
  useEffect(() => {
    const handleResize = () => {
      dispatch(updatePanelsForScreenSize(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    // Run on mount
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // Warn user before closing tab or browser
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        // Dispatch save action here
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#CDECF8]">
      <Navbar />
      {/* // px-[15px] pb-[15px] pt-0 */}

      <div className="flex flex-1 overflow-hidden relative px-2 pb-2 pt-0 bg-[#CDECF8]">
        {/* Sidebar - Always in DOM for smooth transitions */}
        <div
          className={`relative h-full transition-all duration-300 ease-in-out shrink-0 ${
            isSidebarOpen
              ? "w-[250px] min-w-[250px] max-w-[300px]"
              : "w-0 min-w-0 max-w-0 overflow-hidden pointer-events-none"
          }`}
          style={{
            willChange: "width, min-width, max-width",
          }}
        >
          <div
            className={`relative w-[250px] min-w-[250px] max-w-[300px] h-full border-r border-gray-200  shrink-0 transition-opacity duration-300 ease-in-out flex flex-col ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ease-in-out"
              style={{ opacity: isSidebarOpen ? 1 : 0 }}
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="115 1 199 545"
            >
              <path
                d="M 286 -5 L 315 21 L 315 538"
                stroke="#CDECF8"
                strokeWidth="3"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Sidebar Toggle Button - When Sidebar is Open */}
            {isSidebarOpen && (
              <button
                className="group absolute bottom-5 sm:bottom-6 -right-5 z-[9999] bg-mediumDarkGray border border-limeGreen rounded-full shadow-xl p-1.5 sm:p-2 hover:bg-limeGreen transition-all duration-200 hover:scale-110"
                title="Hide Sidebar"
                onClick={() => dispatch(toggleSidebar())}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-limeGreen group-hover:text-darkGray transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div
              className={`flex-1 min-h-0 transition-opacity duration-300 ease-in-out ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              <Sidebar />
             <div className="px-4 mt-4">
                <a
                  href="https://lms-trvj.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Courses"
                  className="flex items-center justify-center px-4 py-2
                             rounded-md border border-black
                             bg-[#7CCE1A] text-black font-bold text-lg
                             transition-all duration-200
                             hover:bg-limeGreen hover:scale-[1.02]
                             active:scale-[0.98]"
                >
                  Courses
                </a>
              </div>

            </div>
          </div>
        </div>
        {/* Main Content always fills remaining space */}
        <main
          className="flex-1 min-w-0 overflow-hidden relative transition-all duration-300 ease-in-out"
          style={{
            backgroundColor: "#ffffff",
            willChange: "width",
            contain: "layout style",
            transform: "translateZ(0)", // Force GPU acceleration
          }}
        >
          {/* Sidebar Toggle Button - When Sidebar is Closed */}
          {!isSidebarOpen && (
            <button
              className="group fixed bottom-6 sm:bottom-1 left-3 sm:left-1 z-[9999] bg-mediumDarkGray border border-limeGreen rounded-full shadow-xl p-1.5 sm:p-2 hover:bg-limeGreen transition-all duration-200 hover:scale-110"
              title="Show Sidebar"
              onClick={() => dispatch(toggleSidebar())}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-limeGreen group-hover:text-darkGray transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <BlocklyWorkspace />
          {/* Right Panel Toggle Button - When Panel is Closed */}
          {!isRightPanelOpen && (
            <button
              className="group fixed bottom-4 sm:bottom-1 right-1 sm:right-1 z-[9999] bg-mediumDarkGray border border-limeGreen rounded-full shadow-xl p-1.5 sm:p-2 hover:bg-limeGreen transition-all duration-200 hover:scale-110"
              title="Show Right Panel"
              onClick={() => dispatch(toggleRightPanel())}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-limeGreen group-hover:text-darkGray transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </main>
        {/* Right Panel - Always in DOM for smooth transitions */}
        <div
          className={`flex-shrink-0 resize-none relative transition-all duration-300 ease-in-out ${
            isRightPanelOpen
              ? "w-[400px] min-w-[300px] max-w-[600px] border-l border-gray-200"
              : "w-0 min-w-0 max-w-0 border-0 pointer-events-none"
          }`}
          style={{
            backgroundColor: isRightPanelOpen
              ? colors.darkerGray
              : "transparent",
            transition:
              "width 300ms ease-in-out, min-width 300ms ease-in-out, max-width 300ms ease-in-out, border 300ms ease-in-out, background-color 300ms ease-in-out",
            willChange: "width, min-width, max-width",
          }}
        >
          <div
            className={`w-[400px] min-w-[300px] max-w-[600px] h-full overflow transition-opacity duration-300 ease-in-out ${
              isRightPanelOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            <RightPanel />
          </div>
          {/* Right Panel Toggle Button - When Panel is Open */}
          {isRightPanelOpen && (
            <button
              className="group absolute bottom-4 sm:bottom-6 left-0 -translate-x-1/2 z-[9999] bg-mediumDarkGray border border-limeGreen rounded-full shadow-xl p-1.5 sm:p-2 hover:bg-limeGreen transition-all duration-200 hover:scale-110"
              title="Hide Right Panel"
              onClick={() => dispatch(toggleRightPanel())}
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-limeGreen group-hover:text-darkGray transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <NewProjectPopup />
    </div>
  );
};

export default BlocklyLayout;
