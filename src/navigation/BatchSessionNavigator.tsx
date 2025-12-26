import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MachineScreen from '../screens/MachineScreen';
import ProcessScreen from '../screens/ProcessScreen';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

export default function BatchSessionNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: colors.primary },
        tabBarStyle: { backgroundColor: colors.cardWhite, paddingTop: 0 },
        tabBarLabelStyle: { fontWeight: '700' },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Machine" component={MachineScreen} />
      <Tab.Screen name="Process" component={ProcessScreen} />
    </Tab.Navigator>
  );
}
