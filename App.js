import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import {Amplify} from 'aws-amplify';
import amplifyconfig from './src/amplifyconfiguration.json';


Amplify.configure(amplifyconfig);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});



const App = () => {
  return <AppNavigator />;
};



export default App;

