import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Style,Sheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function OrderHistory({navigation}) {
  const [pickups, setPickups] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadPickups = async () => {
        const data = await AsyncStorage.getItem('customerPickups');
        if (data) {
          setPickups(JSON.parse(data));
        }
      };
      loadPickups();
    }, [])
  );

  const approveOrder = async (id) => {
    const updated = pickups.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Completed' };
      }
      return p;
    });
    setPickups(updated);
    await AsyncStorage.setItem('customerPickups', JSON.stringify(updated));
    Alert.alert('Pickup Approved', 'The order is now marked as Completed.');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text>Date: {item.date}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Status: {item.status}</Text>
      {item.status === 'Accepted' && (
        <Text>Pickup Code: {item.id.slice(-6)}</Text> 
      )}
      {item.status === 'Pending for Approval' && (
        <>
          <Text style={{ fontWeight: 'bold' }}>Items:</Text>
          {item.items?.map((itm, idx) => (
            <Text key={idx}>- {itm.name} x{itm.qty} @ ₹{itm.price}</Text>
          ))}
          <Text>Total: ₹{item.totalAmount}</Text>
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
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  }
});
