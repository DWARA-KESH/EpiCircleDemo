import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard({ navigation }) {
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    const loadPickups = async () => {
      const data = await AsyncStorage.getItem('customerPickups');
      if (data) {
        const allRequests = JSON.parse(data);
        // Filter requests with status not "Completed"
        const activeRequests = allRequests.filter(req => req.status !== 'Completed');
        setPickups(activeRequests);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadPickups);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PickupDetails', { pickup: item })}
    >
      <Text style={styles.title}>Customer: {item.name || 'N/A'}</Text>
      <Text>Phone: {item.phone || 'N/A'}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Date: {item.date} | Time: {item.timeSlot}</Text>
      <Text>Status: {item.status}</Text>
      {item.mapLink ? (
        <Text
          style={styles.link}
          onPress={() => Linking.openURL(item.mapLink)}
        >
          Open Map
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Assigned Pickups</Text>
      <FlatList
        data={pickups}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No assigned pickups yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  card: {
    backgroundColor: '#e0f7fa',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  link: {
    color: 'blue',
    marginTop: 6
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16
  }
});
