import Toast from 'react-native-toast-message';
import { colors } from '../theme/colors';

export const showNotification = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success'
) => {
  console.log('[Notification] Showing notification:', { title, message, type });
  
  Toast.show({
    type: type,
    position: 'top',
    text1: title,
    text2: message,
    visibilityTime: 5000,
    topOffset: 50,
    autoHide: true,
  });
};

// Send notification that persists across app states
export const sendPersistentNotification = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'success'
) => {
  console.log('[Persistent Notification] Sending:', { title, message, type });
  
  // Show in-app toast immediately
  showNotification(title, message, type);
};

export const showStageAdvancedNotification = (stageName: string) => {
  console.log('[Stage Notification] Stage advanced to:', stageName);
  sendPersistentNotification('Stage Advanced', `Now processing: ${stageName}`, 'success');
};

export const showProcessStartedNotification = () => {
  console.log('[Process Notification] Process started');
  sendPersistentNotification('Process Started', 'Your batch processing has begun', 'success');
};

export const showProcessCompletedNotification = () => {
  console.log('[Process Notification] Process completed');
  sendPersistentNotification('Process Completed', 'Your batch processing is complete!', 'success');
};

export const showErrorNotification = (message: string) => {
  console.log('[Error Notification]', message);
  sendPersistentNotification('Error', message, 'error');
};

// Test function to verify notifications are working
export const testNotification = () => {
  console.log('[TEST] Showing test notification');
  showNotification('Test Notification', 'If you see this, notifications are working!', 'success');
};
