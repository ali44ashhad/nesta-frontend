// import React from 'react';
// import { useDispatch } from 'react-redux';
// import { setActiveModal } from '../store/uiState';

// const WelcomePrompt: React.FC = () => {
//   const dispatch = useDispatch();

//   const handleCreateNewProject = () => {
//     dispatch(setActiveModal('newProject'));
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-full bg-[#fffff] text-center p-8">
//       <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Saiba" }}>Welcome to Nesta Toys Creator!</h1>
//       <p className="text-lg text-gray-600 mb-8">
//         To get started, create a new project or select an existing one from the sidebar on the left.
//       </p>
//       <button
//         onClick={handleCreateNewProject}
//         className="px-6 py-3 bg-limeGreen text-nearBlack rounded-lg text-xl font-semibold hover:bg-oliveGreen transition-colors shadow-md"
//       style={{ fontFamily: "Saiba" }}
//       >
//         Create New Project
//       </button>
//     </div>
//   );
// };

// export default WelcomePrompt;



import React from "react";
import { useDispatch } from "react-redux";
import { setActiveModal } from "../store/uiState";

const WelcomePrompt: React.FC = () => {
  const dispatch = useDispatch();

  const handleCreateNewProject = () => {
    dispatch(setActiveModal("newProject"));
  };

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        h-full
        p-8
        text-center

        bg-white
        bg-[linear-gradient(to_right,rgba(47,193,232,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(47,193,232,0.18)_1px,transparent_1px)]
        bg-[size:40px_40px]
      "
    >
      {/* <h1
        className="text-4xl font-extrabold text-nearBlack mb-4"
        // style={{ fontFamily: "Saiba" }}
      >
        Welcome to Nesta Toys Creator!
      </h1> */}
<div className="relative mb-8 inline-block">
  <h1
    className="
      text-2xl font-semibold text-gray-700
      bg-white px-6 py-3 rounded-full
      border border-gray-200 shadow-md
      tracking-tight
      font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif]
    "
  >
    Welcome to Nesta Toys Creator!
  </h1>



  {/* bubble tail */}
  <div
    className="absolute left-1/2 -bottom-2
    w-4 h-4 bg-white
    border-l border-b border-gray-200
    rotate-45 -translate-x-1/2"
  />
</div>


      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        To get started, create a new project or select an existing one from the
        sidebar on the left.
      </p>

      <button
  onClick={handleCreateNewProject}
  className="
    px-6
    py-3
    bg-limeGreen
    text-white
    rounded-lg
    text-xl
    font-semibold 
    transition-colors
    shadow-md
  "
 
>
  Create New Project
</button>

    </div>
  );
};

export default WelcomePrompt;

