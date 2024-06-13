import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const handleLogout = () => {
    // Simulate logout logic
    // Navigate to the Login screen
    //I will be changing here
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Made for Gym enthusiasts</Text>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Welcome to Finding Nearby Gyms</Text>
          <Text style={styles.appName}>Powerlifting App</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>Find nearby gyms,</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bottomNavButton: {
    alignItems: 'center',
  },
  bottomNavLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionText: {
    fontSize: 25,
    color: '#666',
    textAlign: 'center',
  },
  workoutLogButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    marginTop: 16,
  },
  workoutLogButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
