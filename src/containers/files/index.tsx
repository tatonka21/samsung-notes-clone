import React, { useState } from "react";
import useFiles from "store/hooks/useFiles";
import useSettings from "store/hooks/useSettings";
import { generateText } from "services/gemini";
import { FileItem } from "store/slices/files";
import {
  FiFolder,
  FiFilePlus,
  FiFile,
  FiTrash2,
  FiEdit2,
  FiSave,
  FiChevronRight,
  FiChevronDown,
  FiCpu,
} from "react-icons/fi";
import css from "styles/files.module.scss";

const FileTree: React.FC<{
  items: FileItem[];
  parentId: string | null;
  expanded: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getChildren: (parentId: string | null) => FileItem[];
  depth?: number;
}> = ({
  items,
  parentId,
  expanded,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  getChildren,
  depth = 0,
}) => {
  const children = getChildren(parentId);
  return (
    <>
      {children.map((item) => (
        <div key={item.id}>
          <div
            className={`${css.treeItem} ${item.id === selectedId ? css.selected : ""}`}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
            onClick={() => {
              if (item.type === "folder") onToggle(item.id);
              onSelect(item.id);
            }}
          >
            <span className={css.treeIcon}>
              {item.type === "folder" ? (
                <>
                  {expanded.includes(item.id) ? (
                    <FiChevronDown size={12} />
                  ) : (
                    <FiChevronRight size={12} />
                  )}
                  <FiFolder />
                </>
              ) : (
                <FiFile />
              )}
            </span>
            <span className={css.treeName}>{item.name}</span>
            <button
              className={css.treeDelete}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <FiTrash2 size={11} />
            </button>
          </div>
          {item.type === "folder" && expanded.includes(item.id) && (
            <FileTree
              items={items}
              parentId={item.id}
              expanded={expanded}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              onDelete={onDelete}
              getChildren={getChildren}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </>
  );
};

const Files: React.FC = () => {
  const {
    filesState,
    selectedItem,
    getChildren,
    createItem,
    updateItem,
    deleteItem,
    selectItem,
    toggleFolder,
    createResearchProject,
  } = useFiles();
  const { hasGeminiKey, settings } = useSettings();

  const [editingContent, setEditingContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");
  const [showNewForm, setShowNewForm] = useState(false);

  const handleSelect = (id: string) => {
    const item = filesState.items.find((i) => i.id === id);
    if (item?.type === "file") {
      selectItem(id);
      setEditingContent(item.content || "");
      setIsEditing(false);
    } else {
      selectItem(id);
    }
  };

  const handleSave = () => {
    if (selectedItem) {
      updateItem(selectedItem.id, { content: editingContent });
      setIsEditing(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !hasGeminiKey) return;
    setIsAiLoading(true);
    try {
      const content = await generateText(
        settings.geminiApiKey,
        `${aiPrompt}\n\nPlease format the output in markdown.`
      );
      setEditingContent(content);
      setIsEditing(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAiLoading(false);
      setAiPrompt("");
    }
  };

  const handleResearchBatch = async () => {
    if (!aiPrompt.trim() || !hasGeminiKey) return;
    setIsAiLoading(true);
    try {
      const listText = await generateText(
        settings.geminiApiKey,
        `List exactly 10 subtopics for the research topic: "${aiPrompt}". Return ONLY a JSON array of strings, no explanation. Example: ["topic1","topic2"]`
      );
      let subtopics: string[] = [];
      try {
        const jsonMatch = listText.match(/\[[\s\S]*\]/);
        subtopics = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      } catch {
        subtopics = listText
          .split("\n")
          .filter((l) => l.trim())
          .slice(0, 10);
      }

      const summaries: Record<string, string> = {};
      for (const st of subtopics.slice(0, 5)) {
        try {
          summaries[st] = await generateText(
            settings.geminiApiKey,
            `Write a comprehensive research note about "${st}" in the context of "${aiPrompt}". Use markdown with headers, bullet points, and key insights.`
          );
        } catch {
          summaries[st] = `# ${st}\n\nResearch pending...`;
        }
      }

      createResearchProject(aiPrompt, subtopics, summaries);
      setAiPrompt("");
      alert(`Created research project with ${subtopics.length} topics!`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateItem = () => {
    if (!newItemName.trim()) return;
    const parentId =
      selectedItem?.type === "folder"
        ? selectedItem.id
        : selectedItem?.parentId ?? null;
    createItem(newItemName.trim(), newItemType, parentId);
    setNewItemName("");
    setShowNewForm(false);
  };

  return (
    <div className={css.container}>
      {/* Sidebar tree */}
      <div className={css.tree}>
        <div className={css.treeHeader}>
          <h3>Files & Folders</h3>
          <div className={css.treeActions}>
            <button
              title="New File/Folder"
              onClick={() => setShowNewForm(!showNewForm)}
            >
              <FiFilePlus />
            </button>
          </div>
        </div>

        {showNewForm && (
          <div className={css.newItemForm}>
            <input
              placeholder="Name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateItem()}
            />
            <select
              value={newItemType}
              onChange={(e) =>
                setNewItemType(e.target.value as "file" | "folder")
              }
            >
              <option value="file">File</option>
              <option value="folder">Folder</option>
            </select>
            <button onClick={handleCreateItem}>Create</button>
          </div>
        )}

        <div className={css.treeContent}>
          <FileTree
            items={filesState.items}
            parentId={null}
            expanded={filesState.expandedFolders}
            selectedId={filesState.selectedId}
            onSelect={handleSelect}
            onToggle={toggleFolder}
            onDelete={deleteItem}
            getChildren={getChildren}
          />
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={css.editor}>
        {!selectedItem || selectedItem.type === "folder" ? (
          <div className={css.emptyEditor}>
            <FiFolder size={64} />
            <h2>File Manager</h2>
            <p>Select a file to view or edit its content.</p>

            {hasGeminiKey && (
              <div className={css.aiResearch}>
                <h3>
                  <FiCpu /> AI Research Mode
                </h3>
                <p>
                  Enter a research topic to automatically create a folder with
                  AI-generated notes for each subtopic.
                </p>
                <div className={css.aiInput}>
                  <input
                    placeholder="e.g. Top 10 AI opportunities in 2025"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={isAiLoading}
                  />
                  <button
                    onClick={handleResearchBatch}
                    disabled={isAiLoading || !aiPrompt.trim()}
                  >
                    {isAiLoading ? "Generating..." : "🔬 Research"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={css.fileEditor}>
            <div className={css.editorHeader}>
              <h3>
                <FiFile /> {selectedItem.name}
              </h3>
              <div className={css.editorActions}>
                {hasGeminiKey && (
                  <div className={css.aiBar}>
                    <input
                      placeholder="Ask AI to generate content..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAiGenerate()
                      }
                      disabled={isAiLoading}
                    />
                    <button
                      onClick={handleAiGenerate}
                      disabled={isAiLoading || !aiPrompt.trim()}
                    >
                      <FiCpu /> {isAiLoading ? "..." : "Generate"}
                    </button>
                  </div>
                )}
                {isEditing ? (
                  <button className={css.saveBtn} onClick={handleSave}>
                    <FiSave /> Save
                  </button>
                ) : (
                  <button
                    className={css.editBtn}
                    onClick={() => {
                      setIsEditing(true);
                      setEditingContent(selectedItem.content || "");
                    }}
                  >
                    <FiEdit2 /> Edit
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                className={css.textEditor}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="Start typing..."
              />
            ) : (
              <div className={css.fileContent}>
                <pre>{selectedItem.content || "(empty file)"}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;
