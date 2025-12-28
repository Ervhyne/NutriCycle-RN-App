import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerificationCodeScreen } from '../screens/auth/VerificationCodeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { AboutNutriCycleScreen } from '../screens/AboutNutriCycleScreen';
import MachineLobbyScreen from '../screens/MachineLobbyScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { TermsAndConditionsScreen } from '../screens/TermsAndConditionsScreen';
import { PrivacyNoticeScreen } from '../screens/PrivacyNoticeScreen';
import AddMachineScreen from '../screens/AddMachineScreen';
import NewBatchScreen from '../screens/NewBatchScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BatchSessionScreen from '../screens/BatchSessionScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="AboutNutriCycle" component={AboutNutriCycleScreen} />
        <Stack.Screen name="Machines" component={MachineLobbyScreen} />
        <Stack.Screen name="Lobby" component={MachineLobbyScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
          <Stack.Screen name="PrivacyNotice" component={PrivacyNoticeScreen} />
        <Stack.Screen 
          name="AddMachine" 
          component={AddMachineScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="NewBatch" 
          component={NewBatchScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="BatchSession" component={BatchSessionScreen} />
        <Stack.Screen name="Summary" component={require('../screens/SummaryScreen').default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
