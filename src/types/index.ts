/**
 * Represents the parsed components of a GitHub pull request URL
 */
export interface GitHubPRInfo {
  /** The owner/organization name */
  owner: string;
  /** The repository name */
  repo: string;
  /** The pull request number */
  prNumber: number;
}

/**
 * Represents the options for fetching a diff
 */
export interface DiffOptions {
  /** The GitHub personal access token for authentication */
  token?: string;
  /** Whether to output the diff to a file */
  outputFile?: string;
  /** Whether to show verbose output */
  verbose?: boolean;
}

/**
 * Represents the error response from the GitHub API
 */
export interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}
