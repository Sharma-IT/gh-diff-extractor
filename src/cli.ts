#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseGitHubPRUrl } from './lib/url-parser';
import { getToken, saveToken, validateToken } from './lib/auth';
import { GitHubClient } from './lib/github-client';
import { formatDiff, colorize, getDiffStats } from './lib/diff-formatter';

// Package info
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

const program = new Command();

program
  .name('gh-diff-extractor')
  .description('A CLI tool to extract git diffs from GitHub pull request files pages')
  .version(packageJson.version);

// Main command to fetch diff
program
  .argument('<url>', 'GitHub pull request URL (e.g., https://github.com/owner/repo/pull/123/files)')
  .option('-t, --token <token>', 'GitHub personal access token')
  .option('-o, --output <file>', 'Output file path (if not specified, prints to stdout)')
  .option('-p, --patch', 'Get patch format instead of diff format')
  .option('-v, --verbose', 'Show verbose output')
  .option('--no-color', 'Disable colored output')
  .option('--stats', 'Show diff statistics')
  .action(async (url, options) => {
    try {
      // Parse the GitHub PR URL
      const prInfo = parseGitHubPRUrl(url);
      
      // Get the token
      const token = validateToken(getToken(options.token));
      
      // Create GitHub client
      const client = new GitHubClient(token);
      
      if (options.verbose) {
        console.log(`Fetching ${options.patch ? 'patch' : 'diff'} for PR #${prInfo.prNumber} from ${prInfo.owner}/${prInfo.repo}`);
      }
      
      // Fetch the diff or patch
      const content = options.patch 
        ? await client.fetchPRPatch(prInfo)
        : await client.fetchPRDiff(prInfo);
      
      // Format the diff
      let formattedContent = formatDiff(content);

      // Show statistics if requested
      if (options.stats) {
        const stats = getDiffStats(formattedContent);
        console.log(`Files changed: ${stats.filesChanged}, Insertions: ${stats.insertions}, Deletions: ${stats.deletions}`);
      }

      // Apply colors if enabled and outputting to terminal
      if (!options.output && options.color !== false) {
        formattedContent = colorize(formattedContent);
      }

      // Output the diff
      if (options.output) {
        // Ensure the output directory exists
        const outputDir = path.dirname(options.output);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(options.output, formattedContent);
        console.log(`Diff saved to ${options.output}`);
      } else {
        console.log(formattedContent);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure GitHub token')
  .option('--token <token>', 'Set GitHub personal access token')
  .action((options) => {
    try {
      if (options.token) {
        saveToken(options.token);
        console.log('GitHub token saved successfully');
      } else {
        console.log('No configuration options provided. Use --token to set your GitHub token.');
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Validate token command
program
  .command('validate')
  .description('Validate GitHub token')
  .option('-t, --token <token>', 'GitHub personal access token to validate')
  .action(async (options) => {
    try {
      const token = getToken(options.token);
      
      if (!token) {
        console.error('No token found. Please provide a token using --token option or set it in the configuration.');
        process.exit(1);
      }
      
      const client = new GitHubClient(token);
      const isValid = await client.validateToken();
      
      if (isValid) {
        console.log('Token is valid and has the necessary permissions.');
      } else {
        console.error('Token validation failed. The token may be invalid or may not have the necessary permissions.');
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
