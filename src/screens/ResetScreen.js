import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const ResetScreen = ({ navigation, route }) => {
  const { username, email } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    // Check if new password and confirm password are provided
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both fields');
      return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Perform password reset logic here (e.g., API call to update the password)
    // For simplicity, we'll just navigate to the login screen
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotScreen')}>
        <Text style={styles.backLink}>Back to Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f6f8fa',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#24292e',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5da',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0366d6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  loginLink: {
    color: '#0366d6',
  },
});

export default ResetScreen;