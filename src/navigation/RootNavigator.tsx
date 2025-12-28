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
import MachineLobbyScreen from '../screens/MachineLobbyScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import AddMachineScreen from '../screens/AddMachineScreen';
import NewBatchScreen from '../screens/NewBatchScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BatchSessionScreen from '../screens/BatchSessionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import BottomNavigation from '../components/BottomNavigation';
import SplashScreen from '../components/SplashScreen';
import { navigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>(navigationRef.current?.getCurrentRoute()?.name);
  const [navigationReady, setNavigationReady] = React.useState(false);
  const [minSplashDone, setMinSplashDone] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMinSplashDone(true), 900); // ensure splash shows briefly
    return () => clearTimeout(t);
  }, []);

  const onReady = () => {
    setNavigationReady(true);
    setCurrentRoute(navigationRef.current?.getCurrentRoute()?.name);
  };

  const showSplash = !(navigationReady && minSplashDone);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onStateChange={() => {
        const name = navigationRef.current?.getCurrentRoute()?.name;
        setCurrentRoute(name);
      }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Machines" component={MachineLobbyScreen} />
        <Stack.Screen name="Lobby" component={MachineLobbyScreen} />
        <Stack.Screen 
          name="AddMachine" 
          component={AddMachineScreen}
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
        <Stack.Screen 
          name="NewBatch" 
          component={NewBatchScreen}
          options={{
            presentation: 'modal',
            animation: 'fade',
          }}
        />
        <Stack.Screen name="BatchSession" component={BatchSessionScreen} />
        <Stack.Screen name="Summary" component={require('../screens/SummaryScreen').default} />
      </Stack.Navigator>

      {/* Render BottomNavigation once at the root so it doesn't animate with stack screen transitions */}
      {!showSplash && currentRoute && ['Lobby','Machines','Reports','History','Settings'].includes(currentRoute) && (
        <BottomNavigation
          selectedTab={(() => {
            const reverseMap: Record<string, string> = {
              Lobby: 'Machines',
              Machines: 'Machines',
              Reports: 'Reports',
              History: 'History',
              Settings: 'Settings',
            };
            return (currentRoute && reverseMap[currentRoute]) || 'Machines';
          })()}
          onTabPress={(tabKey) => {
            const routeMap: Record<string, string> = {
              Machines: 'Lobby',
              Reports: 'Reports',
              History: 'History',
              Settings: 'Settings',
            };
            const target = routeMap[tabKey] || tabKey;
            try { navigationRef.current?.navigate(target as any); } catch (e) { console.warn(`Navigation target '${target}' may not exist.`); }
          }}
        />
      )}

      {/* Splash overlay while navigation initializes */}
      {/* Splash overlay while navigation initializes. Keep mounted until fade finishes. */}
      <SplashScreen visible={showSplash} />
    </NavigationContainer>
  );
}
