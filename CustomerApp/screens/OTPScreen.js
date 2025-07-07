import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';

const { height } = Dimensions.get('window');

export default function OTPScreen({ navigation }) {
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { userPhone } = useContext(UserContext);

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setErrorMsg('Please enter a 6-digit OTP.');
      return;
    }

    if (otp === '123456') {
      try {
        await AsyncStorage.setItem('user', JSON.stringify({ phone: userPhone, isVerified: true }));
        setErrorMsg('');
        navigation.replace('Dashboard');
      } catch (err) {
        setErrorMsg('Something went wrong while saving your session.');
      }
    } else {
      setErrorMsg('Incorrect OTP. Please enter 123456 to continue.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit OTP sent to {userPhone}
          </Text>

          <TextInput
            style={styles.input}
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

          {errorMsg !== '' && <Text style={styles.error}>{errorMsg}</Text>}

          <TouchableOpacity style={styles.button} onPress={verifyOTP}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,
  },
  error: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
