// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../store";
// import { setModified, updateCurrentProjectBlocks } from "../../store/projectSlice";
// import * as Blockly from "blockly";
// import { createSensorBlocks } from "./blocks/sensors";
// import { createLogicBlocks } from "./blocks/logic";
// import { createControlBlocks } from "./blocks/control";
// import { createMathBlocks } from "./blocks/math"; // Import math blocks
// import { javascriptGenerator } from "blockly/javascript";
// import { generateMicroPythonCode } from "../../utils/micropythonCodeGenerator";
// import { generateArduinoCode } from "../../utils/codeGenerator";
// import { setGeneratedCode } from "../../store/codeSlice";
// import { createMotionBlocks } from "./blocks/motion";
// import "./blocks/blockly.css";
// import WelcomePrompt from "../WelcomePrompt";
// import CategoryPanel from "../CategoryPanel";
// // import logo from "../../assets/NestaLogo.png"

// const createCustomBlocks = () => {
//   createMotionBlocks();
//   createSensorBlocks();
//   createLogicBlocks();
//   createControlBlocks();
//   createMathBlocks(); // Create the math blocks
// };

// const fullToolbox = {
//   kind: 'categoryToolbox',
//   contents: [
//     {
//       kind: 'category',
//       name: 'Control',
//       colour: '#e32626',
//       contents: [
//         { kind: 'block', type: 'my_program' },
//         { kind: 'block', type: 'wait_ms' },
//         { kind: 'block', type: 'custom_if' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Motion',
//       colour: '#ff7517',
//       contents: [
//         { kind: 'block', type: 'move_forward' },
//         { kind: 'block', type: 'move_backward' },
//         { kind: 'block', type: 'turn_left' },
//         { kind: 'block', type: 'turn_right' },
//         { kind: 'block', type: 'stop_movement' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Sensors',
//       colour: '#ff9d00',
//       contents: [
//         { kind: 'block', type: 'read_ultrasonic' },
//         { kind: 'block', type: 'is_obstacle' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Logic',
//       colour: '#ffd629',
//       contents: [
//         { kind: 'block', type: 'controls_if' },
//         { kind: 'block', type: 'logic_compare' },
//         { kind: 'block', type: 'logic_operation' },
//         { kind: 'block', type: 'logic_negate' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Math',
//       colour: '#9dbf51',
//       contents: [
//         { kind: 'block', type: 'math_number' },
//         { kind: 'block', type: 'math_boolean' },
//         { kind: 'block', type: 'math_arithmetic' },
//         { kind: 'block', type: 'math_modulo' },
//         { kind: 'block', type: 'math_property' },
//         { kind: 'block', type: 'map_value' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Loops',
//       colour: '#00c3dd',
//       contents: [
//         { kind: 'block', type: 'controls_repeat_ext' },
//         { kind: 'block', type: 'controls_whileUntil' },
//         { kind: 'block', type: 'controls_for' },
//       ],
//     },
//     { kind: 'category', name: 'Variables', custom: 'VARIABLE', colour: '#3939ff' },
//     { kind: 'category', name: 'Functions', custom: 'PROCEDURE', colour: '#9335ed' },
//   ],
// };

// const emptyToolbox = {
//   kind: 'categoryToolbox',
//   contents: [],
// };


// const BlocklyWorkspace = () => {
//   const dispatch = useDispatch();
//   const blocklyDiv = useRef<HTMLDivElement>(null);
//   const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

//   const { currentProject } = useSelector(
//     (state: RootState) => state.project
//   );
//   // 🧩 Resize on window change and container size changes
//   useEffect(() => {
//     if (!blocklyDiv.current || !workspaceRef.current) return;

//     const resize = () => {
//       if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
//     };

//     // Handle window resize
//     window.addEventListener("resize", resize);

//     // Use ResizeObserver to detect container size changes (e.g., when panels open/close)
//     const resizeObserver = new ResizeObserver(() => {
//       resize();
//     });

//     resizeObserver.observe(blocklyDiv.current);

//     return () => {
//       window.removeEventListener("resize", resize);
//       resizeObserver.disconnect();
//     };
//   }, []);

