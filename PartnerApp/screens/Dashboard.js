import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
  Platform,
  StatusBar,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { PartnerContext } from '../context/PartnerContext';

const { height } = Dimensions.get('window');

// Custom alert/modal for logout on web
function LogoutModal({ visible, onConfirm, onCancel }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={alertStyles.overlay}>
        <View style={alertStyles.box}>
          <Text style={alertStyles.title}>Confirm Logout</Text>
          <Text style={alertStyles.msg}>Are you sure you want to logout?</Text>
          <View style={alertStyles.row}>
            <Pressable style={[alertStyles.btn, { backgroundColor: '#6c757d' }]} onPress={onCancel}>
              <Text style={alertStyles.btnText}>Cancel</Text>
            </Pressable>
            <Pressable style={alertStyles.btn} onPress={onConfirm}>
              <Text style={alertStyles.btnText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function Dashboard({ navigation }) {
  const [pickups, setPickups] = useState([]);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useContext(PartnerContext);

  const fetchPickups = async () => {
    try {
      const response = await axios.get('http://192.168.1.5:3000/pickups');
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setPickups(sorted);
    } catch (err) {
      setAlert({ visible: true, title: 'Error', message: 'Failed to fetch pickups.' });
    }
  };

  const performLogout = async () => {
    await logout();

    if (Platform.OS === 'web') {
      window.location.reload(); // or replace with `/` if needed
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  const markAsAccepted = async item => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${item.id}`, { status: 'Accepted' });
      setAlert({ visible: true, title: 'Success', message: "Pickup marked as 'Accepted'" });
      fetchPickups();
    } catch {
      setAlert({ visible: true, title: 'Error', message: 'Failed to update status.' });
    }
  };

  useEffect(() => {
    fetchPickups();
    const id = setInterval(fetchPickups, 3000);
    return () => clearInterval(id);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PickupDetails', { pickup: item })}
    >
      <Text style={styles.cardTitle}>📦 Pickup Date: {item.date || 'N/A'}</Text>
      <Text style={styles.detail}>🕐 Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>📍 Address: {item.address}</Text>
      <Text style={styles.detail}>🔄 Status: {item.status}</Text>

      {item.mapLink ? (
        <Text style={styles.link} onPress={() => Linking.openURL(item.mapLink)}>
          🔗 Open Map
        </Text>
      ) : null}

      {item.status === 'Pending' ? (
        <TouchableOpacity style={styles.statusButton} onPress={() => markAsAccepted(item)}>
          <Text style={styles.statusButtonText}>Mark as Accepted</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.infoText}>➡️ Open Pickup Details</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, Platform.OS === 'android' && { paddingTop: StatusBar.currentHeight }]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>All Pickup Requests</Text>
          <Pressable onPress={confirmLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        <FlatList
          data={pickups}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={pickups.length === 0 && styles.centerEmpty}
          ListEmptyComponent={<Text style={styles.empty}>No pickups available.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Alert Modal */}
      <Modal
        transparent
        visible={alert.visible}
        animationType="fade"
        onRequestClose={() => setAlert({ ...alert, visible: false })}
      >
        <View style={alertStyles.overlay}>
          <View style={alertStyles.box}>
            <Text style={alertStyles.title}>{alert.title}</Text>
            <Text style={alertStyles.msg}>{alert.message}</Text>
            <Pressable style={alertStyles.btn} onPress={() => setAlert({ ...alert, visible: false })}>
              <Text style={alertStyles.btnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Logout Modal for Web */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={performLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  logoutText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  link: {
    color: '#1e88e5',
    marginTop: 8,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  statusButton: {
    marginTop: 12,
    backgroundColor: '#00796b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#777',
    fontSize: 14,
  },
  empty: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: height * 0.3,
  },
  centerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  msg: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
