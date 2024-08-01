import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { signOut } from 'aws-amplify/auth';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primary: '#026bd9', // Steel Blue
  secondary: '#4A90E2', // Dodger Blue (used sparingly for emphasis)
  background: '#E9F0F7', // Light blue-grey background
  white: '#FFFFFF', // White
  lightGrey: '#D0D8E0', // Light grey
  mediumGrey: '#2d4150', // Medium grey
  darkGrey: '#333333', // Dark grey
  lightText: '#666666', // Light grey text
};

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
          onPress: () => {
            signOut();
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

  const handleClearAsyncStorage = async () => {
    try {
      const directoryInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'RCTAsyncLocalStorage');
      if (!directoryInfo.exists) {
        Alert.alert('Error', 'Async Storage directory not found');
        return;
      }

      await AsyncStorage.clear();
      Alert.alert('Success', 'Async Storage Cleared Successfully');
    } catch (error) {
      console.error('Error clearing async storage:', error);
      Alert.alert('Error', 'Failed to clear async storage');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerStripe} />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>Settings</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <TouchableOpacity style={styles.button} onPress={handleClearAsyncStorage}>
          <Ionicons name="trash-outline" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Clear Async Storage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerStripe: {
    backgroundColor: colors.primary,
    height: 0,
    marginTop: 47,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 0, // Adjust this to position the text similarly to the HomeScreen
  },
  settingsButton: {
    padding: 8,
    color: colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
});

export default SettingsScreen;
