import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { UserContext } from '../context/UserContext';


export default function SchedulePickup({ navigation }) {
  const { userPhone } = useContext(UserContext);

  // Form state
  const [date, setDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date()); // Used in iOS modal
  const [pickupDateText, setPickupDateText] = useState(''); // For web input
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');

  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const timeOptions = ['10–11 AM', '12–1 PM', '3–4 PM'];

  // Show alert dialog based on platform
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    let formattedDate = '';

    // Format date based on platform
    if (Platform.OS === 'web') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!pickupDateText.match(dateRegex)) {
        showAlert('Invalid Date', 'Please enter date in YYYY-MM-DD format.');
        return;
      }
      formattedDate = pickupDateText;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedDate = `${year}-${month}-${day}`;
    }

    // Validate required fields
    if (!timeSlot || !address || !formattedDate) {
      showAlert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    // Generate unique 6-digit code
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    const pickup = {
      id: Date.now().toString(),
      phone: userPhone,
      date: formattedDate,
      displayDate: formattedDate,
      timeSlot,
      address,
      mapLink,
      pickupCode,
      status: 'Pending',
    };

    try {
      await axios.post('http://192.168.1.5:3000/pickups', pickup);

      if (Platform.OS === 'web') {
        setSuccessModalVisible(true);
      } else {
        showAlert('Success', 'Pickup scheduled successfully!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error posting pickup:', error.message);
      showAlert('Error', 'Failed to schedule pickup.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9f1f0',
          paddingBottom: 100,
          paddingLeft: 20,
          paddingRight: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={heading}>Schedule Your Pickup</Text>

          {/* Pickup Date Input */}
          <Text style={label}>Pickup Date</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              value={pickupDateText}
              onChangeText={setPickupDateText}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#aaa"
              style={inputStyle}
            />
          ) : Platform.OS === 'android' ? (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={inputStyle}>
                <Text style={{ fontSize: 15, color: '#333' }}>{date.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setDate(selectedDate);
                    setShowDatePicker(false);
                  }}
                />
              )}
            </>
          ) : (
            <>
              {/* iOS Date Modal */}
              <TouchableOpacity
                onPress={() => {
                  setTempDate(date);
                  setShowDatePicker(true);
                }}
                style={inputStyle}
              >
                <Text style={{ fontSize: 15, color: '#333' }}>{date.toDateString()}</Text>
              </TouchableOpacity>
              <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={modalOverlayStyle}>
                  <View style={modalContentStyle}>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setTempDate(selectedDate);
                      }}
                      themeVariant="light"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        setDate(tempDate);
                        setShowDatePicker(false);
                      }}
                      style={modalConfirmButtonStyle}
                    >
                      <Text style={modalConfirmTextStyle}>OK</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {/* Time Slot Selector */}
          <Text style={label}>Time Slot</Text>
          <TouchableOpacity style={inputStyle} onPress={() => setShowTimeSlots(true)}>
            <Text>{timeSlot || 'Select time slot'}</Text>
          </TouchableOpacity>

          {/* Time Slot Modal */}
          <Modal visible={showTimeSlots} transparent animationType="fade">
            <View style={modalOverlayStyle}>
              <View style={modalContentStyle}>
                {timeOptions.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => {
                      setTimeSlot(slot);
                      setShowTimeSlots(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, paddingVertical: 10, color: '#f79489' }}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowTimeSlots(false)}>
                  <Text style={{ marginTop: 10, color: '#dc3545', fontWeight: 'bold' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Address Input */}
          <Text style={label}>Address</Text>
          <TextInput
            style={inputStyle}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
            placeholderTextColor="#aaa"
          />

          {/* Map Link (Optional) */}
          <Text style={label}>Google Map Link (optional)</Text>
          <TextInput
            style={inputStyle}
            value={mapLink}
            onChangeText={setMapLink}
            placeholder="Paste Google Maps link"
            placeholderTextColor="#aaa"
          />

          {/* Submit Button */}
          <View style={{ marginTop: 20 }}>
            <Button title="Submit Pickup Request" onPress={handleSubmit} color="#f79489" />
          </View>
        </View>
      </ScrollView>

      {/* Success Modal for Web */}
      {Platform.OS === 'web' && (
        <Modal
          transparent
          visible={successModalVisible}
          animationType="fade"
          onRequestClose={() => setSuccessModalVisible(false)}
        >
          <View style={modalOverlayStyle}>
            <View style={modalContentStyle}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#28a745' }}>
                Pickup Scheduled!
              </Text>
              <Text style={{ fontSize: 15, textAlign: 'center', marginBottom: 20 }}>
                Your pickup request has been successfully submitted.
              </Text>
              <TouchableOpacity
                style={modalConfirmButtonStyle}
                onPress={() => {
                  setSuccessModalVisible(false);
                  navigation.navigate('Dashboard');
                }}
              >
                <Text style={modalConfirmTextStyle}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}


const styles = {
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f1f0',
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 400,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#f8afa6',
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fadcd9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: '#fff',
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f79489',
    borderRadius: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeOption: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#f79489',
  },
  cancelText: {
    marginTop: 10,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#28a745',
  },
  successText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
};
