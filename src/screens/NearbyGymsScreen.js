import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, Text, SafeAreaView, StatusBar, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { gymData } from './Database'; // Ensure this is correctly imported and populated
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { GOOGLE_MAPS_API_KEY } from '../../config.js';

const NearbyGymScreen = () => {
  const [gymSearchQuery, setGymSearchQuery] = useState('');
  const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.7514772,
    longitude: -121.8937815,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const mapRef = useRef(null); // Reference to the MapView

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Adjust the map region to include all markers
    if (filteredGyms.length > 0) {
      mapRef.current.fitToCoordinates(
        filteredGyms
          .filter(gym => gym.location && gym.location.lat && gym.location.lng) // Ensure valid coordinates
          .map(gym => ({
            latitude: gym.location.lat,
            longitude: gym.location.lng,
          })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [filteredGyms]);

  const handleRegionChange = (region) => {
    setMapRegion(region);
  };

  const fetchNearbyGyms = async () => {
    setIsLoading(true);
    try {
      const centerLocation = `${mapRegion.latitude},${mapRegion.longitude}`;
      const searchKeyword = gymSearchQuery.trim() || 'gym';
      
      // Filter local gymData first
      let localGyms = gymData.filter(gym =>
        gym.name.toLowerCase().includes(searchKeyword.toLowerCase()) &&
        gym.equipment.some(eq =>
          eq.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
        )
      );

      // If local gyms are fewer than 7, fetch from Google Maps
      if (localGyms.length < 7) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_MAPS_API_KEY}&location=${centerLocation}&radius=50000&keyword=${searchKeyword}&rankby=prominence`
        );
        const data = await response.json();

        const additionalGyms = data.results.filter(gym => 
          !localGyms.some(localGym => localGym.name === gym.name)
        ).slice(0, 7 - localGyms.length); // Limit results to fill up to 7 gyms

        // Map additional gyms to match local gymData structure
        const mappedAdditionalGyms = additionalGyms.map(gym => ({
          id: gym.place_id,
          name: gym.name,
          address: gym.vicinity,
          equipment: ['Information not available'],
          hours: 'Information not available',
          description: 'No additional information available.',
          location: {
            lat: gym.geometry?.location?.lat || 0,
            lng: gym.geometry?.location?.lng || 0,
          }
        }));

        localGyms = [...localGyms, ...mappedAdditionalGyms];
      }

      setGyms(localGyms);
      setFilteredGyms(localGyms);
    } catch (error) {
      console.error('Error fetching nearby gyms:', error);
      Alert.alert('Error', 'Failed to fetch nearby gyms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (gym) => {
    const gymDetails = gymData.find(g => g.name === gym.name) || {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      equipment: ['Information not available'],
      hours: 'Information not available',
      description: 'No additional information available.',
    };
    navigation.navigate('GymDetails', { gym: gymDetails });
  };

  const handleSearch = debounce(() => {
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
        const filtered = gyms.filter(gym => {
          const gymDetails = gymData.find(g => g.name === gym.name);
          return gymDetails ? gymDetails.equipment.some(eq =>
            eq.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
          ) : false;
        }).slice(0, 7); // Limit filtered results to 7 gyms
        setFilteredGyms(filtered);
      }
    });
  }, 500); // 500 milliseconds delay

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Gyms</Text>
      </View>
      <Animated.View style={[styles.searchContainer, { opacity: fadeAnim }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={24} color="#1E88E5" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search for gyms"
            placeholderTextColor="#999"
            value={gymSearchQuery}
            onChangeText={setGymSearchQuery}
          />
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="barbell" size={24} color="#1E88E5" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Filter by equipment (min 3 chars)"
            placeholderTextColor="#999"
            value={equipmentSearchQuery}
            onChangeText={setEquipmentSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </Animated.View>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        onRegionChangeComplete={handleRegionChange}
      >
        {filteredGyms.map((gym, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: gym.location?.lat || 0,
              longitude: gym.location?.lng || 0,
            }}
            title={gym.name}
            onPress={() => handleMarkerPress(gym)}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="fitness" size={24} color="#1E88E5" />
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{filteredGyms.length} gyms found</Text>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Ionicons name="fitness" size={50} color="#FFF" />
          <Text style={styles.loadingText}>Searching for gyms...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1E88E5',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#1E88E5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 136, 229, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default NearbyGymScreen;
