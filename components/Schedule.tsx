import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const Schedule: React.FC = () => {
  const [district, setDistrict] = useState<string>('Arau');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Updated to manage loading
  const navigation = useNavigation<any>();

  const fetchData = async (selectedDistrict: string) => {
    setLoading(true); // Start loading
    try {
      const collectionRef = collection(db, 'residents');
      const residentsSnapshot = await getDocs(collectionRef);
      const result: any[] = [];

      for (const residentDoc of residentsSnapshot.docs) {
        const reportsRef = collection(residentDoc.ref, 'reports');
        const q = query(reportsRef, where('district', '==', selectedDistrict), where('status', '==', 'Pending'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          result.push({
            residentID: residentDoc.id,
            subDocID: doc.id,
            id: doc.id.substring(0, 5),
            district: data.district,
            issue: data.issue,
            latitude: data.latitude,
            longitude: data.longitude,
            status: data.status,
          });
        });
      }

      setData(result);
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleGetLocation = (lat: number, lon: number) => {
    Alert.alert('Location', `Opening location: Latitude ${lat}, Longitude ${lon}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url).catch((err) => console.error('Error opening URL: ', err));
  };

  const handleUpdate = (residentID: string, subDocID: string) => {
    navigation.navigate('SubmitPage', { residentID, subDocID });
  };

  useEffect(() => {
    fetchData(district);
  }, [district]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Waste Management</Text>
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select District:</Text>
        <Picker
          selectedValue={district}
          onValueChange={(value) => setDistrict(value)}
          style={styles.picker}
        >
          <Picker.Item label="Arau" value="Arau" />
          <Picker.Item label="Kangar" value="Kangar" />
          <Picker.Item label="Padang Besar" value="Padang Besar" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.residentID}-${item.subDocID}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.issueTitle}>{item.issue} - {item.id}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleGetLocation(item.latitude, item.longitude)}
                >
                  <Text style={styles.buttonText}>View Location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleUpdate(item.residentID, item.subDocID)}
                >
                  <Text style={styles.buttonText}>Update Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#34495e',
  },
  picker: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
  },
  card: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#1abc9c',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default Schedule;