//   // 🧩 Initialize Blockly
//   useEffect(() => {
//     if (!blocklyDiv.current) return;

//     createCustomBlocks();

//     // const toolbox = {
//     //   kind: "categoryToolbox",
//     //   contents: [
//     //     {
//     //       kind: "category",
//     //       name: "Control",
//     //       colour: "#fde057",
//     //       contents: [
//     //         { kind: "block", type: "my_program" },
//     //         { kind: "block", type: "wait_ms" },
//     //         { kind: "block", type: "custom_if" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Motion",
//     //       colour: "#4C97FF",
//     //       contents: [
//     //         { kind: "block", type: "move_forward" },
//     //         { kind: "block", type: "move_backward" },
//     //         { kind: "block", type: "turn_left" },
//     //         { kind: "block", type: "turn_right" },
//     //         { kind: "block", type: "stop_movement" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Sensors",
//     //       colour: "#5BA55B",
//     //       contents: [
//     //         { kind: "block", type: "read_ultrasonic" },
//     //         { kind: "block", type: "is_obstacle" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Logic",
//     //       colour: "#FFAB19",
//     //       contents: [
//     //         { kind: "block", type: "controls_if" },
//     //         { kind: "block", type: "logic_compare" },
//     //         { kind: "block", type: "logic_operation" },
//     //         { kind: "block", type: "logic_negate" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Math",
//     //       colour: "#59C059",
//     //       contents: [
//     //         // New Math Category
//     //         { kind: "block", type: "math_number" },
//     //         { kind: "block", type: "math_boolean" },
//     //         { kind: "block", type: "math_arithmetic" },
//     //         { kind: "block", type: "math_modulo" },
//     //         { kind: "block", type: "math_property" },
//     //         { kind: "block", type: "map_value" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Loops",
//     //       colour: "#9966FF",
//     //       contents: [
//     //         { kind: "block", type: "controls_repeat_ext" },
//     //         { kind: "block", type: "controls_whileUntil" },
//     //         { kind: "block", type: "controls_for" },
//     //       ],
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Variables",
//     //       custom: "VARIABLE",
//     //       colour: "#FF8C1A",
//     //     },
//     //     {
//     //       kind: "category",
//     //       name: "Functions",
//     //       custom: "PROCEDURE",
//     //       colour: "#FF6680",
//     //     },
//     //   ],
//     // };

//     workspaceRef.current = Blockly.inject(blocklyDiv.current, {
//       toolbox: emptyToolbox,
//       // media: logo, //add image here for zoom control and trash
//       grid: {
//         spacing: 20,
//         length: 1,
//         colour: "#1f1f1f",
//         snap: true,
//       },
//       zoom: {
//         controls: true,
//         wheel: true,
//         startScale: 1.0,
//         maxScale: 3,
//         minScale: 0.3,
//         scaleSpeed: 1.2,
//       },
//       move: { scrollbars: true, drag: true, wheel: true },
//       theme: Blockly.Themes.Classic,
//       trashcan: true,
//     });

//     // Resize after DOM is painted
//     setTimeout(() => {
//       if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
//     }, 300);

//     // Listen to block changes
//     workspaceRef.current.addChangeListener((e) => {
//       if ((e as Blockly.Events.Abstract).isUiEvent) return;
      
//       // When a block is moved from flyout to workspace, restore its block definition color
//       if (e.type === Blockly.Events.BLOCK_MOVE) {
//         const moveEvent = e as Blockly.Events.BlockMove;
        
//         // Check if block moved to workspace (newParentId is null means it's in workspace root)
//         if ((moveEvent.newParentId === null || moveEvent.newParentId === undefined) && moveEvent.blockId) {
//           const blockId = moveEvent.blockId;
//           setTimeout(() => {
//             const block = workspaceRef.current?.getBlockById(blockId);
//             if (block) {
//               const blockSvg = block as Blockly.BlockSvg;
//               // Check if block is in workspace (not in flyout)
//               if (blockSvg.workspace === workspaceRef.current) {
//                 // Get the block's type and restore its color from block definition
//                 const blockType = block.type;
                
