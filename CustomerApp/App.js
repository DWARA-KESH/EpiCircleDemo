import React, { useEffect, useState } from 'react';
import { UserProvider } from './context/UserContext';
import AppNavigator from './navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [initialPhone, setInitialPhone] = useState(null); // Phone number from saved session
  const [isVerified, setIsVerified] = useState(false);    // Verification status from session
  const [loading, setLoading] = useState(true);           // App loading state while restoring session

  useEffect(() => {
    // Load user data from AsyncStorage on app start
    const loadUser = async () => {
      try {
        const data = await AsyncStorage.getItem('user');
        if (data) {
          const { phone, isVerified } = JSON.parse(data);
          setInitialPhone(phone);
          setIsVerified(isVerified);
        }
      } catch (err) {
        console.error('Error loading user from storage:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // While loading session, show nothing (or you could show a splash screen)
  if (loading) return null;

  // Provide user context and navigate based on verification
  return (
    <UserProvider initialPhone={initialPhone} isVerified={isVerified}>
      <AppNavigator isVerified={isVerified} />
    </UserProvider>
  );
}
