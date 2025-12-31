/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import ProjectService from "../services/project.service";

export interface ProjectBlock {
  type: string;
  id: string;
  x: number;
  y: number;
  fields?: Record<string, any>;
  inputs?: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  blocks: ProjectBlock[];
  lastModified?: number; // Represented as timestamp on frontend
  updated_at?: string; // from backend
  created_at?: string; // from backend
}

interface ProjectState {
  currentProject: Project | null;
  isModified: boolean;
  savedProjects: Project[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ProjectState = {
  currentProject: null,
  isModified: false,
  savedProjects: [],
  status: "idle",
};

// Async Thunks
export const fetchProjects = createAsyncThunk(
  "project/fetchProjects",
  async () => {
    const response = await ProjectService.getProjects();
    return response.data;
  }
);

export const createNewProject = createAsyncThunk(
  "project/createNewProject",
  async (
    projectData: { name: string; description: string; blocks: ProjectBlock[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await ProjectService.createProject(projectData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const saveCurrentProject = createAsyncThunk(
  "project/saveCurrentProject",
  async (project: Project, { rejectWithValue }) => {
    try {
      const response = await ProjectService.updateProject(project);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProjectById = createAsyncThunk(
  "project/deleteProjectById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      await ProjectService.deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const importProjectById = createAsyncThunk(
  "project/importProjectById",
  async (projectId: string, { rejectWithValue }) => {
    try {
      // First, get the project from the server
      const response = await ProjectService.getProjectById(projectId);
      // const projectToImport = response.data;
      // const newProjectResponse = await ProjectService.createProject(projectToImport);
      const projectToImport: Project = response.data;
      const newProjectData = {
        name: `${projectToImport.name} (Imported)`,
        description: projectToImport.description,
        blocks: projectToImport.blocks,
      };
      const newProjectResponse = await ProjectService.createProject(newProjectData);

      return newProjectResponse.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    loadProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
      state.isModified = false;
    },
    loadTemplate: (
      state,
      action: PayloadAction<{ name: string; description: string; blocks: ProjectBlock[] }>
    ) => {
      const now = Date.now();
      const newProjectFromTemplate: Project = {
        id: `temp-${now}`, // Temporary ID
        name: `${action.payload.name}`,
        description: action.payload.description,
        blocks: action.payload.blocks,
      };
      state.currentProject = newProjectFromTemplate;
      state.isModified = true; // Mark as modified so user is prompted to save
    },
    setModified: (state, action: PayloadAction<boolean>) => {
      state.isModified = action.payload;
    },
    updateCurrentProjectBlocks: (
      state,
      action: PayloadAction<ProjectBlock[]>
    ) => {
      if (state.currentProject) {
        state.currentProject.blocks = action.payload;
        state.isModified = true;
      }
    },
    updateCurrentProjectName: (state, action: PayloadAction<string>) => {
      if (state.currentProject) {
        state.currentProject.name = action.payload;
        state.isModified = true;
      }
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
        state.currentProject = action.payload;
        state.isModified = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.status = "succeeded";
          state.savedProjects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(
        createNewProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.savedProjects.unshift(action.payload);
          state.currentProject = action.payload;
          state.isModified = false;
        }
      )
      .addCase(
        saveCurrentProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          const index = state.savedProjects.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.savedProjects[index] = action.payload;
          } else {
            state.savedProjects.unshift(action.payload);
          }
          state.currentProject = action.payload;
          state.isModified = false;
        }
      )
      .addCase(
        deleteProjectById.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.savedProjects = state.savedProjects.filter(
            (p) => p.id !== action.payload
          );
          if (state.currentProject?.id === action.payload) {
            state.currentProject = null;
          }
        }
      )
    .addCase(
      importProjectById.fulfilled,
      (state, action: PayloadAction<Project>) => {
        state.savedProjects.unshift(action.payload);
        state.currentProject = action.payload;
        state.isModified = false;
      }
    );
  },
});

export const {
  loadProject,
  setModified,
  loadTemplate,
  updateCurrentProjectBlocks,
  updateCurrentProjectName,
  setCurrentProject,
} = projectSlice.actions;

export default projectSlice.reducer;
