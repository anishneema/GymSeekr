import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect called'); // Debug log
    const checkUser = async () => {
      try {
        console.log('useEffect called -check user - auth'); // Debug log
        const user = await getCurrentUser();
        console.log("whos is --"+user.signInDetails.loginId);
        if (user.signInDetails.loginId) {
          await AsyncStorage.setItem('userEmail', user.signInDetails.loginId);
          navigateToMain();
        }
      } catch (err) {
        console.log('useEffect called -check user - auth - problem'); // Debug log
        console.log(err);
        //navigation.navigate('Login'); // Replace 'Login' with your login screen name
      } finally {
        setLoading(false);
      }
    };
    console.log('useEffect called -check user -1 '); // Debug log
    checkUser();
    console.log('useEffect called -check user -2'); // Debug log
  }, []);

  const handleLogin = async () => {
    try {
      await signOut(); // Ensure any existing user is signed out
      await signIn({ username: email, password });
      
      // Store the email as a simple identifier (not secure, just for demonstration)
      await AsyncStorage.setItem('userEmail', email);

      // Reset the navigation stack and navigate to the 'Main' screen
      navigateToMain();
    } catch (error) {
      if (error.code === 'UserNotConfirmedException') {
        // Navigate to the VerificationScreen if the user needs to confirm their sign-up
        navigation.navigate('Verification', { username: email });
      } else {
        setError('Invalid email or password');
        console.log('error signing in', error);
      }
    }
  };

  function navigateToMain() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }


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
      <View style={[styles.input, error ? styles.inputError : null, styles.passwordContainer]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="gray" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  eyeIcon: {
    paddingHorizontal: 10,
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
