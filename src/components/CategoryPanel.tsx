import React, { useState, useEffect } from "react";
import * as Blockly from "blockly";
import ControlIcon1 from "./icons/CategoryPanelIcons1";
import ControlIcon2 from "./icons/CategoryPanelIcons2";
import ControlIcon3 from "./icons/CategoryPanelIcons3";
import ControlIcon4 from "./icons/CategoryPanelIcons4";
import ControlIcon5 from "./icons/CategoryPanelIcons5";
import ControlIcon6 from "./icons/CategoryPanelIcons6";
import ControlIcon7 from "./icons/CategoryPanelIcons7";
import ControlIcon8 from "./icons/CategoryPanelIcons8";

interface CategoryPanelProps {
  workspace: Blockly.WorkspaceSvg | null;
}

const categories = [
  { id: 0, name: "Control", icon: ControlIcon1, color: "#0C5671" },
  { id: 1, name: "Motion", icon: ControlIcon2, color: "#35B0D1" },
  { id: 2, name: "Sensors", icon: ControlIcon3, color: "#FB9903" },
  { id: 3, name: "Logic", icon: ControlIcon4, color: "#FED734" },
  { id: 4, name: "Math", icon: ControlIcon5, color: "#A1C154" },
  { id: 5, name: "Loops", icon: ControlIcon6, color: "#03C1DF" },
  { id: 6, name: "Variables", icon: ControlIcon7, color: "#454AF0" },
  { id: 7, name: "Functions", icon: ControlIcon8, color: "#138899" },
];

const CategoryPanel: React.FC<CategoryPanelProps> = ({ workspace }) => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  // Update Blockly block colors based on selected category
  useEffect(() => {
    if (!workspace || selectedCategory === null) {
      // Reset to default when no category selected
      document.documentElement.style.setProperty(
        "--blockly-category-color",
        ""
      );
      return;
    }

    const category = categories[selectedCategory];
    if (category) {
      document.documentElement.style.setProperty(
        "--blockly-category-color",
        category.color
      );
    }
  }, [selectedCategory, workspace]);

  // Monitor flyout open/close state
  useEffect(() => {
    if (!workspace) return;

    const checkFlyoutState = () => {
      const flyout = workspace.getFlyout();
      if (flyout) {
        const isOpen = flyout.isVisible();
        setIsFlyoutOpen(isOpen);
        if (!isOpen) {
          setSelectedCategory(null);
        }
      }
    };

    // Check initially
    checkFlyoutState();

    // Listen to workspace changes
    const changeListener = (e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
        setTimeout(checkFlyoutState, 100);
      }
    };

    workspace.addChangeListener(changeListener);

    // Also check on click outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".blocklyFlyout") &&
        !target.closest("[data-category-panel]")
      ) {
        setTimeout(checkFlyoutState, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      workspace.removeChangeListener(changeListener);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [workspace]);

  const handleCategoryClick = (categoryId: number) => {
    if (!workspace) return;

    // Toggle selection - if clicking the same category, close it
    if (selectedCategory === categoryId && isFlyoutOpen) {
      const toolbox = workspace.getToolbox();
      if (toolbox) {
        toolbox.clearSelection();
        setSelectedCategory(null);
        setIsFlyoutOpen(false);
      }
      return;
    }

    setSelectedCategory(categoryId);

    // Get the toolbox and select the category
    const toolbox = workspace.getToolbox();
    if (toolbox) {
      // Select the category by position
      try {
        toolbox.selectItemByPosition(categoryId);
        setIsFlyoutOpen(true);
      } catch {
        // Category might not exist, ignore
      }
    }
  };

  return (
    // <div
    //   data-category-panel
    //   className="w-auto h-full min-w-[60px] h-full bg-[#1D1D1D] flex flex-col items-start py-5 gap-6 px-3"
    //   // style={{
    //   //   clipPath: "polygon(0% 4%, 23% 0%, 57% 0%, 100% 0%, 100% 72%, 100% 100%, 34% 100%, -5% 94%)",
    //   // }}
    // >
    <div
      className="relative h-full"
      style={{
        width: isFlyoutOpen ? "120px" : "50px",
        transition: "width 0.3s ease",
        willChange: "width",
      }}
    >
      {/* <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="0,4 43,0 100,78 100,100 42,100 0,97"
          fill="none"
          stroke="#2FC1E8"
          strokeWidth="1px"
        />
      </svg> */}

      <div
        data-category-panel
        className="h-full bg-[#D6E8C2] flex flex-col items-center py-5 gap-6 transition-all duration-300"
        // style={{
        //   // borderLeftColor: "#e32626",
        //   borderLeft: "2px solid #2FC1E8",
        //   borderTop: "2px solid #2FC1E8",

        //   width: isFlyoutOpen ? "120px" : "50px",
        //   clipPath:
        //     "polygon(0% 4%, 45% 0%, 57% 0%, 100% 0%, 100% 78%, 100% 100%, 42% 100%, 0% 97%)",
        // }}
      >
        {categories.map((category) => {
          const CategoryPanelIcons = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            // <button
            //   key={category.id}
            //   onClick={() => handleCategoryClick(category.id)}
            //   className={`flex flex-row items-center transition-all duration-200 overflow-hidden w-full bg-brightBlue ${
            //     selectedCategory === null
            //       ? "justify-center hover:bg-lightGray"
            //       : isSelected
            //       ? "justify-start gap-1 px-2"
            //       : "justify-start"
            //   }`}
            //   title={category.name}
            // >
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
    flex items-center overflow-hidden rounded-sm transition-all duration-300 ease-in-out
    ${
      isFlyoutOpen
        ? "w-full px-2 justify-center gap-2"
        : "w-[30px] justify-start"
    }
    ${isSelected ? "ml-3" : ""}
  `}
            >
              {selectedCategory === null ? (
                <CategoryPanelIcons
                  fillColor={category.color}
                  Squeezed="true"
                  className="w-30 h-30 flex-shrink-0"
                />
              ) : (
                <CategoryPanelIcons
                  fillColor={category.color}
                  Squeezed="false"
                  className="w-30 h-30 flex-shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPanel;