//                 // Map built-in block types to their category colors
//                 const builtInBlockColors: Record<string, string> = {
//                   // Loops category (#00c3dd)
//                   'controls_repeat_ext': '#00c3dd',
//                   'controls_whileUntil': '#00c3dd',
//                   'controls_for': '#00c3dd',
//                   // Logic category (#ffd629)
//                   'controls_if': '#ffd629',
//                   'logic_compare': '#ffd629',
//                   'logic_operation': '#ffd629',
//                   'logic_negate': '#ffd629',
//                 };
                
//                 // Check if it's a built-in block with a known color mapping
//                 if (builtInBlockColors[blockType]) {
//                   block.setColour(builtInBlockColors[blockType]);
//                 } else if (blockType.startsWith('variables_get') || blockType.startsWith('variables_set') || blockType === 'variables_get') {
//                   // Variables category blocks
//                   block.setColour('#3939ff');
//                 } else if (blockType.startsWith('procedures_') || blockType === 'procedures_defreturn' || blockType === 'procedures_defnoreturn') {
//                   // Functions/Procedures category blocks
//                   block.setColour('#9335ed');
//                 } else {
//                   // For custom blocks, try to restore from block definition
//                   const blockDef = Blockly.Blocks[blockType];
                  
//                   if (blockDef && blockDef.init) {
//                     // Create a temporary workspace SVG to get its defined color
//                     const tempDiv = document.createElement('div');
//                     tempDiv.style.display = 'none';
//                     document.body.appendChild(tempDiv);
//                     const tempWorkspace = Blockly.inject(tempDiv, {
//                       readOnly: true,
//                       trashcan: false,
//                       zoom: { controls: false, wheel: false, startScale: 1 },
//                       move: { scrollbars: false, drag: false, wheel: false },
//                     });
//                     const tempBlock = tempWorkspace.newBlock(blockType);
//                     blockDef.init.call(tempBlock);
//                     const definedColor = tempBlock.getColour();
//                     tempWorkspace.dispose();
//                     document.body.removeChild(tempDiv);
                    
//                     // Restore the block's defined color (overrides toolbox category color)
//                     if (definedColor) {
//                       block.setColour(definedColor);
//                     }
//                   }
//                 }
//               }
//             }
//           }, 10);
//         }
//       }
        
//       const jsCode = javascriptGenerator.workspaceToCode(workspaceRef.current!);
//       const micropythonCode = generateMicroPythonCode(jsCode);
//       const arduinoCode = generateArduinoCode(jsCode);

//       dispatch(setGeneratedCode({ micropythonCode, arduinoCode }));

//       const blocksData = Blockly.serialization.workspaces.save(
//         workspaceRef.current as Blockly.Workspace
//       );
//       dispatch(updateCurrentProjectBlocks(blocksData.blocks?.blocks || []));
//       dispatch(setModified(true));
//     });

//     return () => workspaceRef.current?.dispose();
//   }, [dispatch]);

//   useEffect(() => {
//     const ws = workspaceRef.current;
//     if (!ws) return;
  
//     // If a project is loaded and has blocks, load them. Otherwise, clear the workspace.
//     if (currentProject && currentProject.blocks && currentProject.blocks.length > 0) {
//       Blockly.serialization.workspaces.load({ blocks: { blocks: currentProject.blocks } }, ws);
//     } else {
//       ws.clear();
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentProject?.id]);

//   useEffect(() => {
//     const ws = workspaceRef.current;
//     if (!ws) return;  
//     if (currentProject) {
//       ws.updateToolbox(fullToolbox);
//     } else {
//       ws.updateToolbox(emptyToolbox);
//     }
//   }, [currentProject]);






