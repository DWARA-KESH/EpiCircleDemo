import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const { phone } = route.params;

  const handleVerify = async () => {
    if (otp === '123456') {
      await AsyncStorage.setItem('partnerLoggedIn', 'true');
      await AsyncStorage.setItem('partnerPhone', phone);
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Invalid OTP', 'Please enter the correct OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20
  }
});
