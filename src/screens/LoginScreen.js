import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import WorkoutTrackerScreen from '../screens/WorkoutTrackerScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
const Stack = createStackNavigator();
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen
                              name="WorkoutTracker"
                              component={WorkoutTrackerScreen}
                              options={{
                                title: 'Track Workout',
                                headerStyle: {
                                  backgroundColor: '#f4511e',
                                },
                                headerTintColor: '#fff',
                              }}
                            />
                            <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
    </Stack.Navigator>
   
  </NavigationContainer>
);
export default AppNavigator;

