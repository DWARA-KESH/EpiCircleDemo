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

const { height } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const { userPhone, logout } = useContext(UserContext);
  const [recentPickups, setRecentPickups] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const handleModalLogout = () => {
    setShowLogoutModal(false);
    performLogout();
  };

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderHistory', { pickup: item })}
    >
      <Text style={styles.cardTitle}>Pickup on {item.date}</Text>
      <Text style={styles.detail}>🕐 Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>📦 Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.contentWrapper}>
            <Text style={styles.welcome}>Welcome, {userPhone || 'Customer'} 👋</Text>

            <Pressable style={styles.button} onPress={() => navigation.navigate('SchedulePickup')}>
              <Text style={styles.buttonText}>Schedule New Pickup</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: '#6c757d' }]}
              onPress={() => navigation.navigate('OrderHistory')}
            >
              <Text style={styles.buttonText}>View Full Order History</Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: '#dc3545' }]}
              onPress={confirmAndLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </Pressable>

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

      {/* Web Logout Modal */}
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
    backgroundColor: '#f1f5f9',
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
    color: '#333',
    paddingBottom: '20px'
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 20,
    color: '#0077b6',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
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
    color: '#0a0a0a',
  },
  detail: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#007bff',
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
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: '#dc3545',
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
