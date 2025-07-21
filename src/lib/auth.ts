import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Configuration file path for storing GitHub token
 */
const CONFIG_DIR = path.join(os.homedir(), '.gh-diff-extractor');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Environment variable name for GitHub token
 */
const ENV_TOKEN_NAME = 'GITHUB_TOKEN';

/**
 * Interface for the configuration file
 */
interface Config {
  token?: string;
}

/**
 * Ensures the configuration directory exists
 */
function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * Reads the configuration file
 * @returns The configuration object or an empty object if the file doesn't exist
 */
export function readConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }
  return {};
}

/**
 * Saves the configuration to the config file
 * @param config The configuration object to save
 */
export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config file:', error);
    throw new Error(`Failed to save configuration: ${error}`);
  }
}

/**
 * Saves a GitHub token to the configuration file
 * @param token The GitHub token to save
 */
export function saveToken(token: string): void {
  const config = readConfig();
  config.token = token;
  saveConfig(config);
}

/**
 * Gets the GitHub token from various sources in order of precedence:
 * 1. Explicitly provided token parameter
 * 2. Environment variable (GITHUB_TOKEN)
 * 3. Configuration file
 * 
 * @param explicitToken Optional token provided directly
 * @returns The GitHub token or undefined if not found
 */
export function getToken(explicitToken?: string): string | undefined {
  // 1. Use explicitly provided token if available
  if (explicitToken) {
    return explicitToken;
  }

  // 2. Check environment variable
  const envToken = process.env[ENV_TOKEN_NAME];
  if (envToken) {
    return envToken;
  }

  // 3. Check configuration file
  const config = readConfig();
  return config.token;
}

/**
 * Validates if a token is present and throws an error if not
 * @param token The token to validate
 * @throws Error if the token is not provided
 */
export function validateToken(token?: string): string {
  if (!token) {
    throw new Error(
      `GitHub token not found. Please provide a token using one of these methods:
      1. Set the GITHUB_TOKEN environment variable
      2. Run 'gh-diff-extractor config --token YOUR_TOKEN' to save it in the config file
      3. Pass the token directly with the --token option`
    );
  }
  return token;
}
