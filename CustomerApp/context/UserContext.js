import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children, initialPhone }) => {
  const [userPhone, setUserPhone] = useState(initialPhone);

  const login = async (phone) => {
    setUserPhone(phone);
    await AsyncStorage.setItem('user', JSON.stringify({ phone }));
  };

  const logout = async () => {
    setUserPhone(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ userPhone, setUserPhone: login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
