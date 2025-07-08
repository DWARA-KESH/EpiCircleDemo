import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { PartnerContext } from '../context/PartnerContext';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function PartnerLoginScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { initiateLogin } = useContext(PartnerContext);
  const navigation = useNavigation();

  const handleLogin = () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
    } else {
      setError('');
      initiateLogin();
      navigation.navigate('OTP');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Partner Login</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>

          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            placeholder='Enter Phone Number'
            value={phone}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setPhone(numericText);
            }}
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Send OTP</Text>
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
    elevation: 5,
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
    borderWidth: 1.2,
    borderColor: '#f8afa6', // Dusty Rose
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#3a2e2e',
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
