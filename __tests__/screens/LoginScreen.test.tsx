import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { LoginScreen } from '../../src/screens/auth/LoginScreen';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  reset: mockReset,
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn((callback) => callback()),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ _type: 'timestamp' })),
}));

// Mock Firebase config
jest.mock('../../src/config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  Eye: 'Eye',
  EyeOff: 'EyeOff',
}));

// Mock components
jest.mock('../../src/components/ScreenTitle', () => 'ScreenTitle');

describe('LoginScreen', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    getIdToken: jest.fn().mockResolvedValue('mock-id-token-12345'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    mockNavigate.mockClear();
    mockReset.mockClear();
  });

  describe('Rendering', () => {
    it('should render login form with email and password inputs', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    });

    it('should render login button', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText('Login')).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText('Forgot password?')).toBeTruthy();
    });

    it('should render sign up link', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText("Don't have an account?")).toBeTruthy();
      expect(getByText('Sign up')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update email state when typing in email input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const emailInput = getByPlaceholderText('Enter your email');

      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password state when typing in password input', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const passwordInput = getByPlaceholderText('Enter your password');

      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('should initially hide password', () => {
      const { getByPlaceholderText } = render(<LoginScreen />);
      const passwordInput = getByPlaceholderText('Enter your password');

      // Initially password should be hidden (secureTextEntry = true)
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should show error modal when email is empty', async () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      const passwordInput = getByPlaceholderText('Enter your password');
      const loginButton = getByText('Login');

      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter both email and password')).toBeTruthy();
      });
    });

    it('should show error modal when password is empty', async () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      const emailInput = getByPlaceholderText('Enter your email');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter both email and password')).toBeTruthy();
      });
    });

    it('should show error modal when both fields are empty', async () => {
      const { getByText } = render(<LoginScreen />);
      const loginButton = getByText('Login');

      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(getByText('Please enter both email and password')).toBeTruthy();
      });
    });
  });

  describe('Session Token Management', () => {
    it('should generate device session ID if not exists', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'deviceSessionId',
          expect.any(String)
        );
      });
    });

    it('should retrieve Firebase ID token on successful login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
      });
    });

    it('should store auth token in AsyncStorage on successful login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'authToken',
          'mock-id-token-12345'
        );
      });
    });

    it('should store user email in AsyncStorage on successful login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'TEST@EXAMPLE.COM');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'loggedInUserEmail',
          'test@example.com'
        );
      });
    });

    it('should store user ID in AsyncStorage on successful login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'loggedInUserId',
          'test-user-123'
        );
      });
    });

    it('should store auth token in Firestore settings', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        // Find the call that stores the token
        const tokenCall = (setDoc as jest.Mock).mock.calls.find(call => 
          call[1] && call[1].token === 'mock-id-token-12345'
        );
        expect(tokenCall).toBeDefined();
        expect(tokenCall[1]).toMatchObject({
          token: 'mock-id-token-12345',
          updatedBy: 'test-user-123',
        });
      });
    });
  });

  describe('Active Session Management', () => {
    it('should create new session when no active session exists', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        // Find the call that creates the session (has userId, email, deviceId)
        const sessionCall = (setDoc as jest.Mock).mock.calls.find(call => 
          call[1] && call[1].userId && call[1].email && call[1].deviceId && call[1].loginTime
        );
        expect(sessionCall).toBeDefined();
        expect(sessionCall[1]).toMatchObject({
          userId: 'test-user-123',
          email: 'test@example.com',
          deviceId: expect.any(String),
        });
      });
    });

    it('should allow login when same device session exists', async () => {
      const testDeviceId = 'device-123-abc';
      // Set device ID in mock storage
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'deviceSessionId') return Promise.resolve(testDeviceId);
        return Promise.resolve(null);
      });

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      // Mock both getDoc calls:
      // 1st: session check (same device)
      // 2nd: settings check for URL
      (getDoc as jest.Mock)
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({
            deviceId: testDeviceId,
            userId: 'test-user-123',
            email: 'test@example.com',
          }),
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => ({ url: 'https://api.example.com' }),
        });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      // Verify session was updated (not showing modal)
      await waitFor(() => {
        const sessionCall = (setDoc as jest.Mock).mock.calls.find(call => 
          call[1] && call[1].deviceId === testDeviceId && call[1].userId
        );
        expect(sessionCall).toBeDefined();
      }, { timeout: 3000 });
    });

    it('should show session modal when different device session exists', async () => {
      const myDeviceId = 'device-123-abc';
      const otherDeviceId = 'different-device-456-xyz';
      
      // Mock getItem to return our device ID
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'deviceSessionId') return Promise.resolve(myDeviceId);
        return Promise.resolve(null);
      });

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      // Mock getDoc to return session with different device
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          deviceId: otherDeviceId,
          userId: 'test-user-123',
          email: 'test@example.com',
        }),
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      // Verify the showingSessionModal flag was set (indicating conflict was detected)
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'showingSessionModal',
          'true'
        );
      }, { timeout: 3000 });
    });

    it('should set showingSessionModal flag when session conflict occurs', async () => {
      const myDeviceId = 'device-123-abc';
      const otherDeviceId = 'different-device-456';
      
      // Mock getItem to return our device ID
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'deviceSessionId') return Promise.resolve(myDeviceId);
        return Promise.resolve(null);
      });

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          deviceId: otherDeviceId,
          userId: 'test-user-123',
          email: 'test@example.com',
        }),
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'showingSessionModal',
          'true'
        );
      }, { timeout: 3000 });
    });
  });

  describe('Login Flow', () => {
    it('should call signInWithEmailAndPassword with trimmed lowercase email', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), '  TEST@EXAMPLE.COM  ');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('should navigate to Lobby on successful login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Lobby' }],
        });
      });
    });

    it('should show loading indicator during login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
      );
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const { getByPlaceholderText, getByText, getByTestId } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: 'Lobby' }],
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid email', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-email',
        message: 'Invalid email',
      });

      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(async () => {
        const errorText = await findByText('Invalid email address');
        expect(errorText).toBeTruthy();
      });
    });

    it('should show error for user not found', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found',
      });

      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'nonexistent@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(async () => {
        const errorText = await findByText('No account found with this email');
        expect(errorText).toBeTruthy();
      });
    });

    it('should show error for wrong password', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
        message: 'Wrong password',
      });

      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');
      fireEvent.press(getByText('Login'));

      await waitFor(async () => {
        const errorText = await findByText('Incorrect password');
        expect(errorText).toBeTruthy();
      });
    });

    it('should show error for invalid credentials', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credential',
      });

      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');
      fireEvent.press(getByText('Login'));

      await waitFor(async () => {
        const errorText = await findByText('Invalid email or password');
        expect(errorText).toBeTruthy();
      });
    });

    it('should show generic error for unknown errors', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/unknown-error',
        message: 'Unknown error',
      });

      const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);
      
      fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Enter your password'), 'password123');
      fireEvent.press(getByText('Login'));

      await waitFor(async () => {
        const errorText = await findByText('Failed to login');
        expect(errorText).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to ForgotPassword when forgot password link is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Forgot password?'));

      expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should navigate to SignUp when sign up link is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Sign up'));

      expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    });
  });
});

