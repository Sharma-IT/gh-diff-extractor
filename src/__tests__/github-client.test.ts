import { GitHubClient } from '../lib/github-client';
import axios from 'axios';
import { GitHubPRInfo } from '../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHub Client', () => {
  const mockToken = 'mock-token';
  const mockPrInfo: GitHubPRInfo = {
    owner: 'owner',
    repo: 'repo',
    prNumber: 123,
  };
  
  let client: GitHubClient;
  
  beforeEach(() => {
    jest.resetAllMocks();
    client = new GitHubClient(mockToken);
  });
  
  describe('fetchPRDiff', () => {
    it('should fetch diff with correct headers', async () => {
      const mockDiff = 'mock diff content';
      mockedAxios.get.mockResolvedValueOnce({ data: mockDiff });
      
      const result = await client.fetchPRDiff(mockPrInfo);
      
      expect(result).toBe(mockDiff);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/pulls/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `token ${mockToken}`,
            'Accept': 'application/vnd.github.v3.diff',
          }),
        })
      );
    });
    
    it('should handle 401 authentication error', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Bad credentials' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      
      await expect(client.fetchPRDiff(mockPrInfo)).rejects.toThrow('Authentication failed');
    });
    
    it('should handle 404 not found error', async () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      
      await expect(client.fetchPRDiff(mockPrInfo)).rejects.toThrow('Pull request not found');
    });
    
    it('should handle network error', async () => {
      const error = {
        request: {},
        message: 'Network Error',
      };
      mockedAxios.get.mockRejectedValueOnce(error);
      
      await expect(client.fetchPRDiff(mockPrInfo)).rejects.toThrow('Network error');
    });
  });
  
  describe('fetchPRPatch', () => {
    it('should fetch patch with correct headers', async () => {
      const mockPatch = 'mock patch content';
      mockedAxios.get.mockResolvedValueOnce({ data: mockPatch });
      
      const result = await client.fetchPRPatch(mockPrInfo);
      
      expect(result).toBe(mockPatch);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/pulls/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `token ${mockToken}`,
            'Accept': 'application/vnd.github.v3.patch',
          }),
        })
      );
    });
  });
  
  describe('validateToken', () => {
    it('should return true for valid token', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { login: 'user' } });
      
      const result = await client.validateToken();
      
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `token ${mockToken}`,
          }),
        })
      );
    });
    
    it('should return false for invalid token', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });
      
      const result = await client.validateToken();
      
      expect(result).toBe(false);
    });
  });
});
