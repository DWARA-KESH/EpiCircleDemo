import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function OrderHistory() {
  const [pickups, setPickups] = useState([]);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    let interval;

    const loadOrders = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;

        const { phone } = JSON.parse(userData);
        setPhone(phone);

        const res = await axios.get('http://192.168.1.5:3000/pickups');
        const userOrders = res.data
          .filter(item => item.phone === phone)
          .sort((a, b) => Number(b.id) - Number(a.id)); // Most recent first

        setPickups(userOrders);
      } catch (err) {
        console.error('Error loading orders:', err.message);
      }
    };

    loadOrders();
    interval = setInterval(loadOrders, 3000); // ⏱️ Poll every 3 seconds

    return () => clearInterval(interval); // Cleanup
  }, []);

  const approveOrder = async (id) => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${id}`, {
        status: 'Completed'
      });

      const updated = pickups.map(p =>
        p.id === id ? { ...p, status: 'Completed' } : p
      );
      setPickups(updated);
      Alert.alert('Pickup Approved', 'The order is now marked as Completed.');
    } catch (error) {
      console.error('Error approving order:', error.message);
      Alert.alert('Error', 'Could not approve the order.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Status: {item.status}</Text>

      {item.status === 'Accepted' && (
        <Text style={styles.code}>Pickup Code: {item.id.slice(-6)}</Text>
      )}

      {item.status === 'Pending for Approval' && (
        <>
          <Text style={styles.sectionTitle}>Items:</Text>
          {item.items?.map((itm, idx) => (
            <Text key={idx}>- {itm.name} x{itm.qty} @ ₹{itm.price}</Text>
          ))}
          <Text style={styles.total}>Total: ₹{item.totalAmount}</Text>
          <Button title="Approve Order" onPress={() => approveOrder(item.id)} />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      {pickups.length === 0 ? (
        <Text>No pickups scheduled yet.</Text>
      ) : (
        <FlatList
          data={pickups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8
  },
  total: {
    fontWeight: 'bold',
    marginTop: 6
  },
  code: {
    color: '#333',
    marginTop: 6,
    fontStyle: 'italic'
  }
});