//   return (
//     <div className="h-full w-full flex flex-col">
//       <div className="relative flex-grow w-full flex" style={{ isolation: 'isolate' }}>
//         {currentProject && (
//           <CategoryPanel workspace={workspaceRef.current} />
//         )}
//         <div className="flex-1 relative">
//           <div ref={blocklyDiv} className="absolute inset-0 z-0" />
//           {!currentProject && (
//             <div className="absolute inset-0 z-10">
//               <WelcomePrompt />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlocklyWorkspace;

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setModified, updateCurrentProjectBlocks } from "../../store/projectSlice";
import * as Blockly from "blockly";
import { createSensorBlocks } from "./blocks/sensors";
import { createLogicBlocks } from "./blocks/logic";
import { createControlBlocks } from "./blocks/control";
import { createMathBlocks } from "./blocks/math";
import { javascriptGenerator } from "blockly/javascript";
import { pythonGenerator } from "blockly/python"; // Import Python generator
import { generateMicroPythonCode } from "../../utils/micropythonCodeGenerator";
import { generateArduinoCode } from "../../utils/codeGenerator";
import { setGeneratedCode } from "../../store/codeSlice";
import { createMotionBlocks } from "./blocks/motion";
import "./blocks/blockly.css";
import WelcomePrompt from "../WelcomePrompt";
import CategoryPanel from "../CategoryPanel";

const createCustomBlocks = () => {
  createMotionBlocks();
  createSensorBlocks();
  createLogicBlocks();
  createControlBlocks();
  createMathBlocks();
};

// const fullToolbox = {
//   kind: 'categoryToolbox',
//   contents: [
//     {
//       kind: 'category',
//       name: 'Control',
//       colour: '#e32626',
//       contents: [
//         { kind: 'block', type: 'my_program' },
//         // { kind: 'block', type: 'wait_ms' },
//         { kind: 'block', type: 'custom_if' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Motion',
//       colour: '#ff7517',
//       contents: [
//         { kind: 'block', type: 'move_forward' },
//         { kind: 'block', type: 'move_backward' },
//         { kind: 'block', type: 'turn_left' },
//         { kind: 'block', type: 'turn_right' },
//         { kind: 'block', type: 'stop_movement' },
//       ],
//     },
//     // {
//     //   kind: 'category',
//     //   name: 'Sensors',
//     //   colour: '#ff9d00',
//     //   contents: [
//     //     { kind: 'block', type: 'read_ultrasonic' },
//     //     { kind: 'block', type: 'is_obstacle' },
//     //   ],
//     // },
//     {
//       kind: 'category',
//       name: 'Sensors',
//       colour: '#ff9d00',
//       contents: [
//         { kind: 'block', type: 'read_ultrasonic' }, // Existing simple one
//         { kind: 'block', type: 'is_obstacle' },
//         { kind: 'block', type: 'read_touch' },
//         { kind: 'block', type: 'read_ir' },
//         { kind: 'block', type: 'read_sound' },
//         { kind: 'block', type: 'read_humidity' },
//         { kind: 'block', type: 'read_temperature' },
//         { kind: 'block', type: 'read_color_sensor' },
//         { kind: 'block', type: 'read_ultrasonic_port' }, // New one with port
//         { kind: 'block', type: 'sensor_color_picker' },
//         { kind: 'block', type: 'read_ldr' },
//         { kind: 'block', type: 'read_pir' },
//         { kind: 'block', type: 'read_digital_generic' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Logic',
//       colour: '#ffd629',
//       contents: [
//         { kind: 'block', type: 'controls_if' },
//         { kind: 'block', type: 'logic_compare' },
//         { kind: 'block', type: 'logic_operation' },
//         { kind: 'block', type: 'logic_negate' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Math',
//       colour: '#9dbf51',
//       contents: [
//         { kind: 'block', type: 'math_number' },
//         { kind: 'block', type: 'math_boolean' },
//         { kind: 'block', type: 'math_arithmetic' },
//         { kind: 'block', type: 'math_modulo' },
//         { kind: 'block', type: 'math_property' },
//         { kind: 'block', type: 'map_value' },
//       ],
//     },
//     {
//       kind: 'category',
//       name: 'Loops',
//       colour: '#00c3dd',
//       contents: [
//         { kind: 'block', type: 'controls_repeat_ext' },
//         { kind: 'block', type: 'controls_whileUntil' },
//         { kind: 'block', type: 'controls_for' },
//       ],
//     },
//     { kind: 'category', name: 'Variables', custom: 'VARIABLE', colour: '#3939ff' },
//     { kind: 'category', name: 'Functions', custom: 'PROCEDURE', colour: '#9335ed' },
//   ],
// };

const fullToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Control',
      colour: '#e32626',
      contents: [
        { kind: 'block', type: 'my_program' },
        { kind: 'block', type: 'custom_if' },
      ],
    },
    {
      kind: 'category',
      name: 'Motion',
      colour: '#ff7517',
      contents: [
        { kind: 'block', type: 'move_forward' },
        { kind: 'block', type: 'move_backward' },
        { kind: 'block', type: 'turn_left' },
        { kind: 'block', type: 'turn_right' },
        { kind: 'block', type: 'stop_movement' },
      ],
    },
    {
      kind: 'category',
      name: 'Sensors',
      colour: '#ff9d00',
      contents: [
        { kind: 'block', type: 'read_ultrasonic_port' },
        { kind: 'block', type: 'is_obstacle' },
        { kind: 'block', type: 'read_ir' },
        { kind: 'block', type: 'read_temperature' },
        { kind: 'block', type: 'read_ldr' },
      ],
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '#ffd629',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '#9dbf51',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_boolean' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_property' },
        { kind: 'block', type: 'map_value' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '#00c3dd',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
      ],
    },
    { kind: 'category', name: 'Variables', custom: 'VARIABLE', colour: '#3939ff' },
    { kind: 'category', name: 'Functions', custom: 'PROCEDURE', colour: '#9335ed' },
  ],
};

const emptyToolbox = {
  kind: 'categoryToolbox',
  contents: [],
};

