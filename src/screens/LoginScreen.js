import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const validEmail = 'user@example.com';
    const validPassword = 'password';
  
    if (email === validEmail && password === validPassword) {
      // Reset the navigation stack and navigate to the 'Main' screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      {/* <Image source={require('../assets/github-logo.png')} style={styles.logo} /> */}
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
  // logo: {
  //   width: 72,
  //   height: 72,
  //   marginBottom: 20,
  // },
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