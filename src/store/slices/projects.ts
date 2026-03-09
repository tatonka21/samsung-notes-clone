import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type Priority = "low" | "medium" | "high" | "critical";

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: ProjectTask[];
  createdAt: string;
  updatedAt: string;
  githubRepo?: string;
}

interface ProjectsState {
  projects: Project[];
  activeProjectId: string | null;
}

const saved = localStorage.getItem("projects");
const initialState: ProjectsState = {
  projects: saved ? JSON.parse(saved) : [],
  activeProjectId: null,
};

const COLORS = [
  "#2196f3",
  "#4caf50",
  "#ff9800",
  "#e91e63",
  "#9c27b0",
  "#00bcd4",
  "#ff5722",
  "#607d8b",
];

function persist(projects: Project[]) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    createProject: (
      state,
      action: PayloadAction<{ name: string; description: string }>
    ) => {
      const project: Project = {
        id: nanoid(),
        name: action.payload.name,
        description: action.payload.description,
        color: COLORS[state.projects.length % COLORS.length],
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.projects.push(project);
      state.activeProjectId = project.id;
      persist(state.projects);
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = state.projects[0]?.id || null;
      }
      persist(state.projects);
    },
    selectProject: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    addTask: (
      state,
      action: PayloadAction<{
        projectId: string;
        task: Omit<ProjectTask, "id" | "createdAt">;
      }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        project.tasks.push({
          ...action.payload.task,
          id: nanoid(),
          createdAt: new Date().toISOString(),
        });
        project.updatedAt = new Date().toISOString();
        persist(state.projects);
      }
    },
    updateTask: (
      state,
      action: PayloadAction<{
        projectId: string;
        taskId: string;
        updates: Partial<ProjectTask>;
      }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        const task = project.tasks.find((t) => t.id === action.payload.taskId);
        if (task) {
          Object.assign(task, action.payload.updates);
          project.updatedAt = new Date().toISOString();
          persist(state.projects);
        }
      }
    },
    deleteTask: (
      state,
      action: PayloadAction<{ projectId: string; taskId: string }>
    ) => {
      const project = state.projects.find(
        (p) => p.id === action.payload.projectId
      );
      if (project) {
        project.tasks = project.tasks.filter(
          (t) => t.id !== action.payload.taskId
        );
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
  },
});

export default projectsSlice;
