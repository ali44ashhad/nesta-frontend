import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { createNewProject, importProjectById } from '../store/projectSlice';
import { setActiveModal } from '../store/uiState';
import { useToast } from './ToastManager';

const NewProjectPopup: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { showToast } = useToast();
  const { activeModal } = useSelector((state: RootState) => state.uiState);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [importProjectId, setImportProjectId] = useState("");

  if (activeModal !== 'newProject') {
    return null;
  }

  const handleClose = () => {
    dispatch(setActiveModal(null));
    setNewProjectName("");
    setNewProjectDesc("");
    setImportProjectId("");
  };

  const handleSaveNewProject = () => {
    if (newProjectName.trim() === "") return;
    const newProjectData = {
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      blocks: [],
    };
    dispatch(createNewProject(newProjectData));
    handleClose();
    setNewProjectName("");
    setNewProjectDesc("");
  };

  const handleImportProject = () => {
    if (importProjectId.trim() === "") return;
    dispatch(importProjectById(importProjectId.trim()))
      .unwrap()
      .then(() => {
        showToast("Project imported successfully!", "success");
        handleClose();
      })
      .catch((error: unknown) => {
        let errorMessage = "Error importing project";
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showToast(`${errorMessage}`, "error");
      });
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-green/70">
      <div className="rounded-xl shadow-xl p-6 min-w-[320px] max-w-md relative bg-[#5B67E3]">
        <button
          className="absolute top-2 right-2 transition-colors duration-200 hover:opacity-70 text-gray-400"
          onClick={handleClose}
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
          className="text-lg font-semibold mb-4 text-gray-900"
        
        >
          Create New Project
        </h2>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition bg-white text-gray-400 border border-limeGreen focus:border-limeGreen"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ fontFamily: "TCM" }}
            />
          </div>
          <div>
            <textarea
              className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition resize-none bg-white text-gray-400 border border-limeGreen focus:border-limeGreen"
              placeholder="Project Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={3}
              style={{ fontFamily: "TCM" }}
            />
          </div>
          <button
            className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 w-full  bg-[#0BD70E] text-black font-bold"
            onClick={handleSaveNewProject}
            disabled={newProjectName.trim() === ""}
            style={{ fontFamily: "TCM" }}
          >
            Save
          </button>
        </div>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white" />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-2 text-sm bg-mediumDarkGray text-gray-400"
              style={{ fontFamily: "TCM" }}
            >
              Or
            </span>
          </div>
        </div>
        <h3
          className="text-md font-semibold mb-2 text-gray-900"
        
        >
          Import Project
        </h3>
        <div className="space-y-3">
          <div>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none transition bg-white text-gray-400 border border-limeGreen focus:border-limeGreen"
              placeholder="Enter Project ID"
              value={importProjectId}
              onChange={(e) => setImportProjectId(e.target.value)}
              style={{ fontFamily: "TCM" }}
            />
          </div>
          <button
            className="px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90 w-full bg-[#0BD70E] text-black font-bold"
            onClick={handleImportProject}
            disabled={importProjectId.trim() === ""}
            style={{ fontFamily: "TCM" }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectPopup;