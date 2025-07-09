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
const isWeb = Platform.OS === 'web';

// Logout confirmation modal (used for web)
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
  const { logout } = useContext(PartnerContext);
  const [pickups, setPickups] = useState([]);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Formats a given date string to DD/MM/YYYY
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = (`0${date.getDate()}`).slice(-2);
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch pickup data from the backend and sort by newest first
  const fetchPickups = async () => {
    try {
      const response = await axios.get('http://192.168.1.5:3000/pickups');
      const sorted = response.data.sort((a, b) => b.id - a.id);
      setPickups(sorted);
    } catch (err) {
      showAlert('Error', 'Failed to fetch pickups.');
    }
  };

  // Platform-aware alert handler (native vs web)
  const showAlert = (title, message) => {
    if (isWeb) {
      setAlert({ visible: true, title, message });
    } else {
      Alert.alert(title, message);
    }
  };

  // Handle logout logic
  const performLogout = async () => {
    await logout();
  };

  // Show logout confirmation modal or native alert
  const confirmLogout = () => {
    if (isWeb) {
      setShowLogoutModal(true);
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout },
      ]);
    }
  };

  // Update pickup status to "Accepted"
  const markAsAccepted = async (item) => {
    try {
      await axios.patch(`http://192.168.1.5:3000/pickups/${item.id}`, { status: 'Accepted' });
      showAlert('Success', "Pickup marked as 'Accepted'");
      fetchPickups();
    } catch {
      showAlert('Error', 'Failed to update status.');
    }
  };

  // Load pickups initially and set up polling
  useEffect(() => {
    fetchPickups();
    const intervalId = setInterval(fetchPickups, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Render each pickup request card
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PickupDetails', { pickup: item })}
    >
      <Text style={styles.cardTitle}>Pickup Date: {formatDate(item.date)}</Text>
      <Text style={styles.detail}>Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>Address: {item.address}</Text>
      <Text style={styles.detail}>Status: {item.status}</Text>

      {item.mapLink && (
        <Text style={styles.link} onPress={() => Linking.openURL(item.mapLink)}>
          Open Map
        </Text>
      )}

      {item.status === 'Pending' ? (
        <TouchableOpacity style={styles.statusButton} onPress={() => markAsAccepted(item)}>
          <Text style={styles.statusButtonText}>Mark as Accepted</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.infoText}>Tap to view more details</Text>
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
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={pickups.length === 0 && styles.centerEmpty}
          ListEmptyComponent={<Text style={styles.empty}>No pickups available.</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Alert Modal for Web */}
      {isWeb && (
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
              <Pressable
                style={alertStyles.btn}
                onPress={() => setAlert({ ...alert, visible: false })}
              >
                <Text style={alertStyles.btnText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}

      {/* Logout Modal (Web only) */}
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
    backgroundColor: '#f9f1f0',
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
    color: '#3a2e2e',
  },
  logoutText: {
    fontSize: 16,
    color: '#cc0000',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fadcd9',
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
    color: '#3a2e2e',
    marginBottom: 8,
  },
  detail: {
    fontSize: 15,
    color: '#3a2e2e',
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
    backgroundColor: '#f79489',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#f79489',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoText: {
    marginTop: 10,
    fontStyle: 'italic',
    color: '#7a6e6e',
    fontSize: 14,
  },
  empty: {
    fontSize: 16,
    color: '#7a6e6e',
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
    color: '#3a2e2e',
  },
  msg: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#f79489',
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
