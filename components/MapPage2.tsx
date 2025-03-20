import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapPage2: React.FC = ({ route, navigation }: any) => {
  const { latitude, longitude } = route.params;
  const [currentLocation, setCurrentLocation] = useState<any | null>(null);

  useEffect(() => {
    const getCurrentLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };

    getCurrentLocation();
  }, []);

  const handleRoute = () => {
    if (currentLocation) {
      Alert.alert(
        'Route',
        `Routing from Current Location to Latitude: ${latitude}, Longitude: ${longitude}`
      );
      // Implement actual routing logic here
    } else {
      Alert.alert('Error', 'Unable to get current location.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title="Selected Location" />
        {currentLocation && (
          <Marker coordinate={currentLocation} title="Your Location" pinColor="blue" />
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Button title="Route" onPress={handleRoute} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default MapPage2;
