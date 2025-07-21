import axios, { AxiosResponse, AxiosError } from 'axios';
import { GitHubPRInfo, GitHubErrorResponse } from '../types';
import { buildGitHubApiUrl } from './url-parser';

/**
 * GitHub API client for fetching pull request diffs
 */
export class GitHubClient {
  private readonly token: string;
  private readonly baseURL = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetches the diff for a pull request
   * @param prInfo The pull request information
   * @returns The diff content as a string
   */
  async fetchPRDiff(prInfo: GitHubPRInfo): Promise<string> {
    const url = buildGitHubApiUrl(prInfo);

    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3.diff',
          'User-Agent': 'gh-diff-extractor/1.0.0',
        },
        timeout: 30000, // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError, prInfo);
      throw error; // This line won't be reached due to handleApiError throwing
    }
  }

  /**
   * Fetches the patch format for a pull request
   * @param prInfo The pull request information
   * @returns The patch content as a string
   */
  async fetchPRPatch(prInfo: GitHubPRInfo): Promise<string> {
    const url = buildGitHubApiUrl(prInfo);

    try {
      const response: AxiosResponse<string> = await axios.get(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3.patch',
          'User-Agent': 'gh-diff-extractor/1.0.0',
        },
        timeout: 30000, // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError, prInfo);
      throw error; // This line won't be reached due to handleApiError throwing
    }
  }

  /**
   * Validates the token by making a test API call
   * @returns True if the token is valid
   */
  async validateToken(): Promise<boolean> {
    try {
      await axios.get(`${this.baseURL}/user`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'User-Agent': 'gh-diff-extractor/1.0.0',
        },
        timeout: 10000, // 10 seconds timeout
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handles API errors and throws appropriate error messages
   * @param error The axios error
   * @param prInfo The pull request information for context
   */
  private handleApiError(error: AxiosError, prInfo: GitHubPRInfo): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as GitHubErrorResponse;

      switch (status) {
        case 401:
          throw new Error(
            'Authentication failed. Please check your GitHub token. ' +
            'Make sure it has the necessary permissions to access the repository.'
          );
        case 403:
          throw new Error(
            'Access forbidden. This could be due to:\n' +
            '- Insufficient token permissions\n' +
            '- Rate limiting\n' +
            '- Repository access restrictions'
          );
        case 404:
          throw new Error(
            `Pull request not found: ${prInfo.owner}/${prInfo.repo}#${prInfo.prNumber}\n` +
            'Please check that:\n' +
            '- The repository exists\n' +
            '- The pull request number is correct\n' +
            '- You have access to the repository'
          );
        case 422:
          throw new Error(
            `Invalid request: ${data.message || 'Unknown validation error'}`
          );
        default:
          throw new Error(
            `GitHub API error (${status}): ${data.message || 'Unknown error'}`
          );
      }
    } else if (error.request) {
      throw new Error(
        'Network error: Unable to reach GitHub API. Please check your internet connection.'
      );
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
}
