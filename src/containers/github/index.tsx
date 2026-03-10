import React, { useState, useEffect, useCallback } from "react";
import useSettings from "store/hooks/useSettings";
import {
  getUser,
  listRepos,
  createRepo,
  listIssues,
  createIssue,
  listCommits,
  GithubRepo,
  GithubIssue,
  GithubCommit,
} from "services/github";
import {
  FiGithub,
  FiAlertCircle,
  FiRefreshCw,
  FiPlus,
  FiExternalLink,
  FiGitCommit,
  FiAlertOctagon,
  FiStar,
  FiCode,
} from "react-icons/fi";
import css from "styles/github.module.scss";

type View = "repos" | "issues" | "commits";

const Github: React.FC = () => {
  const { hasGithubToken, settings } = useSettings();
  const [view, setView] = useState<View>("repos");
  const [user, setUser] = useState<{ login: string; name: string; avatar_url: string } | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [issues, setIssues] = useState<GithubIssue[]>([]);
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [newIssueBody, setNewIssueBody] = useState("");

  const token = settings.githubToken;

  const loadUser = useCallback(async () => {
    try {
      const u = await getUser(token);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
    }
  }, [token]);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRepos(token);
      setRepos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (hasGithubToken) {
      loadUser();
      loadRepos();
    }
  }, [hasGithubToken, loadUser, loadRepos]);

  const loadIssues = async (repo: GithubRepo) => {
    setLoading(true);
    setError(null);
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const data = await listIssues(token, owner, repoName);
      setIssues(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCommits = async (repo: GithubRepo) => {
    setLoading(true);
    setError(null);
    try {
      const [owner, repoName] = repo.full_name.split("/");
      const data = await listCommits(token, owner, repoName);
      setCommits(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repo: GithubRepo) => {
    setSelectedRepo(repo);
    setView("issues");
    loadIssues(repo);
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return;
    setLoading(true);
    try {
      await createRepo(token, newRepoName.trim(), newRepoDesc.trim(), newRepoPrivate);
      setNewRepoName("");
      setNewRepoDesc("");
      setShowNewRepo(false);
      await loadRepos();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!selectedRepo || !newIssueTitle.trim()) return;
    setLoading(true);
    try {
      const [owner, repoName] = selectedRepo.full_name.split("/");
      await createIssue(token, owner, repoName, newIssueTitle.trim(), newIssueBody.trim());
      setNewIssueTitle("");
      setNewIssueBody("");
      setShowNewIssue(false);
      await loadIssues(selectedRepo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasGithubToken) {
    return (
      <div className={css.noKey}>
        <FiGithub size={48} />
        <h2>GitHub Integration</h2>
        <p>Go to <strong>Settings</strong> and add your GitHub Personal Access Token.</p>
        <p className={css.hint}>
          Create a token at{" "}
          <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">
            github.com/settings/tokens
          </a>{" "}
          with <code>repo</code> scope.
        </p>
      </div>
    );
  }

  return (
    <div className={css.container}>
      {/* Header */}
      <div className={css.header}>
        <div className={css.userInfo}>
          {user && (
            <>
              <img src={user.avatar_url} alt={user.login} className={css.avatar} />
              <div>
                <span className={css.userName}>{user.name || user.login}</span>
                <span className={css.userLogin}>@{user.login}</span>
              </div>
            </>
          )}
        </div>
        <div className={css.headerActions}>
          <button onClick={loadRepos} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={() => setShowNewRepo(!showNewRepo)}>
            <FiPlus /> New Repo
          </button>
        </div>
      </div>

      {error && (
        <div className={css.error}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {showNewRepo && (
        <div className={css.newRepoForm}>
          <h3>Create Repository</h3>
          <input
            placeholder="Repository name"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
          />
          <input
            placeholder="Description (optional)"
            value={newRepoDesc}
            onChange={(e) => setNewRepoDesc(e.target.value)}
          />
          <label className={css.checkLabel}>
            <input
              type="checkbox"
              checked={newRepoPrivate}
              onChange={(e) => setNewRepoPrivate(e.target.checked)}
            />
            Private repository
          </label>
          <div className={css.formBtns}>
            <button onClick={handleCreateRepo} disabled={loading}>
              Create
            </button>
            <button onClick={() => setShowNewRepo(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={css.tabs}>
        <button
          className={view === "repos" ? css.activeTab : ""}
          onClick={() => setView("repos")}
        >
          <FiCode /> Repositories ({repos.length})
        </button>
        {selectedRepo && (
          <>
            <button
              className={view === "issues" ? css.activeTab : ""}
              onClick={() => {
                setView("issues");
                loadIssues(selectedRepo);
              }}
            >
              <FiAlertOctagon /> Issues
            </button>
            <button
              className={view === "commits" ? css.activeTab : ""}
              onClick={() => {
                setView("commits");
                loadCommits(selectedRepo);
              }}
            >
              <FiGitCommit /> Commits
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className={css.content}>
        {loading && <div className={css.loading}>Loading...</div>}

        {view === "repos" && !loading && (
          <div className={css.repoGrid}>
            {repos.map((repo) => (
              <div
                key={repo.id}
                className={css.repoCard}
                onClick={() => handleSelectRepo(repo)}
              >
                <div className={css.repoName}>
                  <FiCode /> {repo.name}
                  {repo.private && <span className={css.privateBadge}>Private</span>}
                </div>
                <p className={css.repoDesc}>{repo.description || "No description"}</p>
                <div className={css.repoMeta}>
                  {repo.language && <span>{repo.language}</span>}
                  <span>
                    <FiStar /> {repo.stargazers_count}
                  </span>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "issues" && selectedRepo && !loading && (
          <div className={css.issuesList}>
            <div className={css.listHeader}>
              <h3>Issues — {selectedRepo.full_name}</h3>
              <button onClick={() => setShowNewIssue(!showNewIssue)}>
                <FiPlus /> New Issue
              </button>
            </div>
            {showNewIssue && (
              <div className={css.newIssueForm}>
                <input
                  placeholder="Issue title"
                  value={newIssueTitle}
                  onChange={(e) => setNewIssueTitle(e.target.value)}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newIssueBody}
                  onChange={(e) => setNewIssueBody(e.target.value)}
                  rows={3}
                />
                <div className={css.formBtns}>
                  <button onClick={handleCreateIssue} disabled={loading}>
                    Create
                  </button>
                  <button onClick={() => setShowNewIssue(false)}>Cancel</button>
                </div>
              </div>
            )}
            {issues.map((issue) => (
              <div key={issue.id} className={css.issueItem}>
                <span
                  className={css.issueStatus}
                  style={{ color: issue.state === "open" ? "#4caf50" : "#f44336" }}
                >
                  ●
                </span>
                <div className={css.issueInfo}>
                  <a href={issue.html_url} target="_blank" rel="noreferrer">
                    #{issue.number} {issue.title}
                  </a>
                  <span className={css.issueDate}>
                    {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {issues.length === 0 && <p>No issues found.</p>}
          </div>
        )}

        {view === "commits" && selectedRepo && !loading && (
          <div className={css.commitsList}>
            <h3>Commits — {selectedRepo.full_name}</h3>
            {commits.map((commit) => (
              <div key={commit.sha} className={css.commitItem}>
                <FiGitCommit />
                <div className={css.commitInfo}>
                  <a href={commit.html_url} target="_blank" rel="noreferrer">
                    {commit.commit.message.split("\n")[0]}
                  </a>
                  <span className={css.commitMeta}>
                    {commit.commit.author.name} ·{" "}
                    {new Date(commit.commit.author.date).toLocaleDateString()}
                  </span>
                </div>
                <code className={css.sha}>{commit.sha.slice(0, 7)}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Github;
