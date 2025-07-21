import { formatDiff, colorize, getDiffStats } from '../lib/diff-formatter';

describe('Diff Formatter', () => {
  describe('formatDiff', () => {
    it('should handle empty input', () => {
      expect(formatDiff('')).toBe('');
      expect(formatDiff(null as any)).toBe('');
      expect(formatDiff(undefined as any)).toBe('');
    });

    it('should normalize line endings', () => {
      const input = 'line1\r\nline2\rline3\nline4';
      const expected = 'line1\nline2\nline3\nline4\n';
      expect(formatDiff(input)).toBe(expected);
    });

    it('should ensure the diff ends with a newline', () => {
      const input = 'line1\nline2';
      const expected = 'line1\nline2\n';
      expect(formatDiff(input)).toBe(expected);
    });

    it('should preserve leading whitespace in diff lines', () => {
      const input = ' line with leading space\n+  added line with spaces\n-   removed line with spaces';
      const expected = ' line with leading space\n+  added line with spaces\n-   removed line with spaces\n';
      expect(formatDiff(input)).toBe(expected);
    });

    it('should trim trailing whitespace from non-diff content lines', () => {
      const input = 'header line  \ndiff --git a/file b/file  \n@@ -1,3 +1,3 @@  \n line  \n+added  \n-removed  ';
      const expected = 'header line\ndiff --git a/file b/file\n@@ -1,3 +1,3 @@\n line  \n+added  \n-removed  \n';
      expect(formatDiff(input)).toBe(expected);
    });
  });

  describe('colorize', () => {
    it('should add color codes to diff lines', () => {
      const input = 'diff --git a/file b/file\n@@ -1,3 +1,3 @@\n line\n+added\n-removed';
      const result = colorize(input);
      
      // Check that color codes were added
      expect(result).toContain('\x1b[');
      
      // Check that each line type has different color
      expect(result).toMatch(/\x1b\[36mdiff --git/); // cyan for diff header
      expect(result).toMatch(/\x1b\[90m@@ -1,3 \+1,3 @@/); // gray for hunk header
      expect(result).toMatch(/\x1b\[32m\+added/); // green for additions
      expect(result).toMatch(/\x1b\[31m-removed/); // red for deletions
    });
  });

  describe('getDiffStats', () => {
    it('should calculate correct statistics', () => {
      const input = `diff --git a/file1 b/file1
index 1234..5678 100644
--- a/file1
+++ b/file1
@@ -1,3 +1,4 @@
 unchanged
-removed
+added
+another added
 unchanged
diff --git a/file2 b/file2
index abcd..efgh 100644
--- a/file2
+++ b/file2
@@ -10,2 +10,1 @@
 unchanged
-removed line`;
      
      const stats = getDiffStats(input);
      expect(stats.filesChanged).toBe(2);
      expect(stats.insertions).toBe(2);
      expect(stats.deletions).toBe(2);
    });

    it('should handle empty diff', () => {
      const stats = getDiffStats('');
      expect(stats.filesChanged).toBe(0);
      expect(stats.insertions).toBe(0);
      expect(stats.deletions).toBe(0);
    });
  });
});
