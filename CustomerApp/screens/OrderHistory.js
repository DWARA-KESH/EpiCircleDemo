import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const { height } = Dimensions.get('window');

export default function OrderHistory() {
  const { userPhone } = useContext(UserContext);
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    let interval;

    const loadOrders = async () => {
      try {
        const res = await axios.get('http://192.168.1.5:3000/pickups');
        const userOrders = res.data
          .filter(item => item.phone === userPhone)
          .sort((a, b) => Number(b.id) - Number(a.id));
        setPickups(userOrders);
      } catch (err) {
        console.error('Error loading orders:', err.message);
      }
    };

    loadOrders();
    interval = setInterval(loadOrders, 3000);

    return () => clearInterval(interval);
  }, [userPhone]);

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
    <View
      style={{
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 14,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Status: {item.status}</Text>

      {item.status === 'Accepted' && (
        <Text style={{ marginTop: 6, fontStyle: 'italic', color: '#333' }}>
          Pickup Code: {item.id.slice(-6)}
        </Text>
      )}

      {item.status === 'Pending for Approval' && (
        <>
          <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Items:</Text>
          {item.items?.map((itm, idx) => (
            <Text key={idx}>- {itm.name} x{itm.qty} @ ₹{itm.price}</Text>
          ))}
          <Text style={{ fontWeight: 'bold', marginTop: 6 }}>Total: ₹{item.totalAmount}</Text>
          <View style={{ marginTop: 10 }}>
            <Button title="Approve Order" onPress={() => approveOrder(item.id)} color="#28a745" />
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: height,
        backgroundColor: '#f1f5f9',
        padding: 20,
        alignItems: 'center'
      }}
    >
      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text style={{
          fontSize: 24,
          marginBottom: 16,
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#0077b6'
        }}>Order History</Text>

        {pickups.length === 0 ? (
          <Text style={{ textAlign: 'center', fontSize: 16, color: '#555' }}>
            No pickups scheduled yet.
          </Text>
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
