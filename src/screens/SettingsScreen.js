import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { signOut } from 'aws-amplify/auth';

async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

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
          onPress: async () => {
            try {
              // Sign out the user
              await signOut();
              // Remove the userEmail key from AsyncStorage
              await AsyncStorage.removeItem('userEmail');
              // Navigate to the Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Error logging out:', error);
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  const handleClearAsyncStorage = async () => {
    try {
      // Check if the storage directory exists
      const directoryInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'RCTAsyncLocalStorage');
      if (!directoryInfo.exists) {
        Alert.alert('Error', 'Async Storage directory not found');
        return;
      }

      // Clear the async storage if the directory exists
      await AsyncStorage.clear();
      Alert.alert('Success', 'Async Storage Cleared Successfully');
    } catch (error) {
      console.error('Error clearing async storage:', error);
      Alert.alert('Error', 'Failed to clear async storage');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer} />
      <TouchableOpacity style={styles.button} onPress={handleClearAsyncStorage}>
        <Text style={styles.buttonText}>Clear Async Storage</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
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
  button: {
    backgroundColor: '#007AFF', // Use a color for the button
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    borderRadius: 8, // Add border radius for a rounded button
  },
  buttonText: {
    color: '#fff', // Use a contrasting color for the text
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
