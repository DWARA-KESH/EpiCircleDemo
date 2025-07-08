import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import axios from 'axios';

const isWeb = Platform.OS === 'web';

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

  const [code, setCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [items, setItems] = useState(pickup.items || []);
  const [status, setStatus] = useState(pickup.status);
  const [pickupCode, setPickupCode] = useState(pickup.pickupCode || '');
  const [totalAmount, setTotalAmount] = useState(pickup.totalAmount || 0);
  const [modal, setModal] = useState({ visible: false, title: '', message: '' });

  const showAlert = (title, message) => {
    if (isWeb) {
      setModal({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

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

  useEffect(() => {
    if (status === 'In-Process') return;
    const interval = setInterval(fetchUpdatedPickup, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const generatePickupCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleAccept = () => {
    const code = generatePickupCode();
    updatePickup('Accepted', { pickupCode: code });
  };

  const handleVerifyCode = () => {
    if (code.trim() === pickupCode) {
      updatePickup('In-Process');
    } else {
      showAlert('Invalid Code', 'The entered pickup code does not match.');
    }
  };

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

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setItemName('');
    setQty('');
    setPrice('');
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const submitForApproval = () => {
    if (items.length === 0) {
      showAlert('No Items', 'Please add at least one item.');
      return;
    }

    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    updatePickup('Pending for Approval', { items, totalAmount: total });
  };

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

  const statusColorMap = {
    Pending: '#f59e0b',
    Accepted: '#3b82f6',
    'In-Process': '#0ea5e9',
    'Pending for Approval': '#10b981',
    Completed: '#22c55e',
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={() => !isWeb && Keyboard.dismiss()}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Pickup Details</Text>

          <View style={styles.section}>
            <Text style={styles.detail}>
              📅 Pickup Date: {pickup.date || 'N/A'}
            </Text>

            <Text style={styles.detail}>
              🕐 Time: {pickup.timeSlot || 'N/A'}
            </Text>

            <Text style={styles.detail}>
              📍 Address: {pickup.address || 'N/A'}
            </Text>

            <Text style={styles.detail}>
              🔄 Status:{' '}
              <Text style={{ fontWeight: 'bold', color: statusColorMap[status] || '#000' }}>
                {status}
              </Text>
            </Text>

            {pickup.mapLink ? (
              <Text style={styles.mapLink} onPress={() => Linking.openURL(pickup.mapLink)}>
                🔗 Open Map
              </Text>
            ) : null}
          </View>

          {status === 'Pending' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleAccept}>
              <Text style={styles.primaryButtonText}>Accept Pickup</Text>
            </TouchableOpacity>
          )}

          {status === 'Accepted' && (
            <View style={styles.section}>
              <Text style={styles.codeText}>
                Pickup Code: <Text style={styles.codeBold}>{pickupCode}</Text>
              </Text>
              <TextInput
                placeholder="Enter Pickup Code"
                style={styles.input}
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyCode}>
                <Text style={styles.primaryButtonText}>Verify Code</Text>
              </TouchableOpacity>
            </View>
          )}

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

              {items.length > 0 && (
                <TouchableOpacity style={styles.submitButton} onPress={submitForApproval}>
                  <Text style={styles.submitButtonText}>Submit for Approval</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
    color: '#444',
  },
  mapLink: {
    color: '#1e88e5',
    textDecorationLine: 'underline',
    marginTop: 8,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
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
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#eee',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deleteX: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  subTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 6,
    color: '#111',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 6,
    color: '#0a0a0a',
  },
  codeText: {
    fontSize: 16,
    marginBottom: 10,
  },
  codeBold: {
    fontWeight: 'bold',
    color: '#222',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
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
    elevation: 5,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007bff',
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