const BlocklyWorkspace = () => {
  const dispatch = useDispatch();
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const { currentProject } = useSelector(
    (state: RootState) => state.project
  );
  
  // Subscribe to panel state changes from Redux
  const { isSidebarOpen, isRightPanelOpen } = useSelector(
    (state: RootState) => state.uiState
  );

  // Resize function - centralized for reuse
  const resizeWorkspace = () => {
    if (workspaceRef.current) {
      Blockly.svgResize(workspaceRef.current);
    }
  };

  // Handle window resize and container size changes via ResizeObserver
  useEffect(() => {
    if (!blocklyDiv.current || !workspaceRef.current) return;

    window.addEventListener("resize", resizeWorkspace);
    const resizeObserver = new ResizeObserver(() => {
      resizeWorkspace();
    });
    resizeObserver.observe(blocklyDiv.current);

    return () => {
      window.removeEventListener("resize", resizeWorkspace);
      resizeObserver.disconnect();
    };
  }, []);

  // Explicitly resize workspace when panel states change (via Redux)
  // This ensures workspace resizes even if ResizeObserver doesn't catch the transition
  useEffect(() => {
    if (!workspaceRef.current) return;
    
    // Resize immediately when panel state changes
    resizeWorkspace();
    
    // Use requestAnimationFrame for smoother, more performant resizing
    // This reduces layout thrashing compared to setInterval
    let animationFrameId: number | null = null;
    let startTime: number | null = null;
    const transitionDuration = 300; // ms
    
    const animateResize = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      
      const elapsed = currentTime - startTime;
      
      // Resize during transition (every frame for smooth updates)
      if (elapsed < transitionDuration) {
        resizeWorkspace();
        animationFrameId = requestAnimationFrame(animateResize);
      } else {
        // Final resize after transition completes
        resizeWorkspace();
      }
    };
    
    animationFrameId = requestAnimationFrame(animateResize);
    
    // Fallback timeout to ensure final resize happens
    const timeoutId = setTimeout(() => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      resizeWorkspace();
    }, 350); // Slightly longer than transition duration (300ms)

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isSidebarOpen, isRightPanelOpen]);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    createCustomBlocks();

    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: emptyToolbox,
      grid: {
        spacing: 20,
        length: 1,
        colour: "#1f1f1f",
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true,
      },
      move: { scrollbars: true, drag: true, wheel: true },
      theme: Blockly.Themes.Classic,
      trashcan: true,
    });

    setTimeout(() => {
      if (workspaceRef.current) Blockly.svgResize(workspaceRef.current);
    }, 300);

    workspaceRef.current.addChangeListener((e) => {
      if ((e as Blockly.Events.Abstract).isUiEvent) return;
      
      // Block move/color logic...
      if (e.type === Blockly.Events.BLOCK_MOVE) {
        const moveEvent = e as Blockly.Events.BlockMove;
        if ((moveEvent.newParentId === null || moveEvent.newParentId === undefined) && moveEvent.blockId) {
          const blockId = moveEvent.blockId;
          setTimeout(() => {
            const block = workspaceRef.current?.getBlockById(blockId);
            if (block) {
              const blockType = block.type;
              const builtInBlockColors: Record<string, string> = {
                'controls_repeat_ext': '#00c3dd',
                'controls_whileUntil': '#00c3dd',
                'controls_for': '#00c3dd',
                'controls_if': '#ffd629',
                'logic_compare': '#ffd629',
                'logic_operation': '#ffd629',
                'logic_negate': '#ffd629',
              };
              
              if (builtInBlockColors[blockType]) {
                block.setColour(builtInBlockColors[blockType]);
              } else if (blockType.startsWith('variables_') || blockType === 'variables_get') {
                block.setColour('#3939ff');
              } else if (blockType.startsWith('procedures_')) {
                block.setColour('#9335ed');
              } else {
                const blockDef = Blockly.Blocks[blockType];
                if (blockDef && blockDef.init) {
                  const tempDiv = document.createElement('div');
                  tempDiv.style.display = 'none';
                  document.body.appendChild(tempDiv);
                  const tempWorkspace = Blockly.inject(tempDiv, {});
                  const tempBlock = tempWorkspace.newBlock(blockType);
                  blockDef.init.call(tempBlock);
                  const definedColor = tempBlock.getColour();
                  tempWorkspace.dispose();
                  document.body.removeChild(tempDiv);
                  if (definedColor) block.setColour(definedColor);
                }
              }
            }
          }, 10);
        }
      }
        
      // Generate JavaScript code for Simulator
      const jsCode = javascriptGenerator.workspaceToCode(workspaceRef.current!);
      
      // Generate real Python code for MicroPython tab
      const rawPythonCode = pythonGenerator.workspaceToCode(workspaceRef.current!);
      const micropythonCode = generateMicroPythonCode(rawPythonCode);
      
      // Generate Arduino Code
      const arduinoCode = generateArduinoCode(jsCode);

      dispatch(setGeneratedCode({ micropythonCode, arduinoCode, javascriptCode: jsCode }));

      const blocksData = Blockly.serialization.workspaces.save(
        workspaceRef.current as Blockly.Workspace
      );
      dispatch(updateCurrentProjectBlocks(blocksData.blocks?.blocks || []));
      dispatch(setModified(true));
    });

    return () => workspaceRef.current?.dispose();
  }, [dispatch]);

  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;
    if (currentProject && currentProject.blocks && currentProject.blocks.length > 0) {
      Blockly.serialization.workspaces.load({ blocks: { blocks: currentProject.blocks } }, ws);
    } else {
      ws.clear();
    }
  }, [currentProject?.id]);

  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;  
    if (currentProject) {
      ws.updateToolbox(fullToolbox);
    } else {
      ws.updateToolbox(emptyToolbox);
    }
  }, [currentProject]);

  return (
    <div className="h-full w-full bg-green-900 flex flex-col">
      <div className="relative flex-grow w-full flex" style={{ isolation: 'isolate' }}>
        {currentProject && (
          <CategoryPanel workspace={workspaceRef.current} />
        )}
        <div 
          className="flex-1 relative"
          style={{
            willChange: 'width',
            contain: 'layout style',
            backgroundColor: '#ffffff',
          }}
        >
          <div 
            ref={blocklyDiv} 

            className="absolute inset-0 z-0"
            // style={{
            //   willChange: 'width, height',
            //   contain: 'layout style paint',
            // }}
            style={{height: "100%", width: "100%",
              // clipPath: "polygon(0% 0%, 0% 0%, 16% 0%, 20% 4%, 80% 4%, 84% 0%, 100% 0%, 100% 100%, 84% 100%, 80% 96%, 20% 96%, 16% 100%, 0% 100%)",
              // clipPath: "polygon(0% 0%, 0% 0%, 100% 0%, 100% 97%, 97% 100%, 0% 100%)",
            }}
          />
          {!currentProject && (
            <div className="absolute inset-0 z-10">
              <WelcomePrompt />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlocklyWorkspace;