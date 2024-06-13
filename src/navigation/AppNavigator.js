import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import WorkoutTrackerScreen from '../screens/WorkoutTrackerScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import NearbyGymsScreen from '../screens/NearbyGymsScreen'; // Assuming you have a NearbyGymsScreen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'WorkoutTracker') {
          iconName = 'barbell';
        } else if (route.name === 'WorkoutLog') {
          iconName = 'document-text';
        } else if (route.name === 'NearbyGyms') {
          iconName = 'map';
        } else if (route.name === 'Logout') {
          iconName = 'log-out';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="WorkoutTracker" component={WorkoutTrackerScreen} />
    <Tab.Screen name="WorkoutLog" component={WorkoutLogScreen} />
    <Tab.Screen name="NearbyGyms" component={NearbyGymsScreen} />
    <Tab.Screen
      name="Logout"
      component={LoginScreen}
      listeners={({ navigation }) => ({
        tabPress: (e) => {
          // Prevent default action of navigating to the tab
          e.preventDefault();
          // Navigate to the Login screen or perform logout action
          navigation.navigate('Login');
          // You can add your logout logic here
        },
      })}
    />
  </Tab.Navigator>
);

const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <AuthNavigator />
  </NavigationContainer>
);

export default AppNavigator;
