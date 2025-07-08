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
  const [isFocused, setIsFocused] = useState(false);
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
            style={[styles.input, isFocused && styles.inputFocused]}
            keyboardType="number-pad"
            placeholder='Enter OTP'
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, '');
              setOtp(numeric);
            }}
            returnKeyType="done"
            onSubmitEditing={verifyOTP}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
    backgroundColor: '#f9f1f0', // Light Cream Pink
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
    backgroundColor: '#fadcd9', // Rose Quartz
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
    color: '#3a2e2e',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#3a2e2e',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#f8afa6', // Dusty Rose
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 10,
    color: '#3a2e2e',
    shadowColor: '#000',
    textAlign:'center',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#f79489', // Coral
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    color: '#cc0000',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f79489', // Coral
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#f79489',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
