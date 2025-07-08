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
        backgroundColor: '#fadcd9',
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
      <Text style={{ color: '#3a2e2e', marginBottom: 4 }}>📅 Date: {item.date}</Text>
      <Text style={{ color: '#3a2e2e', marginBottom: 4 }}>🕐 Time: {item.timeSlot}</Text>
      <Text style={{ color: '#3a2e2e', marginBottom: 4 }}>📍 Address: {item.address}</Text>
      <Text style={{ color: '#3a2e2e', fontWeight: 'bold' }}>📦 Status: {item.status}</Text>

      {item.status === 'Accepted' && (
        <Text style={{ marginTop: 6, fontStyle: 'italic', color: '#3a2e2e' }}>
          Pickup Code: {item.id.slice(-6)}
        </Text>
      )}

      {(item.status === 'Pending for Approval' || item.status === 'Completed') && (
        <>
          <Text style={{ fontWeight: 'bold', marginTop: 10, color: '#3a2e2e' }}>Items:</Text>
          {item.items?.map((itm, idx) => (
            <Text key={idx} style={{ color: '#3a2e2e' }}>
              • {itm.name} × {itm.qty} @ ₹{itm.price}
            </Text>
          ))}
          <Text style={{ fontWeight: 'bold', marginTop: 6, color: '#3a2e2e' }}>
            Total: ₹{item.totalAmount}
          </Text>

          {item.status === 'Pending for Approval' && (
            <TouchableOpacity
              onPress={() => approveOrder(item.id)}
              style={{
                marginTop: 12,
                backgroundColor: '#f79489',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Approve Order</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: height,
        backgroundColor: '#f9f1f0',
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
          color: '#f8afa6' // Dusty Rose
        }}>
          Order History
        </Text>

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
