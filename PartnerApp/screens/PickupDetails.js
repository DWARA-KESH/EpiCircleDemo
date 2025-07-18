// React & React Native Imports
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, Alert, Linking,
  KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  Platform, ScrollView, TouchableOpacity, Modal, Pressable,
} from 'react-native';
import axios from 'axios';

// Check if the app is running on web platform
const isWeb = Platform.OS === 'web';

// Custom Modal component for Web-based alerts
function ModalAlert({ visible, onClose, title, message }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <Pressable style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function PickupDetails({ route }) {
  const { pickup } = route.params;

  // Local state variables
  const [code, setCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [items, setItems] = useState(pickup.items || []);
  const [status, setStatus] = useState(pickup.status);
  const [pickupCode, setPickupCode] = useState(pickup.pickupCode || '');
  const [totalAmount, setTotalAmount] = useState(pickup.totalAmount || 0);
  const [modal, setModal] = useState({ visible: false, title: '', message: '' });

  // Show alert based on platform
  const showAlert = (title, message) => {
    isWeb
      ? setModal({ visible: true, title, message })
      : Alert.alert(title, message);
  };

  // Polling: Refresh pickup status periodically unless already in-process
  useEffect(() => {
    const interval = setInterval(() => {
      if (status !== 'In-Process') fetchUpdatedPickup();
    }, 5000);
    return () => clearInterval(interval);
  }, [status]);

  // Fetch latest pickup data from server
  const fetchUpdatedPickup = async () => {
    try {
      const res = await axios.get(`http://192.168.1.5:3000/pickups/${pickup.id}`);
      const updated = res.data;
      setStatus(updated.status);
      setItems(updated.items || []);
      setPickupCode(updated.pickupCode || '');
      setTotalAmount(updated.totalAmount || 0);
    } catch (err) {
      console.log('Polling failed:', err.message);
    }
  };

  // Update pickup details on server
  const updatePickup = async (newStatus, extraData = {}) => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${pickup.id}`, {
        status: newStatus,
        ...extraData,
      });
      setStatus(newStatus);
      if (extraData.pickupCode) setPickupCode(extraData.pickupCode);
      if (extraData.items) setItems(extraData.items);
      if (extraData.totalAmount) setTotalAmount(extraData.totalAmount);
      showAlert('Success', `Status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Failed to update pickup:', err.message);
      showAlert('Error', 'Could not update pickup.');
    }
  };

  // Generate a random 6-digit pickup code
  const generatePickupCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // Accept pickup request
  const handleAccept = () => {
    const code = generatePickupCode();
    updatePickup('Accepted', { pickupCode: code });
  };

  // Verify pickup code entered by partner
  const handleVerifyCode = () => {
    if (code.trim() === pickupCode) {
      updatePickup('In-Process');
    } else {
      showAlert('Invalid Code', 'The entered pickup code does not match.');
    }
  };

  // Add item to current pickup
  const addItem = () => {
    if (!itemName || !qty || !price) {
      showAlert('Missing Fields', 'Enter item name, quantity and price.');
      return;
    }

    const newItem = {
      name: itemName,
      qty: parseInt(qty),
      price: parseFloat(price),
    };

    setItems([...items, newItem]);
    setItemName('');
    setQty('');
    setPrice('');
  };

  // Remove item from pickup
  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Submit all items for approval to customer
  const submitForApproval = () => {
    if (items.length === 0) {
      showAlert('No Items', 'Please add at least one item.');
      return;
    }

    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    updatePickup('Pending for Approval', { items, totalAmount: total });
  };

  // Render each item in FlatList
  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDetails}>
          Qty: {item.qty} | Price: ₹{item.price}
        </Text>
      </View>
      {status === 'In-Process' && (
        <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteButton}>
          <Text style={styles.deleteX}>✖</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Mapping status to respective colors
  const statusColorMap = {
    Pending: '#f59e0b',
    Accepted: '#3b82f6',
    'In-Process': '#0ea5e9',
    'Pending for Approval': '#10b981',
    Completed: '#22c55e',
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Render entire UI
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={() => !isWeb && Keyboard.dismiss()}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Pickup Details</Text>

          {/* Pickup Info Section */}
          <View style={styles.section}>
            <Text style={styles.detail}>📅 Pickup Date: {formatDate(pickup.date)}</Text>
            <Text style={styles.detail}>🕐 Time: {pickup.timeSlot || 'N/A'}</Text>
            <Text style={styles.detail}>📍 Address: {pickup.address || 'N/A'}</Text>
            <Text style={styles.detail}>
              🔄 Status: <Text style={{ fontWeight: 'bold', color: statusColorMap[status] || '#000' }}>{status}</Text>
            </Text>
            {pickup.mapLink && (
              <Text style={styles.mapLink} onPress={() => Linking.openURL(pickup.mapLink)}>
                🔗 Open Map
              </Text>
            )}
          </View>

          {/* Accept Pickup */}
          {status === 'Pending' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleAccept}>
              <Text style={styles.primaryButtonText}>Accept Pickup</Text>
            </TouchableOpacity>
          )}

          {/* Code Verification */}
          {status === 'Accepted' && (
            <View style={styles.section}>
              <Text style={styles.detail}>
                Enter the pickup code shown on the customer’s screen to proceed.
              </Text>
              <TextInput
                placeholder="Enter Pickup Code"
                style={styles.input}
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyCode}>
                <Text style={styles.primaryButtonText}>Verify Pickup Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Items */}
          {status === 'In-Process' && (
            <View style={styles.section}>
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
              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>

              <FlatList
                data={items}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
                style={{ marginTop: 10 }}
              />

              {/* Submit Items */}
              {items.length > 0 && (
                <TouchableOpacity style={styles.submitButton} onPress={submitForApproval}>
                  <Text style={styles.submitButtonText}>Submit for Approval</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Summary after submission */}
          {(status === 'Pending for Approval' || status === 'Completed') && (
            <View style={styles.summaryCard}>
              <Text style={styles.subTitle}>Items Added:</Text>
              {items.map((item, index) => (
                <Text key={index} style={styles.itemText}>
                  • {item.name} – {item.qty} × ₹{item.price}
                </Text>
              ))}
              <Text style={styles.totalText}>Total: ₹{totalAmount}</Text>
            </View>
          )}

          {/* Platform Alert Modal */}
          <ModalAlert
            visible={modal.visible}
            title={modal.title}
            message={modal.message}
            onClose={() => setModal({ ...modal, visible: false })}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f1f0', // Light Cream Pink
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3a2e2e',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8afa6',
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
    color: '#3a2e2e',
  },
  mapLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#f8afa6',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#fadcd9',
    borderColor: '#f8afa6',
    borderWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a2e2e',
  },
  itemDetails: {
    fontSize: 14,
    color: '#3a2e2e',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#f8afa6',
    borderRadius: 6,
    padding: 6,
  },
  deleteX: {
    color: '#3a2e2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 15,
    color: '#3a2e2e',
    marginBottom: 4,
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 6,
    color: '#3a2e2e',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 6,
    color: '#3a2e2e',
  },
  codeText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#3a2e2e',
  },
  codeBold: {
    fontWeight: 'bold',
    color: '#3a2e2e',
  },
  addButton: {
    backgroundColor: '#f8afa6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: '#3a2e2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#f79489', // Coral
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#f8afa6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#3a2e2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#fadcd9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f8afa6',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#3a2e2e',
  },
  modalMessage: {
    fontSize: 16,
    color: '#3a2e2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#f79489',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
