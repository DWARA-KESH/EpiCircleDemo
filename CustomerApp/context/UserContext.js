// UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the UserContext object
export const UserContext = createContext();

/**
 * UserProvider component wraps around parts of the app that require
 * access to the authenticated user's state (e.g., phone number).
 *
 * Props:
 * - children: All nested components that consume the context
 * - initialPhone: Optional initial phone number (used during bootstrapping)
 */
export const UserProvider = ({ children, initialPhone }) => {
  const [userPhone, setUserPhone] = useState(null);

  /**
   * Load user session from AsyncStorage on app start.
   * This helps in persisting login state across app restarts.
   */
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.phone) {
            setUserPhone(parsedUser.phone);
          }
        } else if (initialPhone) {
          setUserPhone(initialPhone); // fallback if initialPhone is passed
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };

    loadUserFromStorage();
  }, [initialPhone]);

  /**
   * Logs in the user by setting the phone number in both state and storage.
   *
   * @param {string} phone - The user's phone number
   */
  const login = async (phone) => {
    try {
      setUserPhone(phone);
      await AsyncStorage.setItem('user', JSON.stringify({ phone }));
    } catch (error) {
      console.error('Error saving user to AsyncStorage:', error);
    }
  };

  /**
   * Logs out the user by clearing the stored phone number from both
   * state and AsyncStorage.
   */
  const logout = async () => {
    try {
      setUserPhone(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user from AsyncStorage:', error);
    }
  };

  /**
   * Context value shared with consuming components
   */
  const contextValue = {
    userPhone,
    setUserPhone: login, // rename for semantic clarity
    logout,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
