import { getApiBaseUrl, fetchWithAuth } from '../../src/config/api';
import * as firebaseConfig from '../../src/config/firebase';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  describe('getApiBaseUrl', () => {
    it('should return API base URL from environment variable', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      const url = await getApiBaseUrl();
      expect(url).toBe('https://api.example.com');
    });

    it('should trim trailing slashes from URL', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com/';
      const url = await getApiBaseUrl();
      expect(url).toBe('https://api.example.com');
    });

    it('should return empty string if no URL is configured', async () => {
      const url = await getApiBaseUrl();
      expect(url).toBe('');
    });

    it('should handle URL trimming with whitespace', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = '  https://api.example.com/  ';
      const url = await getApiBaseUrl();
      expect(url).toBe('https://api.example.com');
    });
  });

  describe('fetchWithAuth', () => {
    it('should throw error if base URL is not configured', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = '';
      
      await expect(fetchWithAuth('/test')).rejects.toThrow(
        'API base URL not configured'
      );
    });

    it('should make request with authorization header', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      
      // Mock successful response
      const mockResponse = {
        ok: true,
      } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Mock auth user
      (firebaseConfig.auth as any).currentUser = {
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      await fetchWithAuth('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include ngrok-skip-browser-warning header', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      
      const mockResponse = { ok: true } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await fetchWithAuth('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'ngrok-skip-browser-warning': 'true',
          }),
        })
      );
    });

    it('should throw error on failed response', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: jest.fn().mockResolvedValue('Resource not found'),
      } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(fetchWithAuth('/test')).rejects.toThrow(
        'API request failed'
      );
    });

    it('should properly format path with leading slash', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
      
      const mockResponse = { ok: true } as any;
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await fetchWithAuth('test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.any(Object)
      );
    });
  });
});
