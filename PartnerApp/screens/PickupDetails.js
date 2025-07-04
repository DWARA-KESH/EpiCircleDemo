import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, FlatList, Alert, Linking
} from 'react-native';
import axios from 'axios';

export default function PickupDetails({ route, navigation }) {
  const { pickup } = route.params;

  const [code, setCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [items, setItems] = useState(pickup.items || []);
  const [status, setStatus] = useState(pickup.status);
  const [pickupCode, setPickupCode] = useState(pickup.pickupCode || '');

  const updatePickup = async (newStatus, extraData = {}) => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${pickup.id}`, {
        status: newStatus,
        ...extraData
      });

      setStatus(newStatus);

      // Update pickupCode if it was generated
      if (extraData.pickupCode) {
        setPickupCode(extraData.pickupCode);
      }

      Alert.alert('Success', `Status updated to ${newStatus}`);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to update pickup:', err.message);
      Alert.alert('Error', 'Could not update pickup.');
    }
  };

  const generatePickupCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  };

  const handleAccept = () => {
    const newCode = generatePickupCode();
    updatePickup('Accepted', { pickupCode: newCode });
  };

  const handleVerifyCode = () => {
    if (code.trim() === pickupCode) {
      updatePickup('In-Process');
    } else {
      Alert.alert('Invalid Pickup Code', 'The entered pickup code does not match.');
    }
  };

  const addItem = () => {
    if (!itemName || !qty || !price) {
      Alert.alert('Missing fields', 'Please enter item name, quantity, and price.');
      return;
    }

    const newItem = {
      name: itemName,
      qty: parseInt(qty),
      price: parseFloat(price)
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setItemName('');
    setQty('');
    setPrice('');
  };

  const submitForApproval = () => {
    if (items.length === 0) {
      Alert.alert('No Items', 'Add at least one item before submitting.');
      return;
    }

    const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    updatePickup('Pending for Approval', { items, totalAmount });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pickup Details</Text>
      <Text>Status: {status}</Text>
      <Text>Date: {pickup.date}</Text>
      <Text>Time: {pickup.timeSlot}</Text>
      <Text>Address: {pickup.address}</Text>

      {pickup.mapLink && (
        <Text
          style={{ color: 'blue', marginBottom: 10 }}
          onPress={() => Linking.openURL(pickup.mapLink)}
        >
          Open Map
        </Text>
      )}

      {status === 'Pending' && (
        <Button title="Accept Pickup" onPress={handleAccept} />
      )}

      {status === 'Accepted' && (
        <>
          <Text style={styles.codeDisplay}>
            Pickup Code: <Text style={{ fontWeight: 'bold' }}>{pickupCode}</Text>
          </Text>
          <TextInput
            placeholder="Enter Pickup Code"
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <Button title="Verify Code" onPress={handleVerifyCode} />
        </>
      )}

      {status === 'In-Process' && (
        <>
          <TextInput
            placeholder="Item Name"
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            placeholder="Quantity"
            style={styles.input}
            value={qty}
            onChangeText={setQty}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Price"
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <Button title="Add Item" onPress={addItem} />

          <FlatList
            data={items}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.itemText}>
                • {item.name} – {item.qty} × ₹{item.price}
              </Text>
            )}
            style={{ marginTop: 10 }}
          />

          <Button
            title="Submit for Approval"
            onPress={submitForApproval}
            color="green"
          />
        </>
      )}

      {status === 'Pending for Approval' && (
        <>
          <Text style={styles.sectionTitle}>Items:</Text>
          {pickup.items?.map((item, idx) => (
            <Text key={idx} style={styles.itemText}>
              • {item.name} – {item.qty} × ₹{item.price}
            </Text>
          ))}
          <Text style={styles.total}>Total: ₹{pickup.totalAmount}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },
  itemText: {
    marginBottom: 4,
    fontSize: 16
  },
  sectionTitle: {
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 16
  },
  total: {
    fontWeight: 'bold',
    marginTop: 6,
    fontSize: 16
  },
  codeDisplay: {
    marginVertical: 10,
    fontSize: 16
  }
});
