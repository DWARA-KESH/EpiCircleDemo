import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function SchedulePickup({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [pickupDateText, setPickupDateText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setPhone(parsed.phone);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!timeSlot || !address || (!date && !pickupDateText)) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    let formattedDate = '';
    if (Platform.OS === 'web') {
      formattedDate = pickupDateText;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedDate = `${year}-${month}-${day}`;
    }

    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    const pickup = {
      id: Date.now().toString(),
      phone,
      date: formattedDate,
      displayDate: formattedDate,
      timeSlot,
      address,
      mapLink,
      pickupCode,
      status: 'Pending'
    };

    try {
      await axios.post('http://192.168.1.5:3000/pickups', pickup);
      Alert.alert('Success', 'Pickup scheduled successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error posting pickup:', error.message);
      Alert.alert('Error', 'Failed to schedule pickup.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Date</Text>

      {Platform.OS === 'web' ? (
        <TextInput
          value={pickupDateText}
          onChangeText={setPickupDateText}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
      ) : (
        <>
          <Button
            title={date.toDateString()}
            onPress={() => setShowDatePicker(true)}
          />
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Time Slot</Text>
      <Picker
        selectedValue={timeSlot}
        onValueChange={setTimeSlot}
        style={styles.input}
      >
        <Picker.Item label="Select a time slot" value="" />
        <Picker.Item label="10–11 AM" value="10–11 AM" />
        <Picker.Item label="12–1 PM" value="12–1 PM" />
        <Picker.Item label="3–4 PM" value="3–4 PM" />
      </Picker>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
      />

      <Text style={styles.label}>Google Map Link (optional)</Text>
      <TextInput
        style={styles.input}
        value={mapLink}
        onChangeText={setMapLink}
        placeholder="Paste Google Maps link"
      />

      <Button title="Submit Pickup Request" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
