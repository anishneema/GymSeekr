import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const VerificationCodeScreen = ({ navigation, route }) => {
  const { username, email } = route.params;
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerifyCode = () => {
    // Check if verification code is provided
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // Perform code verification logic here (e.g., API call to verify the code)
    // For simplicity, we'll just navigate to the reset password screen
    navigation.navigate('ResetPassword', { username, email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter Verification Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verify Code</Text>
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

export default VerificationCodeScreen;