import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, Text, SafeAreaView, StatusBar, Animated, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { gymData } from './Database';

var GOOGLE_MAPS_API_KEY = "";

if(Platform.OS=='android'){
  GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAP_API_KEY;
} 

if( Platform.OS=='ios'){
  GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_IOS_GOOGLE_MAP_API_KEY;
}

const colors = {
  primary: '#026bd9',
  secondary: '#4A90E2',
  background: '#E9F0F7',
  white: '#FFFFFF',
  lightGrey: '#D0D8E0',
  mediumGrey: '#2d4150',
  darkGrey: '#333333',
  lightText: '#666666',
};

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
};

const NearbyGymScreen = () => {
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [mapRegion, setMapRegion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      setMapRegion({
        latitude: 37.7514772,
        longitude: -121.8937815,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };

  const handleRegionChange = (region) => {
    setMapRegion(region);
    if (equipmentSearchQuery.length >= 3) {
      filterGymsByEquipmentAndRegion(region);
    }
  };

  const filterGymsByEquipmentAndRegion = (region) => {
    const filtered = gymData.filter(gym => {
      return gym.equipment.some(eq => eq.toLowerCase().includes(equipmentSearchQuery.toLowerCase())) &&
        getDistanceFromLatLonInMeters(gym.latitude, gym.longitude, region.latitude, region.longitude) <= (region.latitudeDelta * 111000 / 2) && // Convert latitudeDelta to meters
        getDistanceFromLatLonInMeters(gym.latitude, gym.longitude, region.latitude, region.longitude) <= (region.longitudeDelta * 111000 / 2); // Convert longitudeDelta to meters
    }).slice(0, 7);

    setFilteredGyms(filtered);
  };

  const fetchNearbyGyms = async () => {
    setIsLoading(true);
    try {
      const centerLocation = `${mapRegion.latitude},${mapRegion.longitude}`;
      const searchKeyword = gymSearchQuery.trim() || 'gym';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_MAPS_API_KEY}&location=${centerLocation}&radius=7000&keyword=${searchKeyword}`
      );
      const data = await response.json();
      setGyms(data.results.slice(0, 7));
      setFilteredGyms(data.results.slice(0, 7));
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      Alert.alert('Error', 'Failed to fetch nearby gyms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (gym) => {
    let closestGym = null;
    let minDistance = Infinity;

    gymData.forEach(dbGym => {
      const distance = getDistanceFromLatLonInMeters(
        gym.latitude || gym.geometry?.location?.lat || 0,
        gym.longitude || gym.geometry?.location?.lng || 0,
        dbGym.latitude,
        dbGym.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestGym = dbGym;
      }
    });

    if (closestGym && minDistance <= 300) {
      navigation.navigate('GymDetails', { gymId: closestGym.id });
    } else {
      const fallbackGymDetails = {
        id: gym.id,
        name: gym.name,
        address: gym.vicinity,
        equipment: ['Information not available'],
        hours: 'Information not available',
        description: 'Information not available.',
      };
      navigation.navigate('GymDetails', { gymId: fallbackGymDetails.id });
    }
  };

  const handleSearch = () => {
    if (gymSearchQuery.trim() === '' && equipmentSearchQuery.trim() === '') {
      setGyms([]);
      setFilteredGyms([]);
      return;
    }

    if (equipmentSearchQuery.length > 0 && equipmentSearchQuery.length < 3) {
      Alert.alert('Error', 'Equipment search query must be at least 3 characters long.');
      return;
    }

    fetchNearbyGyms().then(() => {
      if (equipmentSearchQuery.length >= 3) {
        filterGymsByEquipmentAndRegion(mapRegion);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Gyms</Text>
      </View>
      <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={24} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search for gyms"
            placeholderTextColor={colors.lightText}
            value={gymSearchQuery}
            onChangeText={setGymSearchQuery}
          />
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="barbell" size={24} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Filter by equipment (min 3 chars)"
            placeholderTextColor={colors.lightText}
            value={equipmentSearchQuery}
            onChangeText={setEquipmentSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </Animated.View>
      {mapRegion && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          onRegionChangeComplete={handleRegionChange}
        >
          {filteredGyms.map((gym, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: gym.latitude || gym.geometry?.location?.lat || 0,
                longitude: gym.longitude || gym.geometry?.location?.lng || 0,
              }}
              title={gym.name}
              onPress={() => handleMarkerPress(gym)}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="fitness" size={24} color={colors.primary} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{filteredGyms.length} gyms found</Text>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Ionicons name="fitness" size={50}
            color={colors.white} />
            <Text style={styles.loadingText}>Searching for gyms...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      padding: 20,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.white,
    },
    searchContainer: {
      padding: 15,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 10,
      marginBottom: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.lightGrey,
    },
    searchIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: colors.darkGrey,
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      marginTop: 10,
    },
    searchButtonText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 18,
    },
    map: {
      flex: 1,
    },
    markerContainer: {
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 8,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    footer: {
      backgroundColor: colors.white,
      padding: 15,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey,
    },
    footerText: {
      fontSize: 16,
      color: colors.mediumGrey,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colors.white,
      fontSize: 18,
      marginTop: 10,
    },
  });
  
  export default NearbyGymScreen;
  