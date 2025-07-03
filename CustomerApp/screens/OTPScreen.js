import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const { phone } = route.params;

  const verifyOTP = async () => {
    if (otp === '123456') {
      // Save phone number in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({ phone }));
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Invalid OTP', 'Please enter 123456 to continue.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={verifyOTP} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  }
});
