// Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  BackHandler,
  Modal,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';

// Get window height for scroll layout adjustments
const { height } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { userPhone, logout } = useContext(UserContext);

  const [recentPickups, setRecentPickups] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  /**
   * Handles logout action and resets navigation stack
   * For web, it reloads the root URL
   */
  const performLogout = async () => {
    await logout();

    if (Platform.OS === 'web') {
      window.location.replace('/');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  /**
   * Shows confirmation before logout using modal or Alert
   */
  const confirmAndLogout = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Logout?', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    } else {
      setShowLogoutModal(true);
    }
  };

  /**
   * Confirms logout from modal (Web only)
   */
  const handleModalLogout = () => {
    setShowLogoutModal(false);
    performLogout();
  };

  /**
   * Formats a date string as DD/MM/YYYY
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Loads recent pickups every 3 seconds and when screen is focused
   */
  useEffect(() => {
    let intervalId;

    const loadPickups = async () => {
      try {
        const res = await axios.get('http://192.168.1.5:3000/pickups');
        const sorted = res.data
          .filter(item => item.phone === userPhone)
          .sort((a, b) => Number(b.id) - Number(a.id));
        setRecentPickups(sorted.slice(0, 2));
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      }
    };

    loadPickups();
    intervalId = setInterval(loadPickups, 3000);

    const unsubscribe = navigation.addListener('focus', loadPickups);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation, userPhone]);

  /**
   * Handles hardware back button and prevents default web back navigation
   */
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        confirmAndLogout();
        return true;
      };

      const backHandler = Platform.OS !== 'web'
        ? BackHandler.addEventListener('hardwareBackPress', onBackPress)
        : null;

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (Platform.OS === 'web') {
          e.preventDefault();
          setShowLogoutModal(true);
        }
      });

      return () => {
        if (backHandler) backHandler.remove();
        unsubscribe();
      };
    }, [])
  );

  /**
   * Renders a single recent pickup card
   */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderHistory', { pickup: item })}
    >
      <Text style={styles.cardTitle}>Pickup on {formatDate(item.date)}</Text>
      <Text style={styles.detail}>🕐 Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>📦 Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentWrapper}>
            {/* Welcome Message */}
            <Text style={styles.welcome}>Welcome, {userPhone || 'Customer'} 👋</Text>

            {/* Schedule New Pickup Button */}
            <Pressable style={styles.button} onPress={() => navigation.navigate('SchedulePickup')}>
              <Text style={styles.buttonText}>Schedule New Pickup</Text>
            </Pressable>

            {/* View Full Order History Button */}
            <Pressable
              style={[styles.button, { backgroundColor: '#6c757d' }]}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Text style={styles.buttonText}>View Full Order History</Text>
            </Pressable>

            {/* Logout Button */}
            <Pressable
              style={[styles.button, { backgroundColor: '#dc3545' }]}
              onPress={confirmAndLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </Pressable>

            {/* Recent Pickups Section */}
            <Text style={styles.subHeading}>Recent Pickups</Text>

            {recentPickups.length === 0 ? (
              <Text style={styles.noData}>No recent pickups found.</Text>
            ) : (
              <FlatList
                data={recentPickups}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal for Web */}
      <Modal
        transparent
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleModalLogout}>
                <Text style={styles.confirmText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f9f1f0', // Light Cream
  },
  innerContainer: {
    flex: 1,
    minHeight: height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#3a2e2e',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 20,
    color: '#f8afa6',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fadcd9', // Rose Quartz
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#3a2e2e',
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#f8afa6', // Dusty Rose
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3a2e2e',
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: '#f8afa6',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#f79489', // Coral
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
