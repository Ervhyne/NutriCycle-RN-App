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
  Dashboard: undefined;
  Lobby: undefined;
  AddMachine: undefined;
  NewBatch: undefined;
  BatchSession: undefined;
  Summary: undefined;
};
