import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signIn, signOut } from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {

      // Check for hardcoded credentials, above
    if (email === 'hi' && password === 'hi') {
      await AsyncStorage.setItem('userEmail', email);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      return;
    }
// below
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        // Store the email as a simple identifier (not secure, just for demonstration)
        await AsyncStorage.setItem('userEmail', email);

        // Reset the navigation stack and navigate to the 'Main' screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else if (nextStep && nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        navigation.navigate('Verification', { username: email, email });
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error signing in', error.message);
      console.log('error signing in', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      await AsyncStorage.removeItem('userEmail');
      navigation.navigate('Login');
    } catch (error) {
      console.log('error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to GymSeekr</Text>
      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotScreen')}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>New to GymSeekr?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.registerLink}>Create an account</Text>
        </TouchableOpacity>
      </View>
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
  link: {
    color: '#0366d6',
    marginBottom: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#586069',
    marginRight: 5,
  },
  registerLink: {
    color: '#0366d6',
  },
});

export default LoginScreen;