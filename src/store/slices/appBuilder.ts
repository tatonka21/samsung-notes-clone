import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export interface AppBuilderMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AppBuilderProject {
  id: string;
  name: string;
  description: string;
  type: "web" | "mobile" | "api" | "other";
  messages: AppBuilderMessage[];
  files: { name: string; content: string; language: string }[];
  createdAt: string;
  updatedAt: string;
  githubRepo?: string;
}

interface AppBuilderState {
  projects: AppBuilderProject[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

const saved = localStorage.getItem("appBuilderProjects");
const initialState: AppBuilderState = {
  projects: saved ? JSON.parse(saved) : [],
  activeProjectId: null,
  isLoading: false,
  error: null,
};

function persist(projects: AppBuilderProject[]) {
  localStorage.setItem("appBuilderProjects", JSON.stringify(projects));
}

const appBuilderSlice = createSlice({
  name: "appBuilder",
  initialState,
  reducers: {
    createProject: (
      state,
      action: PayloadAction<{
        name: string;
        description: string;
        type: AppBuilderProject["type"];
      }>
    ) => {
      const project: AppBuilderProject = {
        id: nanoid(),
        name: action.payload.name,
        description: action.payload.description,
        type: action.payload.type,
        messages: [],
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.unshift(project);
      state.activeProjectId = project.id;
      persist(state.projects);
    },
    selectProject: (state, action: PayloadAction<string>) => {
      state.activeProjectId = action.payload;
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = state.projects[0]?.id || null;
      }
      persist(state.projects);
    },
    addMessage: (
      state,
      action: PayloadAction<{ projectId: string; message: AppBuilderMessage }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        project.messages.push(action.payload.message);
        project.updatedAt = new Date().toISOString();
        persist(state.projects);
      }
    },
    upsertFile: (
      state,
      action: PayloadAction<{
        projectId: string;
        file: { name: string; content: string; language: string };
      }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        const idx = project.files.findIndex(
          (f) => f.name === action.payload.file.name
        );
        if (idx >= 0) {
          project.files[idx] = action.payload.file;
        } else {
          project.files.push(action.payload.file);
        }
        project.updatedAt = new Date().toISOString();
        persist(state.projects);
      }
    },
    setGithubRepo: (
      state,
      action: PayloadAction<{ projectId: string; repo: string }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        project.githubRepo = action.payload.repo;
        persist(state.projects);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export default appBuilderSlice;
