import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SettingsScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          onPress: () => {
            // Simulate logout logic
            // Navigate to the Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    borderWidth: 1, // Add border width
    borderColor: '#FF3B30', // Set border color to Strava red
  },
  logoutButtonText: {
    color: '#FF3B30', // Use the Strava red color
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;