/**
 * Formats a diff string for better readability
 * @param diff The raw diff content from GitHub API
 * @returns The formatted diff content
 */
export function formatDiff(diff: string): string {
  if (!diff || typeof diff !== 'string') {
    return '';
  }

  // The GitHub API already returns properly formatted diff content,
  // so we mainly need to ensure proper line endings and clean up any issues
  
  // Normalize line endings to Unix style
  let formatted = diff.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Ensure the diff ends with a newline
  if (!formatted.endsWith('\n')) {
    formatted += '\n';
  }
  
  // Remove any trailing whitespace from lines while preserving the diff format
  formatted = formatted
    .split('\n')
    .map(line => {
      // Don't trim lines that are part of the diff content (start with +, -, or space)
      if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) {
        return line;
      }
      // Trim other lines (headers, etc.)
      return line.trimEnd();
    })
    .join('\n');
  
  return formatted;
}

/**
 * Adds color to diff output for terminal display
 * @param diff The diff content
 * @returns The colorized diff content
 */
export function colorize(diff: string): string {
  // ANSI color codes
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
  };

  return diff
    .split('\n')
    .map(line => {
      if (line.startsWith('diff --git')) {
        return `${colors.cyan}${line}${colors.reset}`;
      } else if (line.startsWith('index ') || line.startsWith('@@')) {
        return `${colors.gray}${line}${colors.reset}`;
      } else if (line.startsWith('+++') || line.startsWith('---')) {
        return `${colors.yellow}${line}${colors.reset}`;
      } else if (line.startsWith('+')) {
        return `${colors.green}${line}${colors.reset}`;
      } else if (line.startsWith('-')) {
        return `${colors.red}${line}${colors.reset}`;
      } else {
        return line;
      }
    })
    .join('\n');
}

/**
 * Gets statistics about the diff
 * @param diff The diff content
 * @returns Statistics about the diff
 */
export function getDiffStats(diff: string): {
  filesChanged: number;
  insertions: number;
  deletions: number;
} {
  const lines = diff.split('\n');
  const files = new Set<string>();
  let insertions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      // Extract file path from "diff --git a/path b/path"
      const match = line.match(/diff --git a\/(.+) b\/(.+)/);
      if (match) {
        files.add(match[2]); // Use the "b/" path (new file path)
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      insertions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return {
    filesChanged: files.size,
    insertions,
    deletions,
  };
}
