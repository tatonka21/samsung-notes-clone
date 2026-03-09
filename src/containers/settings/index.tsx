import React, { useState } from "react";
import useSettings from "store/hooks/useSettings";
import { FiKey, FiGithub, FiSave, FiEye, FiEyeOff, FiCheckCircle } from "react-icons/fi";
import css from "styles/settings.module.scss";

const Settings: React.FC = () => {
  const { settings, setGeminiApiKey, setGithubToken, setGithubUsername } =
    useSettings();

  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey);
  const [githubToken, setGhToken] = useState(settings.githubToken);
  const [githubUser, setGhUser] = useState(settings.githubUsername);
  const [showGemini, setShowGemini] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setGeminiApiKey(geminiKey.trim());
    setGithubToken(githubToken.trim());
    setGithubUsername(githubUser.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h1>Settings</h1>
        <p>Configure your API keys and integrations</p>
      </div>

      <div className={css.section}>
        <div className={css.sectionHeader}>
          <FiKey size={20} />
          <h2>Gemini AI API Key</h2>
        </div>
        <p className={css.desc}>
          Used for AI Chat, AI App Builder, note enhancements, and AI research.
          Get a free key at{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
          >
            Google AI Studio
          </a>
          .
        </p>
        <div className={css.inputGroup}>
          <input
            type={showGemini ? "text" : "password"}
            placeholder="AIza..."
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
          <button
            className={css.toggleBtn}
            onClick={() => setShowGemini(!showGemini)}
          >
            {showGemini ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {settings.geminiApiKey && (
          <div className={css.connected}>
            <FiCheckCircle /> Gemini API key configured
          </div>
        )}
      </div>

      <div className={css.section}>
        <div className={css.sectionHeader}>
          <FiGithub size={20} />
          <h2>GitHub Integration</h2>
        </div>
        <p className={css.desc}>
          Personal Access Token with <code>repo</code> scope. Create one at{" "}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
          >
            github.com/settings/tokens
          </a>
          .
        </p>
        <label className={css.label}>Personal Access Token</label>
        <div className={css.inputGroup}>
          <input
            type={showGithub ? "text" : "password"}
            placeholder="ghp_..."
            value={githubToken}
            onChange={(e) => setGhToken(e.target.value)}
          />
          <button
            className={css.toggleBtn}
            onClick={() => setShowGithub(!showGithub)}
          >
            {showGithub ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        <label className={css.label}>GitHub Username</label>
        <input
          className={css.plainInput}
          type="text"
          placeholder="your-username"
          value={githubUser}
          onChange={(e) => setGhUser(e.target.value)}
        />
        {settings.githubToken && (
          <div className={css.connected}>
            <FiCheckCircle /> GitHub token configured
          </div>
        )}
      </div>

      <button className={css.saveBtn} onClick={handleSave}>
        {saved ? (
          <>
            <FiCheckCircle /> Saved!
          </>
        ) : (
          <>
            <FiSave /> Save Settings
          </>
        )}
      </button>
    </div>
  );
};

export default Settings;
