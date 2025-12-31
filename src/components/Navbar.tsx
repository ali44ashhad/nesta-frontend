import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastManager"; 
import {
  createNewProject,
  saveCurrentProject,
  updateCurrentProjectName,
  type ProjectBlock,
} from "../store/projectSlice";
import { RootState, AppDispatch, resetAllStore } from "../store";
import NestaLogo from "../assets/NestaLogo.png";
// import LeftTopLineIcon from "./icons/LeftTopLineIcon";
// import RightTopLineIcon from "./icons/RightTopLineIcon";
import SaveBtnIcon from "./icons/SaveBtnIcon";
import ExportBtnIcon from "./icons/ExportBtnIcon";
// import RightTopLine from "../assets/Modern/rightTop-line.svg";
// import SaveBtnSvg from "../assets/Modern/rightBtnSave copy.svg";
// import ExportBtnSvg from "../assets/Modern/rightBtnExport.svg";
import AuthService from "../services/auth.service";
import * as Blockly from "blockly/core";

const Navbar = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentProject, savedProjects } = useSelector(
    (state: RootState) => state.project
  );
  const [projectName, setProjectName] = useState<string>(""); // Default to empty string
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null);

  const user = AuthService.getCurrentUser();

  useEffect(() => {
    // Ensure projectName is always a string
    setProjectName(currentProject?.name || "");
  }, [currentProject]);

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (hamburgerMenuOpen && !target.closest(".hamburger-menu-container")) {
        setHamburgerMenuOpen(false);
      }
    };

    if (hamburgerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hamburgerMenuOpen]);

  const handleSave = () => {
    if (currentProject) {
      const trimmedName = projectName.trim();
      if (!trimmedName) {
        showToast("Project name cannot be empty", "error");
        return;
      }

      // Try to get workspace - use getMainWorkspace or find it from all workspaces
      let workspace: Blockly.Workspace | null = Blockly.getMainWorkspace();
      
      // If getMainWorkspace returns null, try to find the workspace from all workspaces
      if (!workspace) {
        const allWorkspaces = Blockly.Workspace.getAll();
        workspace = allWorkspaces.length > 0 ? allWorkspaces[0] : null;
      }

      let projectBlocks: ProjectBlock[] = [];
      
      if (workspace) {
        try {
          const blocks = Blockly.serialization.workspaces.save(workspace);
          projectBlocks = blocks.blocks?.blocks || [];
        } catch (error) {
          console.error("Error saving workspace blocks:", error);
        }
      }
      
      // Fallback: Use blocks from Redux state if workspace save failed or returned empty
      if (
        projectBlocks.length === 0 &&
        currentProject.blocks &&
        currentProject.blocks.length > 0
      ) {
        projectBlocks = currentProject.blocks;
      }

      // console.log("projectBlocks", projectBlocks);
      // console.log("workspace", workspace);
      // console.log("currentProject.blocks", currentProject.blocks);


      if (String(currentProject.id).startsWith("temp-")) {
        const newProjectData = {
          name: trimmedName,
          description: currentProject.description,
          blocks: projectBlocks,
        };
        dispatch(createNewProject(newProjectData))
          .unwrap()
          .then(() => showToast("Project saved successfully!", "success"))
          .catch((error: unknown) => {
            let errorMessage = "Error saving project";
            if (error && typeof error === "object" && "response" in error) {
              const axiosError = error as {
                response?: { data?: { message?: string } };
              };
              errorMessage = axiosError.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            showToast(`${errorMessage}`, "error");
          });
      } else {
        const projectToUpdate = {
          ...currentProject,
          name: trimmedName,
          blocks: projectBlocks,
        };
        dispatch(saveCurrentProject(projectToUpdate))
          .unwrap()
          .then(() => showToast("Project updated successfully!", "success"))
          .catch((error: unknown) => {
            let errorMessage = "Error updating project";
            if (error && typeof error === "object" && "response" in error) {
              const axiosError = error as {
                response?: { data?: { message?: string } };
              };
              errorMessage = axiosError.response?.data?.message || errorMessage;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            showToast(`${errorMessage}`, "error");
          });
      }
    }
  };

  const handleExport = () => {
    if (currentProject) {
      setShowExportPopup(true);
    } else {
      showToast("Please save the project to get a unique ID.", "info");
    }
  };

  const handleLogout = async () => {
    try {
      // 1. Single command to wipe all Redux state
      dispatch(resetAllStore());
      
      // 2. Clear local storage items
      localStorage.removeItem("user");
      // localStorage.removeItem('locationData'); // Optional: if you want to clear location cache

      // 3. Clear Blockly workspace manually (it lives outside Redux)
      const workspace = Blockly.getMainWorkspace();
      if (workspace) {
        workspace.clear();
      }

      await AuthService.logout();
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      // ... existing error handling ...
      let errorMessage = "Logout failed";
      if (error instanceof Error) errorMessage = error.message;
      showToast(errorMessage, "error");
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setProjectName(newValue);
    if (currentProject) {
      dispatch(updateCurrentProjectName(newValue));
    }
  };

  const handleProjectNameBlur = () => {
    if (currentProject && !projectName.trim()) {
      const defaultName = currentProject.name || "Untitled Project";
      setProjectName(defaultName);
      dispatch(updateCurrentProjectName(defaultName));
      showToast("Project name cannot be empty", "error");
    }
  };

  const isProjectNameValid = () => {
    return projectName.trim().length > 0;
  };

  const handleEditIconClick = () => {
    if (currentProject && projectNameInputRef.current) {
      projectNameInputRef.current.focus();
      // Set cursor to end of text instead of selecting all
      const length = projectNameInputRef.current.value.length;
      projectNameInputRef.current.setSelectionRange(length, length);
    }
  };

  return (
    <>
      <nav className="bg-[#5B67E3] px-2 sm:py-1 grid grid-cols-3 items-center shadow-md">
        <div className="flex items-center">
          <div className="relative">
            {/* <LeftTopLineIcon
              width={350}
              height={45}
              className="absolute -top-4 left-0 pointer-events-none select-none"
            /> */}
            <img
              src={NestaLogo}
              alt="Nesta Toys Logo"
              className="h-8 sm:h-10"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          {currentProject ? (
            <div className="text-center">
              {/* <div
                className="text-lg sm:text-xl md:text-2xl font-bold text-nearBlack"
              style={{ fontFamily: "Saiba" }}  
              >
                {String(currentProject.id).startsWith("temp-")
                  ? "TEMPLATE"
                  : null}
              </div> */}
              {!String(currentProject.id).startsWith("temp-") && (
                <div
                  className="text-lg sm:text-xl md:text-3xl font-bold text-nearBlack"
                  style={{ fontFamily: "Saiba",display: "none" }}
                >
                  {`PROJECT : ${
                    savedProjects.findIndex(
                      (p: ProjectBlock) => p.id === currentProject.id
                    ) + 1 || ""
                  }`}
                </div>
              )}
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-nearBlack opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  onClick={handleEditIconClick}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <input
                  ref={projectNameInputRef}
                  type="text"
                  value={projectName}
                  onChange={handleProjectNameChange}
                  onBlur={handleProjectNameBlur}
                  className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-nearBlack bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-0.5 w-full max-w-xs placeholder-gray-500"
                  style={{ fontFamily: "Cyberank" }}
                  disabled={!currentProject}
                  placeholder="Project Name"
                  minLength={1}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative flex items-center justify-end gap-2 sm:gap-3 hamburger-menu-container">
          {/* Save and Export buttons - visible on large screens only */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            <button
              className="relative -mt-1 rounded text-sm inline-flex items-center transition-all duration-200 group"
              onClick={handleSave}
              disabled={!currentProject || !isProjectNameValid()}
              title={
                !currentProject
                  ? "Create or select a project first"
                  : !isProjectNameValid()
                  ? "Project name cannot be empty"
                  : "Save project"
              }
            >
              <SaveBtnIcon
                fillColor="#27A3FF"
                className="h-7s sm:h-5 md:h-7 lg:h-9 transition-colors duration-200"
              />
            </button>

            <button
              className="relative -mt-1 rounded text-sm inline-flex items-center transition-all duration-200 group"
              onClick={handleExport}
            >
              <ExportBtnIcon
               className="h-7s sm:h-5 md:h-7 lg:h-9 transition-colors duration-200 [&_.plate]:fill-[#FBC413] group-hover:[&_.plate]:fill-green-500" />
            </button>
          </div>

          {/* Profile button - visible on large screens only */}
          {user && (
            <div className="hidden lg:block relative">
             <button
  className="relative rounded text-sm inline-flex items-center transition-all duration-200 group"
  onClick={() => setProfileMenuOpen((open) => !open)}
  title="Profile menu"
  type="button"
>
  <svg
    width="49"
    height="41"
    viewBox="0 0 49 41"
    className="h-10 sm:h-9 md:h-7 lg:h-12 transition-colors duration-200"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background */}
    <rect
      x="0"
      y="0"
      width="49"
      height="41"
      rx="6"
      fill="#DDDDDD"
      className="group-hover:fill-limeGreen transition-colors duration-200"
    />

    {/* Thin Border */}
    <rect
      x="0.5"
      y="0.5"
      width="48"
      height="40"
      rx="5.5"
      fill="none"
      stroke="#000000"
      strokeWidth="1"
    />

    {/* User Head */}
    <path
      d="M24.5 9.5C21.5 9.5 19.1 11.9 19.1 14.9C19.1 17.9 21.5 20.3 24.5 20.3C27.5 20.3 29.9 17.9 29.9 14.9C29.9 11.9 27.5 9.5 24.5 9.5Z"
      fill="#FFFFFF"
    />

    {/* User Body */}
    <path
      d="M14.5 33V30.5C14.5 27.7 20.3 25.7 24.5 25.7C28.7 25.7 34.5 27.7 34.5 30.5V33H14.5Z"
      fill="#FFFFFF"
    />
  </svg>
</button>

              {profileMenuOpen && (
                <div
                  // style={{ fontFamily: "TCM" }}
                  className="absolute overflow-hidden right-0 mt-2 w-36 bg-darkerGray text-lightGray rounded-lg shadow-xl border border-limeGreen z-50"
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-mediumDarkGray transition-colors text-lightGray"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleProfile();
                    }}
                  >
                    Profile
                  </button>
                  {user && user.roles && user.roles.includes("ROLE_ADMIN") && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-mediumDarkGray transition-colors text-lightGray"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/analytics");
                      }}
                    >
                      Analytics
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-mediumDarkGray transition-colors text-lightGray"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger menu button - visible on tablet and smaller devices */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-darkerGray transition-colors"
            onClick={() => setHamburgerMenuOpen(!hamburgerMenuOpen)}
            title="Menu"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-lightGray"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {hamburgerMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Hamburger menu dropdown - visible on tablet and smaller devices */}
          {hamburgerMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-darkerGray rounded-lg shadow-xl border border-limeGreen z-50 lg:hidden">
              <div className="py-2">
                <button
                  className="w-full px-4 py-3 text-left hover:bg-mediumDarkGray transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lightGray"
                  onClick={() => {
                    handleSave();
                    setHamburgerMenuOpen(false);
                  }}
                  disabled={!currentProject || !isProjectNameValid()}
                  title={
                    !currentProject
                      ? "Create or select a project first"
                      : !isProjectNameValid()
                      ? "Project name cannot be empty"
                      : "Save project"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-limeGreen"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v6h6V3M9 15h6"
                    />
                  </svg>

                  <span
                    className="text-sm font-medium"
                    // style={{ fontFamily: "TCM" }}
                  >
                    Save
                  </span>
                </button>

                <button
                  className="w-full px-4 py-3 text-left hover:bg-mediumDarkGray transition-colors flex items-center gap-3 text-lightGray"
                  onClick={() => {
                    handleExport();
                    setHamburgerMenuOpen(false);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-limeGreen"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span
                    className="text-sm font-medium"
                    // style={{ fontFamily: "TCM" }}
                  >
                    Export
                  </span>
                </button>

                {user && (
                  <>
                    <div className="border-t border-limeGreen/30 my-1"></div>
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-mediumDarkGray transition-colors flex items-center gap-3 text-lightGray"
                      onClick={() => {
                        setHamburgerMenuOpen(false);
                        handleProfile();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-limeGreen"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0H2z" />
                      </svg>
                      <span
                        // style={{ fontFamily: "TCM" }}
                        className="text-sm font-medium"
                      >
                        Profile
                      </span>
                    </button>
                    {user &&
                      user.roles &&
                      user.roles.includes("ROLE_ADMIN") && (
                        <button
                          className="w-full px-4 py-3 text-left hover:bg-mediumDarkGray transition-colors flex items-center gap-3 text-lightGray"
                          onClick={() => {
                            setHamburgerMenuOpen(false);
                            navigate("/analytics");
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-limeGreen"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <span
                            // style={{ fontFamily: "TCM" }}
                            className="text-sm font-medium"
                          >
                            Analytics
                          </span>
                        </button>
                      )}
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-mediumDarkGray transition-colors flex items-center gap-3 text-lightGray"
                      onClick={() => {
                        setHamburgerMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-limeGreen"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span
                        // style={{ fontFamily: "TCM" }}
                        className="text-sm font-medium"
                      >
                        Logout
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showExportPopup && currentProject && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70">
          <div className="bg-mediumDarkGray rounded-xl shadow-xl p-6 min-w-[320px] max-w-md relative z-[99999]">
            <button
              className="absolute top-2 right-2 transition-colors duration-200 hover:opacity-70 text-lightGray"
              onClick={() => setShowExportPopup(false)}
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2
              className="text-lg font-semibold mb-4 text-limeGreen"
               
            >
              Export Project
            </h2>
            <p
              className="text-sm text-lightGray mb-4"
              // style={{ fontFamily: "TCM" }}
            >
              Your project's unique ID is:
            </p>
            <div
              className="bg-darkerGray text-lightGray font-mono p-3 rounded-md mb-4 break-all border border-limeGreen"
              // style={{ fontFamily: "TCM" }}
            >
              {currentProject.id}
            </div>
            <button
              className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 w-full bg-limeGreen text-nearBlack font-bold text-sm"
              onClick={() => {
                navigator.clipboard.writeText(currentProject.id);
                showToast("Project ID copied to clipboard!", "success");
                setShowExportPopup(false);
              }}
              
            >
              Copy ID
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
