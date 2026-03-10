import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import projectsSlice, { Project, ProjectTask, TaskStatus } from "store/slices/projects";

const useProjects = () => {
  const dispatch = useDispatch();
  const projectsState = useSelector((state: RootState) => state.projects);

  const activeProject: Project | undefined = projectsState.projects.find(
    (p) => p.id === projectsState.activeProjectId
  );

  const createProject = (name: string, description: string) => {
    dispatch(projectsSlice.actions.createProject({ name, description }));
  };

  const deleteProject = (id: string) => {
    dispatch(projectsSlice.actions.deleteProject(id));
  };

  const selectProject = (id: string | null) => {
    dispatch(projectsSlice.actions.selectProject(id));
  };

  const addTask = (
    projectId: string,
    task: Omit<ProjectTask, "id" | "createdAt">
  ) => {
    dispatch(projectsSlice.actions.addTask({ projectId, task }));
  };

  const updateTask = (
    projectId: string,
    taskId: string,
    updates: Partial<ProjectTask>
  ) => {
    dispatch(projectsSlice.actions.updateTask({ projectId, taskId, updates }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    dispatch(projectsSlice.actions.deleteTask({ projectId, taskId }));
  };

  const setTaskStatus = (
    projectId: string,
    taskId: string,
    status: TaskStatus
  ) => {
    dispatch(
      projectsSlice.actions.updateTask({
        projectId,
        taskId,
        updates: { status },
      })
    );
  };

  const setGithubRepo = (projectId: string, repo: string) => {
    dispatch(projectsSlice.actions.setGithubRepo({ projectId, repo }));
  };

  const getTasksByStatus = (project: Project, status: TaskStatus) =>
    project.tasks.filter((t) => t.status === status);

  return {
    projectsState,
    activeProject,
    createProject,
    deleteProject,
    selectProject,
    addTask,
    updateTask,
    deleteTask,
    setTaskStatus,
    setGithubRepo,
    getTasksByStatus,
  };
};

export default useProjects;
