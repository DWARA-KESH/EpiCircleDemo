import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import Dashboard from '../screens/Dashboard';
import PickupDetails from '../screens/PickupDetails';
import { PartnerContext } from '../context/PartnerContext';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isVerified, loading } = useContext(PartnerContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  console.log('Navigator:', { isVerified, loading });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fadcd9', // Rose Quartz
          },
          headerTintColor: '#3a2e2e', // Dark text for icons
          headerTitleStyle: {
            fontWeight: 'normal',
            fontSize: 20,
            color: '#3a2e2e', // Dark text for title
          },
          contentStyle: {
            backgroundColor: '#f9f1f0', // Light Cream Pink background for screens
          },
        }}
      >
        {isVerified ? (
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
                headerShown: true,
              }}
            />
          </>
        ) : (
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
