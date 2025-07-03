import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function SchedulePickup({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');

  const handleSubmit = async () => {
    if (!timeSlot || !address) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    const pickupId = Date.now().toString(); // unique ID
    const pickup = {
      id: pickupId,
      date: date.toDateString(),
      timeSlot,
      address,
      mapLink,
      status: 'Pending',
    };

    const existing = await AsyncStorage.getItem('customerPickups');
    const updated = existing ? JSON.parse(existing) : [];
    updated.push(pickup);
    await AsyncStorage.setItem('customerPickups', JSON.stringify(updated));

    Alert.alert('Success', 'Pickup scheduled successfully!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pickup Date</Text>
      <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
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
    padding: 20
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  }
});
