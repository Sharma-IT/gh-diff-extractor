import { GitHubPRInfo } from '../types';

/**
 * Parses a GitHub pull request URL and extracts the owner, repo, and PR number
 * 
 * Supports various GitHub URL formats:
 * - https://github.com/owner/repo/pull/123
 * - https://github.com/owner/repo/pull/123/files
 * - https://github.com/owner/repo/pull/123/commits
 * - https://github.com/owner/repo/pull/123/checks
 * - github.com/owner/repo/pull/123 (without protocol)
 * 
 * @param url The GitHub pull request URL
 * @returns The parsed GitHub PR information
 * @throws Error if the URL is invalid or not a GitHub PR URL
 */
export function parseGitHubPRUrl(url: string): GitHubPRInfo {
  if (!url || typeof url !== 'string') {
    throw new Error('URL must be a non-empty string');
  }

  // Normalize the URL by adding protocol if missing
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Check if it's a GitHub URL
  if (parsedUrl.hostname !== 'github.com') {
    throw new Error(`URL must be from github.com, got: ${parsedUrl.hostname}`);
  }

  // Parse the pathname to extract owner, repo, and PR number
  // Expected format: /owner/repo/pull/123[/files|/commits|/checks]
  const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);

  if (pathParts.length < 4) {
    throw new Error(`Invalid GitHub PR URL format. Expected: github.com/owner/repo/pull/123, got: ${url}`);
  }

  const [owner, repo, pullKeyword, prNumberStr] = pathParts;

  if (pullKeyword !== 'pull') {
    throw new Error(`URL must be a pull request URL (contain '/pull/'), got: ${url}`);
  }

  const prNumber = parseInt(prNumberStr, 10);
  if (isNaN(prNumber) || prNumber <= 0) {
    throw new Error(`Invalid pull request number: ${prNumberStr}`);
  }

  // Validate owner and repo names (basic GitHub naming rules)
  if (!isValidGitHubName(owner)) {
    throw new Error(`Invalid owner name: ${owner}`);
  }

  if (!isValidGitHubName(repo)) {
    throw new Error(`Invalid repository name: ${repo}`);
  }

  return {
    owner,
    repo,
    prNumber,
  };
}

/**
 * Validates a GitHub username or repository name
 * GitHub names can contain alphanumeric characters and hyphens,
 * but cannot start or end with a hyphen
 */
function isValidGitHubName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }

  // GitHub names can be up to 39 characters long
  if (name.length > 39) {
    return false;
  }

  // Must contain only alphanumeric characters and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(name)) {
    return false;
  }

  // Cannot start or end with a hyphen
  if (name.startsWith('-') || name.endsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Constructs the GitHub API URL for fetching a pull request diff
 */
export function buildGitHubApiUrl(prInfo: GitHubPRInfo): string {
  return `https://api.github.com/repos/${prInfo.owner}/${prInfo.repo}/pulls/${prInfo.prNumber}`;
}
