export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  updated_at: string;
  stargazers_count: number;
  language: string | null;
}

export interface GithubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  body: string | null;
}

export interface GithubCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  html_url: string;
}

const BASE = "https://api.github.com";

async function ghFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || `GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function getUser(token: string) {
  return ghFetch<{ login: string; name: string; avatar_url: string }>(
    "/user",
    token
  );
}

export async function listRepos(token: string): Promise<GithubRepo[]> {
  return ghFetch<GithubRepo[]>(
    "/user/repos?sort=updated&per_page=50",
    token
  );
}

export async function createRepo(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<GithubRepo> {
  return ghFetch<GithubRepo>("/user/repos", token, {
    method: "POST",
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
  });
}

export async function listIssues(
  token: string,
  owner: string,
  repo: string
): Promise<GithubIssue[]> {
  return ghFetch<GithubIssue[]>(
    `/repos/${owner}/${repo}/issues?state=all&per_page=30`,
    token
  );
}

export async function createIssue(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body: string
): Promise<GithubIssue> {
  return ghFetch<GithubIssue>(`/repos/${owner}/${repo}/issues`, token, {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
}

export async function listCommits(
  token: string,
  owner: string,
  repo: string
): Promise<GithubCommit[]> {
  return ghFetch<GithubCommit[]>(
    `/repos/${owner}/${repo}/commits?per_page=20`,
    token
  );
}

export async function createOrUpdateFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string,
  sha?: string
): Promise<void> {
  const encoded = btoa(unescape(encodeURIComponent(content)));
  await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: "PUT",
    body: JSON.stringify({ message, content: encoded, ...(sha ? { sha } : {}) }),
  });
}
