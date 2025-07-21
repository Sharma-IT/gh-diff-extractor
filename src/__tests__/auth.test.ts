import { getToken, validateToken } from '../lib/auth';

describe('Authentication', () => {
  const originalEnv = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    // Clear environment variable
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.GITHUB_TOKEN = originalEnv;
    } else {
      delete process.env.GITHUB_TOKEN;
    }
  });

  describe('getToken', () => {
    it('should return explicitly provided token', () => {
      const explicitToken = 'explicit-token';
      expect(getToken(explicitToken)).toBe(explicitToken);
    });

    it('should return token from environment variable', () => {
      const envToken = 'env-token';
      process.env.GITHUB_TOKEN = envToken;
      expect(getToken()).toBe(envToken);
    });

    it('should prioritize explicit token over env', () => {
      const explicitToken = 'explicit-token';
      const envToken = 'env-token';

      process.env.GITHUB_TOKEN = envToken;

      expect(getToken(explicitToken)).toBe(explicitToken);
    });
  });
  
  describe('validateToken', () => {
    it('should return the token if it is valid', () => {
      const token = 'valid-token';
      expect(validateToken(token)).toBe(token);
    });
    
    it('should throw an error if token is undefined', () => {
      expect(() => validateToken(undefined)).toThrow('GitHub token not found');
    });
    
    it('should throw an error if token is empty string', () => {
      expect(() => validateToken('')).toThrow('GitHub token not found');
    });
  });
});
