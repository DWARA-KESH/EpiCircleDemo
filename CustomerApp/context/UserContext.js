import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children, navigation }) => {
  const [userPhone, setUserPhone] = useState('');

  const logout = async () => {
    try {
      setUserPhone('');
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Error clearing storage during logout:', err);
    }
  };

  return (
    <UserContext.Provider value={{ userPhone, setUserPhone, logout }}>
      {children}
    </UserContext.Provider>
  );
};
