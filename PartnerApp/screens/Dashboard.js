import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking
} from 'react-native';
import axios from 'axios';

export default function Dashboard({ navigation }) {
  const [pickups, setPickups] = useState([]);

  const fetchPickups = async () => {
    try {
      const response = await axios.get('http://192.168.1.5:3000/pickups');
      const sorted = response.data.sort((a, b) => Number(b.id) - Number(a.id));

      setPickups(sorted);
    } catch (error) {
      console.error('Failed to fetch pickups:', error.message);
    }
  };

  useEffect(() => {
    fetchPickups(); 
  
    const interval = setInterval(() => {
      fetchPickups(); 
    }, 3000); 
  
    return () => clearInterval(interval); 
  }, []);
  

  const markAsAccepted = async (item) => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${item.id}`, {
        status: 'Accepted'
      });

      Alert.alert('Success', `Pickup marked as 'Accepted'`);
      fetchPickups();
    } catch (error) {
      console.error('Status update failed:', error.message);
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PickupDetails', { pickup: item })}
    >
      <Text style={styles.title}>Pickup Date: {item.date || 'N/A'}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Address: {item.address}</Text>
      <Text>Status: {item.status}</Text>

      {item.mapLink && (
        <Text style={styles.link} onPress={() => Linking.openURL(item.mapLink)}>
          Open Map
        </Text>
      )}

      {item.status === 'Pending' ? (
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => markAsAccepted(item)}
        >
          <Text style={styles.statusButtonText}>Mark as Accepted</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.infoText}>
          Further action → Open Pickup Details
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Pickup Requests</Text>
      <FlatList
        data={pickups}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No pickups available.</Text>
        }
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
  },
  statusButton: {
    marginTop: 10,
    backgroundColor: '#00796b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  infoText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#555'
  }
});
