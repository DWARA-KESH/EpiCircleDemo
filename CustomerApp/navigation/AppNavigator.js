import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import Dashboard from '../screens/Dashboard';
import SchedulePickup from '../screens/SchedulePickup';
import OrderHistory from '../screens/OrderHistory';
import { UserContext } from '../context/UserContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ isVerified }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isVerified ? 'Dashboard' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="SchedulePickup" component={SchedulePickup} />
        <Stack.Screen name="OrderHistory" component={OrderHistory} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
