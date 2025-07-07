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

const { height } = Dimensions.get('window');

export default function SchedulePickup({ navigation }) {
  const { userPhone } = useContext(UserContext);
  const [date, setDate] = useState(new Date());
  const [pickupDateText, setPickupDateText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    let formattedDate = '';

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

    if (!timeSlot || !address || !formattedDate) {
      showAlert('Missing fields', 'Please fill in all required fields.');
      return;
    }

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

  const timeOptions = ['10–11 AM', '12–1 PM', '3–4 PM'];

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
          backgroundColor: '#f8fafc',
          paddingBottom: 100,
          paddingLeft: 20,
          paddingRight: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0077b6' }}>
            Schedule Your Pickup
          </Text>

          <Text style={{ marginTop: 15, fontWeight: 'bold', fontSize: 16, color: '#333' }}>Pickup Date</Text>

          {Platform.OS === 'web' ? (
            <TextInput
              value={pickupDateText}
              onChangeText={setPickupDateText}
              placeholder="YYYY-MM-DD"
              style={inputStyle}
            />
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={inputStyle}>
                <Text style={{ fontSize: 15, color: '#000' }}>{date.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  themeVariant="light"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}

          <Text style={{ marginTop: 15, fontWeight: 'bold', fontSize: 16, color: '#333' }}>Time Slot</Text>
          <TouchableOpacity style={inputStyle} onPress={() => setShowTimeSlots(true)}>
            <Text>{timeSlot || 'Select time slot'}</Text>
          </TouchableOpacity>

          <Modal visible={showTimeSlots} transparent animationType="fade">
            <View style={modalOverlayStyle}>
              <View style={modalContentStyle}>
                {timeOptions.map(slot => (
                  <TouchableOpacity key={slot} onPress={() => { setTimeSlot(slot); setShowTimeSlots(false); }}>
                    <Text style={{ fontSize: 16, paddingVertical: 10, color: '#007bff' }}>{slot}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowTimeSlots(false)}>
                  <Text style={{ marginTop: 10, color: '#dc3545', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={{ marginTop: 15, fontWeight: 'bold', fontSize: 16, color: '#333' }}>Address</Text>
          <TextInput
            style={inputStyle}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address"
          />

          <Text style={{ marginTop: 15, fontWeight: 'bold', fontSize: 16, color: '#333' }}>Google Map Link (optional)</Text>
          <TextInput
            style={inputStyle}
            value={mapLink}
            onChangeText={setMapLink}
            placeholder="Paste Google Maps link"
          />

          <View style={{ marginTop: 20 }}>
            <Button title="Submit Pickup Request" onPress={handleSubmit} color="#28a745" />
          </View>
        </View>
      </ScrollView>

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

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 10,
  borderRadius: 8,
  marginBottom: 10,
  fontSize: 15,
  backgroundColor: '#fff',
};

const modalOverlayStyle = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  width: '80%',
  alignItems: 'center',
};

const modalConfirmButtonStyle = {
  marginTop: 20,
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#007bff',
  borderRadius: 6,
};

const modalConfirmTextStyle = {
  color: '#fff',
  fontWeight: 'bold',
};
