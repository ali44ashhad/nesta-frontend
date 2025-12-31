import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadProject,
  deleteProjectById,
  fetchProjects,
  loadTemplate,
} from "../store/projectSlice";
import { RootState, AppDispatch } from "../store";
import type { Project } from "../store/projectSlice";
import { setActiveModal } from "../store/uiState";
import * as Blockly from "blockly/core";
import { templates, Template } from "../templates/premade-templates";
import MyProjectsBtnIcon from "./icons/MyProjectsBtnIcon";
import TemplatesBtnIcon from "./icons/TemplatesBtnIcon";
import SearchBarIcon from "./icons/SearchBarIcon";
import ProjectPlaceholderIcon from "./icons/ProjectPlaceholderIcon";
// import LeftPanelBgIcon from "./icons/LeftPanelBgIcon";

const Sidebar = () => {
  const dispatch: AppDispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { savedProjects, status } = useSelector(
    (state: RootState) => state.project
  );
  const [activeTab, setActiveTab] = useState<"myProjects" | "templates">(
    "myProjects"
  );
  // const [showNewProjectPopup, setShowNewProjectPopup] = useState(false);
  // const [newProjectName, setNewProjectName] = useState("");
  // const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Fetch projects if they haven't been loaded yet (status is idle)
    // Also fetch if status is "failed" to retry
    // This prevents unnecessary API calls when sidebar is collapsed/expanded
    if (status === "idle" || status === "failed") {
      dispatch(fetchProjects());
    }
  }, [dispatch, status]);

  const filteredSavedProjects: Project[] = savedProjects.filter(
    (project: Project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadProject = (project: Project) => {
    dispatch(loadProject(project));
    const workspace = Blockly.getMainWorkspace();
    if (workspace) {
      Blockly.serialization.workspaces.load(
        { blocks: { blocks: project.blocks } },
        workspace
      );
    }
  };

  const handleLoadTemplate = (template: Template) => {
    dispatch(loadTemplate(template));
  };

  const handleCreateNewProject = () => {
    dispatch(setActiveModal("newProject"));
  };

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToDelete(projectId);
    setShowDeletePopup(true);
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      dispatch(deleteProjectById(projectToDelete));
    }
    setShowDeletePopup(false);
    setProjectToDelete(null);
  };

  const cancelDeleteProject = () => {
    setShowDeletePopup(false);
    setProjectToDelete(null);
  };

  const formatDate = (timestamp?: string) => {
    if (!timestamp) return "Unknown date";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div
      className="h-[90%] py-1 px-1 bg-[#CDECF8] relative"
      // style={{
      //   backgroundColor: "#EDF5E6",
      //   clipPath:
      //     "polygon(0% 4.5%, 11.5% 0%, 100% 0%, 100% 100%, 100% 100%, 8.75% 100%, 0% 96%)",
      // }}
    >
      {/* <LeftPanelBgIcon className="absolute inset-0 w-full h-full object-cover" preserveAspectRatio="none" /> */}
      <div className="relative z-10 h-full flex flex-col overflow-hidden">
        <div className="flex mb-2 gap-1">
          <button
            className="relative flex-1 group transition-all duration-200"
            onClick={() => setActiveTab("myProjects")}
          >
            <MyProjectsBtnIcon
              fillColor={activeTab === "myProjects" ? "#2FC1E8" : "lightGray"}
              className={`w-full h-10 transition-colors duration-200`}
            />
          </button>
          <button
            className="relative flex-1 group transition-all duration-200"
            onClick={() => setActiveTab("templates")}
          >
            <TemplatesBtnIcon
              fillColor={activeTab == "templates" ? "#2FC1E8" : "lightGray"}
              className={`w-full h-10 transition-colors duration-200`}
            />
            {/* <span className={`absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] md:text-xs font-semibold tracking-wider select-none pointer-events-none transition-colors duration-200 ${
            activeTab === "templates" ? "text-black" : "text-gray-600"
          }`}>
            TEMPLATES
          </span> */}
          </button>
        </div>

        <div className="mb-2 relative pt-0">
  <SearchBarIcon className="w-full h-9 pointer-events-none" />

  <input
    type="text"
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="
      absolute inset-0
      w-full h-full

      pl-4 sm:pl-6
      pr-2 sm:pr-4
      py-2

      bg-[#BFE8EA]
      text-xs sm:text-sm md:text-base
      text-nearBlack
      placeholder-gray-600

      border-[3px]
      border-[#2FC1E8]
      rounded-md

      focus:outline-none
      focus:ring-2
      focus:ring-[#2FC1E8]
    "
  />
</div>


        <div className="flex-1 overflow-y-auto scrollbar-hide pb-2">
          {activeTab === "myProjects" && (
            <div className="space-y-3">
            <div className="flex justify-center items-center mb-2">
              <button
                className="px-2 sm:px-3 py-1 mb-3 bg-[#FED32F] text-gray-900 font-bold rounded text-[10px] sm:text-xs md:text-sm hover:bg-[#8DD6EA] transition-colors"
                onClick={handleCreateNewProject}
              >
                + New Project
              </button>
            </div>

            {/* {showNewProjectPopup && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative z-[99999]">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewProjectPopup(false)}
                  title="Close"
                >
                  ×
                </button>
                <h2 className="text-lg font-semibold mb-2">
                  Create New Project
                </h2>
                <input
                  type="text"
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <textarea
                  className="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Project Description (optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors w-full"
                  onClick={handleSaveNewProject}
                  disabled={newProjectName.trim() === ""}
                >
                  Save
                </button>
              </div>
            </div>
          )} */}

            {showDeletePopup && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-[#CDECF8] rounded-lg shadow-lg p-6 min-w-[320px] relative z-[99999]">
                  <h2
                    className="text-base sm:text-lg md:text-xl font-semibold mb-4"
                    style={{ fontFamily: "Cyberank" }}
                  >
                    Delete Project
                  </h2>
                  <p
                    style={{ fontFamily: "TCM" }}
                    className="mb-4 text-sm sm:text-base text-gray-700"
                  >
                    Are you sure you want to delete this project? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="px-3 sm:px-4 py-2 bg-red text-white rounded text-xs sm:text-sm md:text-base hover:bg-red-700 transition-colors"
                      style={{ fontFamily: "TCM" }}
                      onClick={confirmDeleteProject}
                    >
                      Delete
                    </button>
                    <button
                      className="px-3 sm:px-4 py-2 bg-lightGray text-gray-800 rounded text-xs sm:text-sm md:text-base hover:bg-gray-400 transition-colors"
                      style={{ fontFamily: "TCM" }}
                      onClick={cancelDeleteProject}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === "loading" && (
              <p className="text-xs sm:text-sm md:text-base text-gray-500" style={{ fontFamily: "TCM" }}>
                Loading projects...
              </p>
            )}
            {status === "succeeded" && filteredSavedProjects.length === 0 && (
              <div 
                className="p-3 sm:p-4 border border-gray-600 rounded bg-lightGray bg-opacity-30 text-center text-xs sm:text-sm md:text-base text-gray-400"
                style={{ fontFamily: "TCM" }}
              >
                No saved projects yet.
              </div>
            )}
            {status === "succeeded" &&
              filteredSavedProjects.map((project: Project) => (
                <div
                  key={project.id}
                  className="relative rounded cursor-pointer transition-all duration-200 overflow-hidden min-h-[64px]"
                  onClick={() => handleLoadProject(project)}
                >
                  <ProjectPlaceholderIcon
                    className="w-full h-full absolute inset-0"
                    preserveAspectRatio="none"
                  />
                  <div className="relative px-1 pt-3.5 pb-1.5 sm:px-2 md:px-3 lg:px-4 flex flex-col justify-between min-h-[56px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px] w-full box-border">
                    <div className="flex justify-between items-start sm:items-center gap-1.5 sm:gap-2 w-full">
                      <h3
                        className="font-semibold text-gray-700 text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm uppercase tracking-wider break-words w-full leading-tight sm:leading-normal"
                       
                        title={project.name}
                      >
                        {project.name.length >
                        (window.innerWidth < 400
                          ? 8
                          : window.innerWidth < 640
                          ? 10
                          : window.innerWidth < 1024
                          ? 12
                          : 12)
                          ? project.name.slice(
                              0,
                              window.innerWidth < 400
                                ? 8
                                : window.innerWidth < 640
                                ? 10
                                : window.innerWidth < 1024
                                ? 12
                                : 12
                            ) + "..."
                          : project.name}
                      </h3>
                      <button
                        className="text-red hover:text-red-600 p-0.5 sm:p-1 z-10 flex-shrink-0 text-base sm:text-lg md:text-xl lg:text-2xl hover:scale-125 transition-transform duration-200 cursor-pointer leading-none"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Delete project"
                        
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 sm:w-4 sm:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6l12 12M6 18L18 6"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto w-full">
                      <p
                        className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm text-gray-500 leading-snug sm:leading-relaxed break-words line-clamp-2"
                        style={{ fontFamily: "TCM" }}
                        title={project.description}
                      >
                        {project.description.length >
                        (window.innerWidth < 640 ? 15 : 22)
                          ? project.description.slice(
                              0,
                              window.innerWidth < 640 ? 15 : 22
                            ) + "..."
                          : project.description || "No description"}
                      </p>
                      {project.updated_at && (
                        <p
                          className="
                            text-[8px] 
                            xs:text-[9px]
                            sm:text-[10px] 
                            md:text-[11px] 
                            lg:text-xs
                            text-gray-400 
                            break-words 
                            leading-tight"
                          style={{ fontFamily: "TCM" }}
                        >
                          {formatDate(project.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="relative rounded cursor-pointer transition-all duration-200 overflow-hidden min-h-[64px]"
                  title={template.name}
                  onClick={() => handleLoadTemplate(template)}
                >
                  <ProjectPlaceholderIcon
                    className="w-full h-full absolute inset-0"
                    preserveAspectRatio="none"
                  />
                  <div className="relative px-1 pt-4 pb-1 sm:px-2 md:px-3 lg:px-4 flex flex-col justify-between min-h-[56px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px] w-full box-border">
                    <h3
                      className="font-semibold text-gray-700 text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm uppercase tracking-wider break-words w-full leading-tight sm:leading-normal"
                      title={template.name}
                      style={{ fontFamily: "Cyberank" }}
                    >
                      {template.name.length > 13
                        ? template.name.slice(0, 10) + "..."
                        : template.name}
                    </h3>
                    <div className="mt-auto pt-1.5 sm:pt-2 w-full">
                      <p
                        className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs xl:text-sm text-gray-500 leading-snug sm:leading-relaxed break-words line-clamp-2"
                        title={template.description}
                        style={{ fontFamily: "TCM" }}
                      >
                        {template.description.length > 70
                          ? template.description.slice(0, 70) + "..."
                          : template.description || "No description"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
