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
      <Stack.Navigator initialRouteName={isVerified ? 'Dashboard' : 'Login'} screenOptions={{
         headerStyle: { backgroundColor: '#fadcd9' }, // Rose Quartz
         headerTintColor: '#3a2e2e', // deep brown
         headerTitleAlign: 'center',
         headerShadowVisible: false,
      }}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerBackVisible: false, gestureEnabled: false ,
            title: '',
            headerShadowVisible: false}}
        />
        <Stack.Screen name="OTP" component={OTPScreen} options={{title: 'Verify', headerShadowVisible: false}}/>
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="SchedulePickup" component={SchedulePickup} options={{title: ''}}/>
        <Stack.Screen name="OrderHistory" component={OrderHistory} options={{title: ''}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
