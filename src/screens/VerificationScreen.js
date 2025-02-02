
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { confirmSignUp } from 'aws-amplify/auth';

const VerificationScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const [verificationCode, setVerificationCode] = useState('');

  async function handleSignUpConfirmation() {
    try {
      
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username:username,
        confirmationCode:verificationCode
      });
      Alert.alert('Success', 'Sign-up confirmed. Please sign in.');
      navigation.navigate('Login');
    } catch (error) {
      console.log('error confirming sign up', error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Complete Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUpConfirmation}>
        <Text style={styles.buttonText}>Verify Code</Text>
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

export default VerificationScreen; 
