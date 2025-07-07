import React, { useEffect, useState } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { UserProvider } from './context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [initialPhone, setInitialPhone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem('user');
      if (data) {
        const { phone } = JSON.parse(data);
        setInitialPhone(phone);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) return null; // or splash screen

  return (
    <UserProvider initialPhone={initialPhone}>
      <AppNavigator />
    </UserProvider>
  );
}
