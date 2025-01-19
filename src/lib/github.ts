import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';
const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
const headers = githubToken ? { Authorization: `token ${githubToken}` } : {};

export interface RepoDetails {
  stargazers_count: number;
  forks_count: number;
  commit_count: number;
  contributor_count: number;
}

export interface CommitData {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  files?: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
  }[];
}

export const fetchRepoDetails = async ({ owner, repo }: { owner: string; repo: string }): Promise<RepoDetails> => {
  const [repoData, commits, contributors] = await Promise.all([
    axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers }),
    axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`, { headers }),
    axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1`, { headers }),
  ]);

  const commitCount = parseInt(commits.headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');
  const contributorCount = parseInt(contributors.headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || '0');

  return {
    stargazers_count: repoData.data.stargazers_count,
    forks_count: repoData.data.forks_count,
    commit_count: commitCount,
    contributor_count: contributorCount,
  };
};

export const fetchRepoCommits = async ({ owner, repo }: { owner: string; repo: string }): Promise<CommitData[]> => {
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
    console.error('Error fetching commits:', error);
    throw error;
  }
};

export const fetchCommitDetails = async ({ owner, repo, sha }: { owner: string; repo: string; sha: string }): Promise<CommitData> => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching commit details:', error);
    throw error;
  }
};