import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { PartnerContext } from '../context/PartnerContext';

export default function PartnerLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(PartnerContext);

  const handleLogin = () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setError('');
    login(phone);
    navigation.navigate('OTP');
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
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setPhone(numericText);
              setError('');
            }}
            maxLength={10}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    marginBottom: 10
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10
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
