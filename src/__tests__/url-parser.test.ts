import { parseGitHubPRUrl, buildGitHubApiUrl } from '../lib/url-parser';
import { GitHubPRInfo } from '../types';

describe('URL Parser', () => {
  describe('parseGitHubPRUrl', () => {
    it('should parse a valid GitHub PR URL with https protocol', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const expected: GitHubPRInfo = {
        owner: 'owner',
        repo: 'repo',
        prNumber: 123,
      };

      expect(parseGitHubPRUrl(url)).toEqual(expected);
    });

    it('should parse a valid GitHub PR URL without protocol', () => {
      const url = 'github.com/owner/repo/pull/123';
      const expected: GitHubPRInfo = {
        owner: 'owner',
        repo: 'repo',
        prNumber: 123,
      };

      expect(parseGitHubPRUrl(url)).toEqual(expected);
    });

    it('should parse a valid GitHub PR URL with /files suffix', () => {
      const url = 'https://github.com/owner/repo/pull/123/files';
      const expected: GitHubPRInfo = {
        owner: 'owner',
        repo: 'repo',
        prNumber: 123,
      };

      expect(parseGitHubPRUrl(url)).toEqual(expected);
    });

    it('should parse a valid GitHub PR URL with /commits suffix', () => {
      const url = 'https://github.com/owner/repo/pull/123/commits';
      const expected: GitHubPRInfo = {
        owner: 'owner',
        repo: 'repo',
        prNumber: 123,
      };

      expect(parseGitHubPRUrl(url)).toEqual(expected);
    });

    it('should throw an error for non-GitHub URLs', () => {
      const url = 'https://gitlab.com/owner/repo/pull/123';
      expect(() => parseGitHubPRUrl(url)).toThrow('URL must be from github.com');
    });

    it('should throw an error for invalid URL format', () => {
      const url = 'not a url';
      expect(() => parseGitHubPRUrl(url)).toThrow('Invalid URL format');
    });

    it('should throw an error for non-PR GitHub URLs', () => {
      const url = 'https://github.com/owner/repo/issues/123';
      expect(() => parseGitHubPRUrl(url)).toThrow('URL must be a pull request URL');
    });

    it('should throw an error for invalid PR number', () => {
      const url = 'https://github.com/owner/repo/pull/abc';
      expect(() => parseGitHubPRUrl(url)).toThrow('Invalid pull request number');
    });

    it('should throw an error for invalid owner name', () => {
      const url = 'https://github.com/invalid-owner-/repo/pull/123';
      expect(() => parseGitHubPRUrl(url)).toThrow('Invalid owner name');
    });

    it('should throw an error for invalid repo name', () => {
      const url = 'https://github.com/owner/-invalid-repo/pull/123';
      expect(() => parseGitHubPRUrl(url)).toThrow('Invalid repository name');
    });
  });

  describe('buildGitHubApiUrl', () => {
    it('should build the correct GitHub API URL', () => {
      const prInfo: GitHubPRInfo = {
        owner: 'owner',
        repo: 'repo',
        prNumber: 123,
      };
      const expected = 'https://api.github.com/repos/owner/repo/pulls/123';

      expect(buildGitHubApiUrl(prInfo)).toEqual(expected);
    });
  });
});
