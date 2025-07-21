# gh-diff-extractor

A CLI tool to extract git diffs from GitHub pull request files pages, supporting private repositories.

## Features

- 🔗 Extract diffs from GitHub PR URLs (including `/files` pages)
- 🔐 Support for private repositories with authentication
- 📄 Multiple output formats (diff and patch)
- 🎨 Colorised terminal output
- 📊 Diff statistics
- 💾 Save to file or output to stdout
- ⚙️ Flexible authentication (environment variables, config file, or CLI option)

## Installation

### Global Installation

```bash
npm install -g gh-diff-extractor
```

### Local Installation

```bash
npm install gh-diff-extractor
```

## Authentication

To access private repositories, you need a GitHub Personal Access Token. The tool supports multiple ways to provide authentication:

### 1. Environment Variable (Recommended)

```bash
export GITHUB_TOKEN=your_github_token_here
```

### 2. Configuration File

```bash
gh-diff-extractor config --token your_github_token_here
```

### 3. Command Line Option

```bash
gh-diff-extractor --token your_github_token_here <url>
```

### Creating a GitHub Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select the following scopes:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)
4. Copy the generated token

## Usage

### Basic Usage

```bash
# Extract diff from a public PR
gh-diff-extractor https://github.com/owner/repo/pull/123

# Extract diff from a private PR (requires authentication)
gh-diff-extractor https://github.com/owner/repo/pull/123/files

# Get patch format instead of diff
gh-diff-extractor --patch https://github.com/owner/repo/pull/123

# Save to file
gh-diff-extractor --output pr-123.diff https://github.com/owner/repo/pull/123

# Show statistics
gh-diff-extractor --stats https://github.com/owner/repo/pull/123

# Disable colours
gh-diff-extractor --no-color https://github.com/owner/repo/pull/123
```

### Supported URL Formats

The tool accepts various GitHub PR URL formats:

- `https://github.com/owner/repo/pull/123`
- `https://github.com/owner/repo/pull/123/files`
- `https://github.com/owner/repo/pull/123/commits`
- `github.com/owner/repo/pull/123` (protocol will be added automatically)

### Command Options

```
Usage: gh-diff-extractor [options] <url>

Arguments:
  url                          GitHub pull request URL

Options:
  -V, --version               output the version number
  -t, --token <token>         GitHub personal access token
  -o, --output <file>         Output file path (if not specified, prints to stdout)
  -p, --patch                 Get patch format instead of diff format
  -v, --verbose               Show verbose output
  --no-color                  Disable coloured output
  --stats                     Show diff statistics
  -h, --help                  display help for command
```

### Configuration Commands

```bash
# Set GitHub token
gh-diff-extractor config --token your_github_token_here

# Validate token
gh-diff-extractor validate

# Validate specific token
gh-diff-extractor validate --token your_github_token_here
```

## Examples

### Extract diff with statistics

```bash
gh-diff-extractor --stats https://github.com/facebook/react/pull/25123
```

Output:
```
Files changed: 3, Insertions: 45, Deletions: 12
diff --git a/packages/react/src/React.js b/packages/react/src/React.js
index 1234567..abcdefg 100644
--- a/packages/react/src/React.js
+++ b/packages/react/src/React.js
...
```

### Save diff to file

```bash
gh-diff-extractor --output react-pr-25123.diff https://github.com/facebook/react/pull/25123
```

### Get patch format

```bash
gh-diff-extractor --patch https://github.com/facebook/react/pull/25123
```

## Error Handling

The tool provides clear error messages for common issues:

- **Invalid URL**: Clear message about expected URL format
- **Authentication failure**: Instructions on how to set up authentication
- **Repository not found**: Verification steps for repository access
- **Network issues**: Guidance on connectivity problems

## Development

### Setup

```bash
git clone https://github.com/Sharma-IT/gh-diff-extractor.git
cd gh-diff-extractor
npm install
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev -- https://github.com/owner/repo/pull/123
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Sharma-IT/gh-diff-extractor/issues) page
2. Create a new issue with detailed information about the problem
3. Include the command you ran and the error message

## Changelog

### v1.0.0

- Initial release
- Support for GitHub PR diff extraction
- Authentication via tokens
- Multiple output formats
- Colorised terminal output
- Comprehensive error handling
