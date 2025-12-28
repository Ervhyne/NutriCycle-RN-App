import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  VerificationCode: {
    email: string;
    verificationCode: string;
    purpose: 'reset' | 'signup';
    password?: string;
    confirmPassword?: string;
  };
  Onboarding: undefined;
  Dashboard: undefined;
  Lobby: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  History: undefined;
  AboutNutriCycle: undefined;
  ContactUs: undefined;
  AddMachine: undefined;
  NewBatch: undefined;
    TermsAndConditions: undefined;
    PrivacyNotice: undefined;
    BatchSession: undefined;
    Summary: undefined;
};
