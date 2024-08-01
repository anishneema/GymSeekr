import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import ForgotScreen from '../screens/ForgotScreen';
import WorkoutTrackerScreen from '../screens/WorkoutTrackerScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import NearbyGymsScreen from '../screens/NearbyGymsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ResetScreen from '../screens/ResetScreen';
import GymDetailsScreen from '../screens/GymDetailsScreen'; // Add this import


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const HomeStack = ({ navigation }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{
        headerShown: false,
        headerRight: () => (
          <Ionicons
            name="settings-outline"
            size={24}
            color="#007AFF"
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate('Settings')}
          />
        ),
      }}
    />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);


const NearbyGymsStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="NearbyGymsScreen"
      component={NearbyGymsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="GymDetails"
      component={GymDetailsScreen}
      options={{ title: 'Gym Details' }}
    />
  </Stack.Navigator>
);


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
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
    <Tab.Screen name="WorkoutTracker" component={WorkoutTrackerScreen} options={{ headerShown: false  }} />
    <Tab.Screen name="WorkoutLog" component={WorkoutLogScreen} options={{ headerShown: false }} />
    <Tab.Screen name="NearbyGyms" component={NearbyGymsStack} options={{ title: 'Gyms', headerShown: false }} />
  </Tab.Navigator>
);


const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="ForgotScreen" component={ForgotScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Reset" component={ResetScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
  </Stack.Navigator>
);


const AppNavigator = () => (
  <NavigationContainer>
    <AuthNavigator />
  </NavigationContainer>
);


export default AppNavigator;