import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
            .sort((a, b) => Number(b.id) - Number(a.id)); // latest first

          setRecentPickups(sorted.slice(0, 2)); // show top 2
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      }
    };

    loadUserAndPickups(); // initial load
    intervalId = setInterval(loadUserAndPickups, 3000); // update every 3 seconds

    const unsubscribe = navigation.addListener('focus', loadUserAndPickups);

    return () => {
      clearInterval(intervalId); // clear on unmount
      unsubscribe();
    };
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OrderHistory', { pickup: item })}
    >
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {phone || 'Customer'}</Text>

      <Button
        title="Schedule Pickup"
        onPress={() => navigation.navigate('SchedulePickup')}
      />
      <View style={{ height: 10 }} />
      <Button
        title="View Full Order History"
        onPress={() => navigation.navigate('OrderHistory')}
      />

      <Text style={styles.subHeading}>Recent Pickups</Text>
      <FlatList
        data={recentPickups}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ marginTop: 10, textAlign: 'center' }}>
            No recent pickups found.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  welcome: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  card: {
    backgroundColor: '#e1f5fe',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
