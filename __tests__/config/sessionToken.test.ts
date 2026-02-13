import { fetchWithAuth } from '../../src/config/api';
import { auth, db } from '../../src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('Session Token Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Token Retrieval', () => {
    it('should retrieve ID token from current user', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('mock-token-abc123');
      (auth as any).currentUser = {
        uid: 'user-123',
        email: 'test@example.com',
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await fetchWithAuth('/test-endpoint');

      expect(mockGetIdToken).toHaveBeenCalledWith(true);
    });

    it('should force refresh token when retrieving', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('refreshed-token-xyz789');
      (auth as any).currentUser = {
        uid: 'user-456',
        email: 'user@example.com',
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await fetchWithAuth('/data');

      // Verify token was force refreshed (parameter true)
      expect(mockGetIdToken).toHaveBeenCalledWith(true);
      expect(mockGetIdToken).toHaveBeenCalledTimes(1);
    });

    it('should handle case when no user is logged in', async () => {
      (auth as any).currentUser = null;

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await fetchWithAuth('/public-endpoint');

      // Should make request without Authorization header
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/public-endpoint',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Token Usage in API Calls', () => {
    it('should include Bearer token in Authorization header', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const mockGetIdToken = jest.fn().mockResolvedValue(mockToken);
      
      (auth as any).currentUser = {
        uid: 'user-789',
        email: 'auth@example.com',
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await fetchWithAuth('/authenticated-endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/authenticated-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should include Content-Type header', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('token-123');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchWithAuth('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include ngrok-skip-browser-warning header', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('token-456');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchWithAuth('/endpoint');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'ngrok-skip-browser-warning': 'true',
          }),
        })
      );
    });

    it('should merge custom headers with default headers', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('token-789');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchWithAuth('/endpoint', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Authorization: 'Bearer token-789',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('Token Expiration and Refresh', () => {
    it('should get fresh token on each API call', async () => {
      const mockGetIdToken = jest.fn()
        .mockResolvedValueOnce('token-v1')
        .mockResolvedValueOnce('token-v2')
        .mockResolvedValueOnce('token-v3');

      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Make three API calls
      await fetchWithAuth('/call1');
      await fetchWithAuth('/call2');
      await fetchWithAuth('/call3');

      // Verify token was retrieved fresh each time
      expect(mockGetIdToken).toHaveBeenCalledTimes(3);
      
      // Verify each call used the corresponding token
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-v1',
          }),
        })
      );

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-v2',
          }),
        })
      );

      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-v3',
          }),
        })
      );
    });

    it('should always use force refresh flag', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('fresh-token');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchWithAuth('/test');

      // Verify getIdToken was called with force refresh = true
      expect(mockGetIdToken).toHaveBeenCalledWith(true);
    });
  });

  describe('Error Handling with Tokens', () => {
    it('should throw error when token retrieval fails', async () => {
      const mockGetIdToken = jest.fn().mockRejectedValue(
        new Error('Token expired')
      );
      
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      await expect(fetchWithAuth('/test')).rejects.toThrow('Token expired');
    });

    it('should handle 401 unauthorized response', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('invalid-token');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Invalid token'),
      });

      await expect(fetchWithAuth('/protected')).rejects.toThrow(/401.*Unauthorized/);
    });

    it('should handle 403 forbidden response', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('valid-token');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve('Access denied'),
      });

      await expect(fetchWithAuth('/admin')).rejects.toThrow(/403.*Forbidden/);
    });
  });

  describe('API Base URL Configuration', () => {
    it('should throw error when API base URL is not configured', async () => {
      (auth as any).currentUser = {
        getIdToken: jest.fn().mockResolvedValue('token-123'),
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      // Clear environment variable
      const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
      delete process.env.EXPO_PUBLIC_API_BASE_URL;

      await expect(fetchWithAuth('/test')).rejects.toThrow(
        'API base URL not configured'
      );

      // Restore environment variable
      if (originalEnv !== undefined) {
        process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
      }
    });

    it('should use configured URL from Firestore', async () => {
      const mockGetIdToken = jest.fn().mockResolvedValue('token-abc');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://prod-api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await fetchWithAuth('/machines');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://prod-api.example.com/machines',
        expect.any(Object)
      );
    });
  });

  describe('Request Methods with Token', () => {
    beforeEach(() => {
      const mockGetIdToken = jest.fn().mockResolvedValue('test-token');
      (auth as any).currentUser = {
        getIdToken: mockGetIdToken,
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({ url: 'https://api.example.com' }),
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    it('should include token in GET request', async () => {
      await fetchWithAuth('/data', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in POST request', async () => {
      await fetchWithAuth('/data', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in PUT request', async () => {
      await fetchWithAuth('/data/123', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should include token in DELETE request', async () => {
      await fetchWithAuth('/data/123', { method: 'DELETE' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
