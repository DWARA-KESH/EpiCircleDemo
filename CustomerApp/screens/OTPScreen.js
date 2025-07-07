import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { showAlert } from '../Utilities/alertHelper';

export default function OTPScreen({ navigation }) {
  const [otp, setOtp] = useState('');
  const { userPhone } = useContext(UserContext);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      showAlert('Invalid OTP', 'Please enter a 6-digit OTP.');
      return;
    }

    if (otp === '123456') {
      try {
        await AsyncStorage.setItem('user', JSON.stringify({ phone: userPhone }));
        navigation.replace('Dashboard');
      } catch (err) {
        showAlert('Error', 'Something went wrong while saving your session.');
      }
    } else {
      showAlert('Incorrect OTP', 'Please enter 123456 to continue.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit OTP sent to {userPhone}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(text) => {
            const numeric = text.replace(/[^0-9]/g, '');
            setOtp(numeric);
          }}
          returnKeyType="done"
          onSubmitEditing={verifyOTP}
        />

        <TouchableOpacity style={styles.button} onPress={verifyOTP}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
