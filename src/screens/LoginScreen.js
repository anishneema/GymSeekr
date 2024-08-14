import React, { useState, useEffect, useCallback,useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { signIn, signOut,getCurrentUser } from 'aws-amplify/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.signInDetails?.loginId) {
          await EncryptedStorage.setItem("userEmail", user.signInDetails.loginId);
          setIsLoggedIn(true);
          navigateToMain();
        }
      } catch (err) {
        if (err.name === 'UserUnAuthenticatedException') {
          // Silently ignore the exception
        } else if (err.name === 'UserAlreadyAuthenticatedException'){
                await signOut();
        } else {
          console.error('Error checking user: ', err);
        }
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [navigation]);


  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const signinOutput = await signIn({ username: emailRef.current, password:passwordRef.current });
      if(signinOutput.isSignedIn){
        await EncryptedStorage.setItem('userEmail', emailRef.current);
        navigateToMain();
        setIsLoggedIn(true);
      }else{
        if (signinOutput.nextStep.signInStep == 'CONFIRM_SIGN_UP'){
          navigation.navigate('Verification', { username: emailRef.current });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.name === 'UserNotConfirmedException') {
        navigation.navigate('Verification', { username: emailRef.current });
      } else if(error.name === 'NotAuthorizedException'){
            setError('Invalid email or password');
      }else {
        setError('Invalid email or password');
        console.error('Error signing in', error);
      }
    } finally {
      setLoading(false);
    }
  }, [emailRef.current, passwordRef.current, navigation]);

  const navigateToMain = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }, [navigation]);

  const handleEmailChange = useCallback((text) => { emailRef.current = text;}, []);
  const handlePasswordChange = useCallback((text) => { passwordRef.current = text;}, []);
  const toggleShowPassword = useCallback(() => setShowPassword(prev => !prev), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isLoggedIn || loading) {
    return null; // Render nothing if the user is already logged in
  }
  console.log("returning login screen");
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to GymSeekr</Text>
      <TextInput
        style={styles.input}
        defaultValue={emailRef.current}
        onChangeText={handleEmailChange}
        placeholder="Email address"
        autoCapitalize="none"
        accessibilityLabel="Email address input"
      />
      <View style={[styles.passwordContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.passwordInput}
          defaultValue={passwordRef.current}
          onChangeText={handlePasswordChange}
          placeholder="Password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          accessibilityLabel="Password input"
        />
        <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
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
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5da',
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
