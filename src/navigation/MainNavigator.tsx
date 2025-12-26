import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Monitor, Activity, BarChart3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MachineScreen from '../screens/MachineScreen';
import ProcessScreen from '../screens/ProcessScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  const tabBarStyle = {
    backgroundColor: colors.cardWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8 + insets.bottom,
    height: 65 + insets.bottom,
    paddingHorizontal: 12,
  } as const;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Machine"
        component={MachineScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Monitor size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Process"
        component={ProcessScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 
