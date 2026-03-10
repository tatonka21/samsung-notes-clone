import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store";
import { nanoid } from "@reduxjs/toolkit";
import appBuilderSlice, {
  AppBuilderProject,
  AppBuilderMessage,
} from "store/slices/appBuilder";
import useSettings from "store/hooks/useSettings";
import { sendChatMessage } from "services/gemini";
import {
  FiPlus,
  FiTrash2,
  FiCode,
  FiSend,
  FiAlertCircle,
  FiGlobe,
  FiSmartphone,
  FiServer,
  FiBox,
} from "react-icons/fi";
import css from "styles/appBuilder.module.scss";

const TYPE_ICONS: Record<AppBuilderProject["type"], React.ReactNode> = {
  web: <FiGlobe />,
  mobile: <FiSmartphone />,
  api: <FiServer />,
  other: <FiBox />,
};

const APP_BUILDER_SYSTEM = `You are an expert AI App Builder assistant. You help users design, plan, and build web apps, mobile apps, APIs, and full-stack projects. When asked to build something:
1. Start with architecture and tech stack recommendations
2. Provide detailed code snippets and file structures
3. Use markdown formatting with code blocks
4. Be proactive about suggesting best practices, testing, and deployment
5. When generating code, include file names as headers
6. Think step by step and explain your decisions`;

const AppBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const appBuilderState = useSelector((state: RootState) => state.appBuilder);
  const { hasGeminiKey, settings } = useSettings();
  const [input, setInput] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectType, setNewProjectType] = useState<AppBuilderProject["type"]>("web");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeProject = appBuilderState.projects.find(
    (p) => p.id === appBuilderState.activeProjectId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeProject?.messages]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    dispatch(
      appBuilderSlice.actions.createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        type: newProjectType,
      })
    );
    setNewProjectName("");
    setNewProjectDesc("");
    setNewProjectType("web");
    setShowNewProject(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || appBuilderState.isLoading || !activeProject) return;
    setInput("");

    const userMsg: AppBuilderMessage = {
      id: nanoid(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    dispatch(
      appBuilderSlice.actions.addMessage({
        projectId: activeProject.id,
        message: userMsg,
      })
    );
    dispatch(appBuilderSlice.actions.setLoading(true));
    dispatch(appBuilderSlice.actions.setError(null));

    try {
      const systemContext = `${APP_BUILDER_SYSTEM}\n\nProject: ${activeProject.name}\nDescription: ${activeProject.description}\nType: ${activeProject.type}`;
      const history = [
        { role: "user" as const, parts: systemContext },
        {
          role: "model" as const,
          parts: "Understood! I'm ready to help you build this project. What would you like to start with?",
        },
        ...activeProject.messages.map((m) => ({
          role: m.role,
          parts: m.content,
        })),
      ];
      const responseText = await sendChatMessage(settings.geminiApiKey, history, text);

      // Extract code blocks and save as files
      const codeBlockRegex = /```(\w+)\s*\n([\s\S]*?)```/g;
      const fileHeaderRegex = /^#+\s+([^\n]+\.\w+)\s*$/m;
      let match;
      while ((match = codeBlockRegex.exec(responseText)) !== null) {
        const lang = match[1];
        const code = match[2];
        const before = responseText.slice(0, match.index);
        const headerMatch = before.match(fileHeaderRegex);
        const fileName = headerMatch
          ? headerMatch[1]
          : `file-${Date.now()}.${lang}`;
        dispatch(
          appBuilderSlice.actions.upsertFile({
            projectId: activeProject.id,
            file: { name: fileName, content: code, language: lang },
          })
        );
      }

      const aiMsg: AppBuilderMessage = {
        id: nanoid(),
        role: "model",
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      dispatch(
        appBuilderSlice.actions.addMessage({
          projectId: activeProject.id,
          message: aiMsg,
        })
      );
    } catch (e: any) {
      dispatch(appBuilderSlice.actions.setError(e.message || "AI error"));
    } finally {
      dispatch(appBuilderSlice.actions.setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!hasGeminiKey) {
    return (
      <div className={css.noKey}>
        <FiAlertCircle size={48} />
        <h2>Gemini API Key Required</h2>
        <p>Go to Settings and add your Gemini API key.</p>
      </div>
    );
  }

  return (
    <div className={css.container}>
      {/* Project list */}
      <div className={css.sidebar}>
        <button
          className={css.newBtn}
          onClick={() => setShowNewProject(true)}
        >
          <FiPlus /> New Project
        </button>

        {showNewProject && (
          <div className={css.newProjectForm}>
            <input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <input
              placeholder="Description"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
            <select
              value={newProjectType}
              onChange={(e) =>
                setNewProjectType(e.target.value as AppBuilderProject["type"])
              }
            >
              <option value="web">Web App</option>
              <option value="mobile">Mobile App</option>
              <option value="api">API / Backend</option>
              <option value="other">Other</option>
            </select>
            <div className={css.formBtns}>
              <button onClick={handleCreateProject}>Create</button>
              <button onClick={() => setShowNewProject(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className={css.projectList}>
          {appBuilderState.projects.map((p) => (
            <div
              key={p.id}
              className={`${css.projectItem} ${p.id === appBuilderState.activeProjectId ? css.active : ""}`}
              onClick={() =>
                dispatch(appBuilderSlice.actions.selectProject(p.id))
              }
            >
              <span className={css.typeIcon}>{TYPE_ICONS[p.type]}</span>
              <div className={css.projectInfo}>
                <span className={css.projectName}>{p.name}</span>
                <span className={css.projectType}>{p.type}</span>
              </div>
              <button
                className={css.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(appBuilderSlice.actions.deleteProject(p.id));
                }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className={css.main}>
        {!activeProject ? (
          <div className={css.empty}>
            <FiCode size={64} />
            <h2>AI App Builder</h2>
            <p>
              Create a new project and start building with AI. Describe what you
              want to build and the AI will generate code, architecture, and
              guidance.
            </p>
            <div className={css.examples}>
              <h3>Example Projects</h3>
              {[
                "Build a React todo app with authentication",
                "Create a REST API with Node.js and PostgreSQL",
                "Design a mobile app for expense tracking",
                "Build a real-time chat application",
              ].map((ex) => (
                <div key={ex} className={css.exampleCard}>
                  {ex}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={css.projectView}>
            <div className={css.projectHeader}>
              <span className={css.typeIcon}>{TYPE_ICONS[activeProject.type]}</span>
              <div>
                <h2>{activeProject.name}</h2>
                <p>{activeProject.description}</p>
              </div>
              {activeProject.files.length > 0 && (
                <div className={css.fileCount}>
                  <FiCode /> {activeProject.files.length} files generated
                </div>
              )}
            </div>

            <div className={css.messages}>
              {activeProject.messages.length === 0 && (
                <div className={css.startPrompt}>
                  <p>
                    👋 Hi! I'm your AI App Builder. Tell me what you want to
                    build and I'll help you create it step by step.
                  </p>
                  <div className={css.quickStarts}>
                    {[
                      "Plan the architecture for this project",
                      "Generate the initial file structure",
                      "What tech stack should I use?",
                      "Create the main component",
                    ].map((q) => (
                      <button key={q} onClick={() => setInput(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeProject.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${css.message} ${msg.role === "user" ? css.userMsg : css.aiMsg}`}
                >
                  <div className={css.avatar}>
                    {msg.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className={css.bubble}>
                    {msg.role === "model" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <span className={css.time}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {appBuilderState.isLoading && (
                <div className={`${css.message} ${css.aiMsg}`}>
                  <div className={css.avatar}>🤖</div>
                  <div className={css.bubble}>
                    <div className={css.typing}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              {appBuilderState.error && (
                <div className={css.error}>
                  <FiAlertCircle /> {appBuilderState.error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={css.inputRow}>
              <textarea
                className={css.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what to build... (Enter to send)"
                rows={2}
              />
              <button
                className={css.sendBtn}
                onClick={handleSend}
                disabled={!input.trim() || appBuilderState.isLoading}
              >
                <FiSend size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBuilder;
