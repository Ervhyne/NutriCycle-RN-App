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
import { ContactUsScreen } from '../screens/ContactUsScreen';
import AddMachineScreen from '../screens/AddMachineScreen';
import NewBatchScreen from '../screens/NewBatchScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BatchSessionScreen from '../screens/BatchSessionScreen';
import ReportsScreen from '../screens/ReportsScreen';
import BottomNavigation from '../components/BottomNavigation';
import SplashScreen from '../components/SplashScreen';
import { navigationRef } from './NavigationService';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>(navigationRef.current?.getCurrentRoute()?.name);
  const [navigationReady, setNavigationReady] = React.useState(false);
  const [minSplashDone, setMinSplashDone] = React.useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setMinSplashDone(true), 900); // ensure splash shows briefly
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const loadFlag = async () => {
      try {
        const value = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (e) {
        setHasSeenOnboarding(false);
      }
    };
    loadFlag();
  }, []);

  // Listen to auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      
      if (user?.email) {
        // Sync AsyncStorage with current auth state
        await AsyncStorage.setItem('loggedInUserEmail', user.email);
        await AsyncStorage.setItem('loggedInUserId', user.uid);
      }
    });

    return unsubscribe;
  }, []);

  // Monitor session validity - log out if session is invalidated by another device
  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const monitorSession = async () => {
      // Don't monitor if we're showing the session conflict modal
      const showingModal = await AsyncStorage.getItem('showingSessionModal');
      if (showingModal === 'true') {
        return;
      }
      
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userId = currentUser.uid;
      const deviceId = await AsyncStorage.getItem('deviceSessionId');

      // Listen to session document changes
      const sessionRef = doc(db, 'activeSessions', userId);
      unsubscribe = onSnapshot(
        sessionRef, 
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const sessionData = docSnapshot.data();
            
            // If the device ID doesn't match, this device's session was invalidated
            if (sessionData.deviceId && sessionData.deviceId !== deviceId) {
              try {
                await auth.signOut();
                await AsyncStorage.removeItem('loggedInUserEmail');
                await AsyncStorage.removeItem('loggedInUserId');
                navigationRef.current?.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } catch (error) {
                console.error('Error during forced logout:', error);
              }
            }
          }
          // Don't auto-logout if session doesn't exist - user might have just logged out normally
        },
        (error) => {
          console.error('Session monitoring error:', error);
          // Don't force logout on monitoring errors
        }
      );
    };

    if (isAuthenticated && navigationReady) {
      monitorSession();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, navigationReady]);

  const onReady = () => {
    setNavigationReady(true);
    setCurrentRoute(navigationRef.current?.getCurrentRoute()?.name);
  };

  const showSplash = hasSeenOnboarding === null || isAuthenticated === null || !minSplashDone;

  if (hasSeenOnboarding === null || isAuthenticated === null) {
    return <SplashScreen />;
  }

  // Determine initial route
  let initialRoute = 'Login';
  if (hasSeenOnboarding === false) {
    initialRoute = 'Onboarding';
  } else if (isAuthenticated) {
    initialRoute = 'Lobby';
  }

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
        initialRouteName={initialRoute}
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
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="AboutNutriCycle" component={AboutNutriCycleScreen} />
        <Stack.Screen name="Machines" component={MachineLobbyScreen} />
        <Stack.Screen name="Lobby" component={MachineLobbyScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
          <Stack.Screen name="PrivacyNotice" component={PrivacyNoticeScreen} />
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

      {showSplash && <SplashScreen />}

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
