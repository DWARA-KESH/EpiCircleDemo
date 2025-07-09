import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context to share partner session state across the app
export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);  // OTP verification status
  const [loading, setLoading] = useState(true);         // App loading while checking storage

  // Load saved partner session from AsyncStorage on app startup
  useEffect(() => {
    const loadPartner = async () => {
      try {
        const storedPartner = await AsyncStorage.getItem('partner');
        if (storedPartner) {
          const { isVerified } = JSON.parse(storedPartner);
          setIsVerified(isVerified);
        }
      } catch (error) {
        console.error('Error loading partner data from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, []);

  // Called after login to store unverified state
  const initiateLogin = async () => {
    setIsVerified(false);
    try {
      await AsyncStorage.setItem('partner', JSON.stringify({ isVerified: false }));
    } catch (error) {
      console.error('Error storing unverified partner session:', error);
    }
  };

  // Called when OTP is verified successfully
  const verifyOtp = async () => {
    setIsVerified(true);
    try {
      await AsyncStorage.setItem('partner', JSON.stringify({ isVerified: true }));
    } catch (error) {
      console.error('Error storing verified partner session:', error);
    }
  };

  // Clear partner session and reset verification
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('partner');
    } catch (error) {
      console.error('Error removing partner session:', error);
    }
    setIsVerified(false);
  };

  return (
    <PartnerContext.Provider
      value={{
        isVerified,
        loading,
        initiateLogin,
        verifyOtp,
        logout
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};
