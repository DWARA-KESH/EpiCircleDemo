// OrderHistory.js

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

// Screen height for layout responsiveness
const { height } = Dimensions.get('window');

export default function OrderHistory() {
  const { userPhone } = useContext(UserContext);
  const [pickups, setPickups] = useState([]);

  /**
   * Fetches pickup history every 3 seconds
   */
  useEffect(() => {
    let interval;

    const loadOrders = async () => {
      try {
        const res = await axios.get('http://192.168.1.5:3000/pickups');
        const userOrders = res.data
          .filter(item => item.phone === userPhone)
          .sort((a, b) => Number(b.id) - Number(a.id)); // Latest first
        setPickups(userOrders);
      } catch (err) {
        console.error('Error loading orders:', err.message);
      }
    };

    loadOrders();
    interval = setInterval(loadOrders, 3000);

    return () => clearInterval(interval);
  }, [userPhone]);

  /**
   * Converts ISO string to DD/MM/YYYY format
   */
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /**
   * Approves an order by updating its status to "Completed"
   */
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

  /**
   * Renders each pickup card with details and optional "Approve Order" button
   */
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>📅 Date: {formatDate(item.date)}</Text>
      <Text style={styles.text}>🕐 Time: {item.timeSlot}</Text>
      <Text style={styles.text}>📍 Address: {item.address}</Text>
      <Text style={[styles.text, styles.bold]}>📦 Status: {item.status}</Text>

      {/* Show Pickup Code only if status is Accepted */}
      {item.status === 'Accepted' && item.pickupCode && (
        <Text style={styles.pickupCode}>Pickup Code: {item.pickupCode}</Text>
      )}

      {/* Show items and total if status is Pending for Approval or Completed */}
      {(item.status === 'Pending for Approval' || item.status === 'Completed') && (
        <>
          <Text style={[styles.text, styles.bold, { marginTop: 10 }]}>Items:</Text>
          {item.items?.map((itm, idx) => (
            <Text key={idx} style={styles.text}>
              • {itm.name} × {itm.qty} @ ₹{itm.price}
            </Text>
          ))}
          <Text style={[styles.text, styles.bold, { marginTop: 6 }]}>
            Total: ₹{item.totalAmount}
          </Text>

          {/* Approve button if still pending */}
          {item.status === 'Pending for Approval' && (
            <TouchableOpacity
              onPress={() => approveOrder(item.id)}
              style={styles.approveBtn}
            >
              <Text style={styles.approveText}>Approve Order</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <Text style={styles.title}>Order History</Text>

        {/* Conditional content */}
        {pickups.length === 0 ? (
          <Text style={styles.noData}>No pickups scheduled yet.</Text>
        ) : (
          <FlatList
            data={pickups}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  scrollContainer: {
    flexGrow: 1,
    minHeight: height,
    backgroundColor: '#f9f1f0', // Light Cream Pink
    padding: 20,
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#f8afa6', // Dusty Rose
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
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
  text: {
    color: '#3a2e2e',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  pickupCode: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#3a2e2e',
  },
  approveBtn: {
    marginTop: 12,
    backgroundColor: '#f79489', // Coral
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
};
