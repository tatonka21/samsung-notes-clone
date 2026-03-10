import React, { useState } from "react";
import useNotes from "store/hooks/useNotes";
import useSettings from "store/hooks/useSettings";
import { enhanceNote } from "services/gemini";
import css from "styles/notes.module.scss";
import delay from "utils/delay";
import { FiCpu, FiTrash2 } from "react-icons/fi";

const AllNotes = () => {
  const { notesArray, deleteNote } = useNotes();
  const { hasGeminiKey, settings } = useSettings();

  const cH = (id: any) => {
    delay(800).then(() => {
      deleteNote(id);
    });
  };
  return (
    <div className={css.container}>
      <div className={css.top}>
        <h4>All Notes</h4>
      </div>
      <div className={css.grid}>
        {notesArray.length <= 0 ? (
          <p className={css.empty}>No notes yet. Click + to create one.</p>
        ) : (
          notesArray.map((data, index) => (
            <Item
              onDelete={() => cH(data.id)}
              key={index}
              {...data}
              hasAI={hasGeminiKey}
              apiKey={settings.geminiApiKey}
            />
          ))
        )}
      </div>
    </div>
  );
};
export default AllNotes;

interface NotesArrayProps {
  id: string;
  notesTitle: string;
  notesContent: string;
  createdDate: string;
  onDelete: () => void;
  hasAI?: boolean;
  apiKey?: string;
}

const Item = (props: NotesArrayProps) => {
  const { id, notesTitle, notesContent, createdDate, onDelete, hasAI, apiKey } = props;
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAI = async (action: "summarize" | "expand" | "rewrite" | "bullets") => {
    if (!apiKey) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await enhanceNote(apiKey, action, notesContent);
      setAiResult(result);
      setExpanded(true);
    } catch (e: any) {
      setAiResult(`Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id={id} className={css.items}>
      <h2>{notesTitle}</h2>
      <p>{notesContent}</p>
      <pre>
        <code>{createdDate}</code>
      </pre>
      {hasAI && (
        <div className={css.aiActions}>
          <span className={css.aiLabel}><FiCpu size={11} /> AI</span>
          {(["summarize", "expand", "rewrite", "bullets"] as const).map((a) => (
            <button
              key={a}
              className={css.aiBtn}
              onClick={() => handleAI(a)}
              disabled={aiLoading}
            >
              {aiLoading ? "..." : a}
            </button>
          ))}
        </div>
      )}
      {expanded && aiResult && (
        <div className={css.aiResult}>
          <div className={css.aiResultHeader}>
            <span>AI Result</span>
            <button onClick={() => setExpanded(false)}>✕</button>
          </div>
          <p>{aiResult}</p>
        </div>
      )}
      <button className={css.deleteBtn} onClick={onDelete}>
        <FiTrash2 size={14} /> Delete
      </button>
    </div>
  );
};

