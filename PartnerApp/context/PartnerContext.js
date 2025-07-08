import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        const storedPartner = await AsyncStorage.getItem('partner');
        if (storedPartner) {
          const { isVerified } = JSON.parse(storedPartner);
          setIsVerified(isVerified);
        }
      } catch (error) {
        console.error('Error loading partner data', error);
      }
      setLoading(false);
    };
    loadPartner();
  }, []);

  const initiateLogin = async () => {
    setIsVerified(false);
    await AsyncStorage.setItem('partner', JSON.stringify({ isVerified: false }));
  };

  const verifyOtp = async () => {
    setIsVerified(true);
    await AsyncStorage.setItem('partner', JSON.stringify({ isVerified: true }));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('partner');
    setIsVerified(false);
  };

  return (
    <PartnerContext.Provider value={{
      isVerified,
      loading,
      initiateLogin,
      verifyOtp,
      logout
    }}>
      {children}
    </PartnerContext.Provider>
  );
};
