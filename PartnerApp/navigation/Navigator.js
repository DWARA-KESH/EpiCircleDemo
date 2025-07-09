import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import Dashboard from '../screens/Dashboard';
import PickupDetails from '../screens/PickupDetails';

import { PartnerContext } from '../context/PartnerContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isVerified, loading } = useContext(PartnerContext);

  // Show loader while reading session from storage
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Debugging session state (optional)
  console.log('Navigator:', { isVerified, loading });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fadcd9', // Rose Quartz
          },
          headerTintColor: '#3a2e2e', // Icon & back button color
          headerTitleStyle: {
            fontWeight: 'normal',
            fontSize: 20,
            color: '#3a2e2e', // Title color
          },
          contentStyle: {
            backgroundColor: '#f9f1f0', // Light Cream Pink screen background
          },
        }}
      >
        {isVerified ? (
          //  Verified partner: show dashboard flow
          <>
            <Stack.Screen
              name="Dashboard"
              component={Dashboard}
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="PickupDetails"
              component={PickupDetails}
              options={{
                title: 'Pickup Details',
              }}
            />
          </>
        ) : (
          //  Not verified: show login + OTP screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: 'Login',
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="OTP"
              component={OTPScreen}
              options={{
                title: 'Verify',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
