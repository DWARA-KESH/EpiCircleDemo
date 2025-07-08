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
  const { partnerPhone, loading } = useContext(PartnerContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {partnerPhone ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="PickupDetails" component={PickupDetails} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
