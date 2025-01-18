import axios, { AxiosError } from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

export interface RepoData {
  owner: string;
  repo: string;
}

export interface CommitData {
  sha: string;
  commit: {
    author: {
      date: string;
    };
    message: string;
  };
  files: FileChange[];
}

export interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

// Add GitHub token if available
const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
const headers = githubToken ? { Authorization: `token ${githubToken}` } : {};

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token.');
      } else if (status === 404) {
        throw new Error('Repository not found. Please check the URL and try again.');
      }
    }
    throw new Error(axiosError.message);
  }
  throw new Error('An unexpected error occurred');
};

export const fetchRepoCommits = async ({ owner, repo }: RepoData) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`,
      {
        params: {
          per_page: 100,
        },
        headers,
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchCommitDetails = async ({ owner, repo, sha }: RepoData & { sha: string }) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};