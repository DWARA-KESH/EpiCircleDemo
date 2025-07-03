import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard({ navigation }) {
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { phone } = JSON.parse(userData);
        setPhone(phone);
      }
    };
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {phone}</Text>
      <Button
        title="Schedule Pickup"
        onPress={() => navigation.navigate('SchedulePickup')}
      />
      <Button
        title="View Order History"
        onPress={() => navigation.navigate('OrderHistory')}
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
  welcome: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  }
});
