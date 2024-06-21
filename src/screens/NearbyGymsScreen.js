import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Button,Alert } from 'react-native';
import { GOOGLE_MAPS_API_KEY } from '../../config.js';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const NearbyGymScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gyms, setGyms] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  const fetchNearbyGyms = async () => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_MAPS_API_KEY}&location=${userLocation ? `${userLocation.latitude},${userLocation.longitude}` : '37.78825,-122.4324'}&radius=5000&keyword=${searchQuery}`);
      const data = await response.json();
      console.log(data.results);
      
      setGyms(data.results);
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for gyms"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={fetchNearbyGyms} />
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 37.78825,
          longitude: userLocation ? userLocation.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {gyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.geometry.location.lat,
              longitude: gym.geometry.location.lng,
            }}
            title={gym.name}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  map: {
    flex: 1,
  },
});

export default NearbyGymScreen;