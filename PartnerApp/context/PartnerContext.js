import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [partnerPhone, setPartnerPhone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartner = async () => {
      const data = await AsyncStorage.getItem('partner');
      if (data) {
        const { phone } = JSON.parse(data);
        setPartnerPhone(phone);
      }
      setLoading(false);
    };
    loadPartner();
  }, []);

  const login = async (phone) => {
    setPartnerPhone(phone);
    await AsyncStorage.setItem('partner', JSON.stringify({ phone }));
  };

  const logout = async () => {
    setPartnerPhone(null);
    await AsyncStorage.removeItem('partner');
  };

  return (
    <PartnerContext.Provider value={{ partnerPhone, login, logout, loading }}>
      {children}
    </PartnerContext.Provider>
  );
};
