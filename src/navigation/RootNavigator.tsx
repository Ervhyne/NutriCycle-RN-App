import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MachineLobbyScreen from '../screens/MachineLobbyScreen';
import AddMachineScreen from '../screens/AddMachineScreen';
import NewBatchScreen from '../screens/NewBatchScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BatchSessionScreen from '../screens/BatchSessionScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Lobby"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Lobby" component={MachineLobbyScreen} />
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
