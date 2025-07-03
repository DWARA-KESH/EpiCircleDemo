import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partner Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Button
        title="Send OTP"
        onPress={() => navigation.navigate('OTP', { phone })}
      />
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
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20
  }
});
