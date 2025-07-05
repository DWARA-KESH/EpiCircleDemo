import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Dashboard({ navigation }) {
  const [phone, setPhone] = useState('');
  const [recentPickups, setRecentPickups] = useState([]);

  useEffect(() => {
    let intervalId;

    const loadUserAndPickups = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { phone } = JSON.parse(userData);
          setPhone(phone);

          const res = await axios.get('http://192.168.1.5:3000/pickups');
          const sorted = res.data
            .filter(item => item.phone === phone)
            .sort((a, b) => Number(b.id) - Number(a.id));

          setRecentPickups(sorted.slice(0, 2));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      }
    };

    loadUserAndPickups();
    intervalId = setInterval(loadUserAndPickups, 3000);

    const unsubscribe = navigation.addListener('focus', loadUserAndPickups);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation]);

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Welcome, {phone || 'Customer'} 👋</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('SchedulePickup')}>
        <Text style={styles.buttonText}>Schedule New Pickup</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: '#6c757d' }]}
        onPress={() => navigation.navigate('OrderHistory')}
      >
        <Text style={styles.buttonText}>View Full Order History</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f1f5f9',
    flexGrow: 1,
  },
  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 20,
    color: '#0077b6',
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
});
