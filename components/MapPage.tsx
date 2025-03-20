// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Alert } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';

// const MapPage: React.FC = () => {
//   const [location, setLocation] = useState<any>(null);

//   useEffect(() => {
//     const requestPermission = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
//         return;
//       }
//       const loc = await Location.getCurrentPositionAsync({});
//       setLocation(loc.coords);
//     };

//     requestPermission();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {location ? (
//         <MapView
//           style={styles.map}
//           initialRegion={{
//             latitude: 6.4336,//location.latitude,
//               longitude: 100.1951,
//               // location.longitude,
//             latitudeDelta: 0.0922,
//             longitudeDelta: 0.0421,
//           }}
//         >
//           <Marker
//             coordinate={{
//               latitude: 6.4336,//location.latitude,
//               longitude: 100.1951,
//               // location.longitude,
//             }}
//             title="Your Locationnn"
//           />
//         </MapView>
//       ) : (
//         <Text>Loading map...</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
// });

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';

const MapPage: React.FC = () => {
  const [location, setLocation] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [pins, setPins] = useState<any[]>([]);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    };

    requestPermission();
    fetchPins('ALL'); // Load all pins initially
  }, []);

  const fetchPins = async (area: string) => {
    try {
      const residentsCollectionRef = collection(db, 'residents');
      const residentsSnapshot = await getDocs(residentsCollectionRef);

      const pinsResult: any[] = [];

      for (const residentDoc of residentsSnapshot.docs) {
        const reportsRef = collection(residentDoc.ref, 'reports');
        const q = area === 'ALL'
          ? query(reportsRef, where('status', '==', 'Pending'))
          : query(reportsRef, where('district', '==', area), where('status', '==', 'Pending'));

        const reportsSnapshot = await getDocs(q);
        reportsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.latitude && data.longitude) {
            pinsResult.push({
              id: doc.id.toString().substring(0, 5), // id of the report document from subcollection
              latitude: data.latitude,
              longitude: data.longitude,
              district: data.district,
              issue: data.issue,
              id_report: doc.id, // Using the subcollection document ID as id_report
            });
          }
        });
      }

      setPins(pinsResult);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pins.');
      console.error(error);
    }
  };

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    fetchPins(value);
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedArea}
        onValueChange={(value) => handleAreaChange(value)}
        style={styles.picker}
      >
        <Picker.Item label="ALL" value="ALL" />
        <Picker.Item label="ARAU" value="Arau" />
        <Picker.Item label="KANGAR" value="Kangar" />
        <Picker.Item label="PADANG BESAR" value="Padang Besar" />
      </Picker>
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="My Location"
            pinColor="blue" // Blue pin for current location
          />
          {pins
            .filter((pin) => pin.latitude && pin.longitude) // Validate pins
            .map((pin) => (
              <Marker
                key={pin.id}
                coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
                title={`Issue: ${pin.issue}`}
                description={`ID Report: ${pin.id}`}
              />
            ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#ffffff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
});

export default MapPage;