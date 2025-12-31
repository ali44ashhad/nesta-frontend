import api from "./api"; // Use the new api instance
import { Project } from "../store/projectSlice";

const API_URL = `/api/projects/`;

class ProjectService {
  getProjects() {
    return api.get(API_URL);
  }

  getProjectById(projectId: string) {
    return api.get(API_URL + projectId);
  }

  createProject(project: Omit<Project, "id" | "lastModified" | "created">) {
    return api.post(API_URL, project);
  }

  updateProject(project: Project) {
    return api.put(API_URL + project.id, project);
  }

  deleteProject(projectId: string) {
    return api.delete(API_URL + projectId);
  }
}

export default new ProjectService();