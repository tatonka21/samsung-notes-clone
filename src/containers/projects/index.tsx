import React, { useState } from "react";
import useProjects from "store/hooks/useProjects";
import { Project, TaskStatus, Priority } from "store/slices/projects";
import {
  FiPlus,
  FiTrash2,
  FiList,
} from "react-icons/fi";
import css from "styles/projects.module.scss";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#9c27b0",
};

const STATUSES: TaskStatus[] = ["todo", "in-progress", "done", "blocked"];

const ProjectBoard: React.FC<{ project: Project }> = ({ project }) => {
  const { addTask, deleteTask, setTaskStatus, getTasksByStatus } =
    useProjects();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(project.id, {
      title: newTaskTitle.trim(),
      description: "",
      status: newTaskStatus,
      priority: newTaskPriority,
    });
    setNewTaskTitle("");
    setShowForm(false);
  };

  return (
    <div className={css.board}>
      <div className={css.boardHeader}>
        <h2 style={{ borderLeft: `4px solid ${project.color}` }}>
          {project.name}
        </h2>
        <p>{project.description}</p>
        <button className={css.addTaskBtn} onClick={() => setShowForm(!showForm)}>
          <FiPlus /> Add Task
        </button>
      </div>

      {showForm && (
        <div className={css.taskForm}>
          <input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            autoFocus
          />
          <select
            value={newTaskStatus}
            onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className={css.formBtns}>
            <button onClick={handleAddTask}>Add</button>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className={css.columns}>
        {STATUSES.map((status) => (
          <div key={status} className={css.column}>
            <div
              className={css.columnHeader}
              style={{
                borderTop: `3px solid ${
                  status === "todo"
                    ? "#607d8b"
                    : status === "in-progress"
                    ? "#2196f3"
                    : status === "done"
                    ? "#4caf50"
                    : "#f44336"
                }`,
              }}
            >
              <span>{STATUS_LABELS[status]}</span>
              <span className={css.count}>
                {getTasksByStatus(project, status).length}
              </span>
            </div>
            <div className={css.taskList}>
              {getTasksByStatus(project, status).map((task) => (
                <div key={task.id} className={css.taskCard}>
                  <div className={css.taskHeader}>
                    <span
                      className={css.priorityDot}
                      style={{ background: PRIORITY_COLORS[task.priority] }}
                      title={task.priority}
                    />
                    <span className={css.taskTitle}>{task.title}</span>
                    <button
                      className={css.deleteTask}
                      onClick={() => deleteTask(project.id, task.id)}
                    >
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                  <div className={css.taskActions}>
                    {STATUSES.filter((s) => s !== status).map((s) => (
                      <button
                        key={s}
                        className={css.moveBtn}
                        onClick={() => setTaskStatus(project.id, task.id, s)}
                        title={`Move to ${STATUS_LABELS[s]}`}
                      >
                        → {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const { projectsState, activeProject, createProject, deleteProject, selectProject } =
    useProjects();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim(), newDesc.trim());
    setNewName("");
    setNewDesc("");
    setShowNew(false);
  };

  return (
    <div className={css.container}>
      <div className={css.sidebar}>
        <div className={css.sideHeader}>
          <h3>Projects</h3>
          <button onClick={() => setShowNew(!showNew)}>
            <FiPlus />
          </button>
        </div>

        {showNew && (
          <div className={css.newProjectForm}>
            <input
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <input
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className={css.formBtns}>
              <button onClick={handleCreate}>Create</button>
              <button onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={css.projectList}>
          {projectsState.projects.map((p) => (
            <div
              key={p.id}
              className={`${css.projectItem} ${p.id === projectsState.activeProjectId ? css.active : ""}`}
              onClick={() => selectProject(p.id)}
            >
              <span
                className={css.projectColor}
                style={{ background: p.color }}
              />
              <div className={css.projectInfo}>
                <span className={css.projectName}>{p.name}</span>
                <span className={css.taskCount}>{p.tasks.length} tasks</span>
              </div>
              <button
                className={css.deleteProject}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(p.id);
                }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={css.main}>
        {!activeProject ? (
          <div className={css.empty}>
            <FiList size={64} />
            <h2>Project Manager</h2>
            <p>Create a project to manage tasks in a Kanban board.</p>
          </div>
        ) : (
          <ProjectBoard project={activeProject} />
        )}
      </div>
    </div>
  );
};

export default Projects;
