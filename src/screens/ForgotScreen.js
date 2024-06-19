import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { resetPassword } from 'aws-amplify/auth';
import { confirmResetPassword } from 'aws-amplify/auth'
import { updatePassword } from 'aws-amplify/auth';



const ForgotScreen = ({ navigation }) => {
  
  const [email, setEmail] = useState('');

  const handleSendCode = async () => {

    // Check if username and email are provided
    if ( !email) {
      Alert.alert('Error', 'Please enter valid email');
    }else{
      try {
        const output = await resetPassword({ username:email });
        handleResetPasswordNextSteps(output);
      } catch (error) {
        console.log(error);
      }
    }
  };
  
  function handleResetPasswordNextSteps(output) {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        // Collect the confirmation code from the user and pass to confirmResetPassword.
        Alert.alert(`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`);
        navigation.navigate('Reset', {username: email, email});
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        break;
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forgot Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendCode}>
        <Text style={styles.buttonText}>Send Verification Code</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Back to Login</Text>
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

export default ForgotScreen;