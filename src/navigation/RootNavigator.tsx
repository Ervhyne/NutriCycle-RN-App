import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MachineLobbyScreen from '../screens/MachineLobbyScreen';
import AddMachineScreen from '../screens/AddMachineScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Lobby" component={MachineLobbyScreen} />
        <Stack.Screen 
          name="AddMachine" 
          component={AddMachineScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
