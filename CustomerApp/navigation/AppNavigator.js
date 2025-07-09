// AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screen components
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import Dashboard from '../screens/Dashboard';
import SchedulePickup from '../screens/SchedulePickup';
import OrderHistory from '../screens/OrderHistory';

// Import UserContext if needed for future dynamic logic
import { UserContext } from '../context/UserContext';

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

/**
 * AppNavigator sets up navigation between screens using React Navigation.
 * It chooses the initial screen based on verification status.
 *
 * Props:
 * - isVerified: boolean indicating if the user has completed OTP verification
 */
export default function AppNavigator({ isVerified }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isVerified ? 'Dashboard' : 'Login'}
        screenOptions={{
          headerStyle: { backgroundColor: '#fadcd9' }, // Rose Quartz background
          headerTintColor: '#3a2e2e', // Deep brown text/icons
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      >
        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: '',
            headerBackVisible: false,
            gestureEnabled: false,
            headerShadowVisible: false,
          }}
        />

        {/* OTP Verification Screen */}
        <Stack.Screen
          name="OTP"
          component={OTPScreen}
          options={{
            title: 'Verify',
            headerShadowVisible: false,
          }}
        />

        {/* Main Dashboard after login */}
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />

        {/* Schedule Pickup Page */}
        <Stack.Screen
          name="SchedulePickup"
          component={SchedulePickup}
          options={{
            title: '',
          }}
        />

        {/* Order History Page */}
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{
            title: '',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
