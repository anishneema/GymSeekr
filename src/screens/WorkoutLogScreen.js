import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Ionicons } from '@expo/vector-icons';
import { listWorkouts } from '../graphql/queries';
import { generateClient } from "aws-amplify/api";
import { deleteWorkout as deleteWorkoutMutation } from '../graphql/mutations';

const API = generateClient();
const colors = {
  primary: '#026bd9', // Steel Blue
  secondary: '#4A90E2', // Dodger Blue
  background: '#E9F0F7', // Light blue-grey background
  white: '#FFFFFF', // White
  lightGrey: '#D0D8E0', // Light grey
  mediumGrey: '#2d4150', // Medium grey
  darkGrey: '#333333', // Dark grey
  lightText: '#666666', // Light grey text
};

const WorkoutLogScreen = ({ navigation }) => {
  const [workoutLog, setWorkoutLog] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const loadUserEmailAndLog = async () => {
      try {
        const email = await EncryptedStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
          loadWorkoutLog(email);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadUserEmailAndLog();
    });

    return unsubscribe;
  }, [navigation]);

  const loadWorkoutLog = async (email) => {
    try {
      const result = await API.graphql({
        query: listWorkouts,
      //  variables: { filter }
      });

      const workouts = result?.data?.listWorkouts?.items.filter(workout => !workout._deleted) || [];
      const sortedWorkouts = workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      //console.log('Fetched workouts in log:', workouts);
      setWorkoutLog(sortedWorkouts);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{item.name}</Text>
      <Text style={styles.detailsText}>
        Sets: {item.sets} Reps: {item.reps} Weight: {item.weight} lbs
      </Text>
    </View>
  );

  const renderWorkout = ({ item }) => (
    <View style={styles.workoutContainer}>
      <View style={styles.workoutHeader}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteWorkout(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      {Array.isArray(item.exercises?.items) && (
        <View style={styles.exerciseBox}>
          {item.exercises.items.map((exercise, exerciseIndex) => (
            <React.Fragment key={exerciseIndex}>{renderExercise({ item: exercise })}</React.Fragment>
          ))}
        </View>
      )}
    </View>
  );

  const confirmDeleteWorkout = (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workoutId),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteWorkout = async (workoutId) => {
    try {
      const workoutToDelete = workoutLog.find(workout => workout.id === workoutId);
      if (workoutToDelete && workoutToDelete.id && workoutToDelete._version !== undefined) {
        await API.graphql({
          query: deleteWorkoutMutation,
          variables: { input: { id: workoutToDelete.id, _version: workoutToDelete._version } }
        });
        setWorkoutLog((prevWorkoutLog) => prevWorkoutLog.filter(workout => workout.id !== workoutId));
      }
    } catch (e) {
      console.error('Error deleting workout:', e);
    }
  };

  const filteredLog = workoutLog.filter((workout) => {
    const formattedDate = formatDate(workout.date).toLowerCase();
    const searchTextLower = searchText ? searchText.toLowerCase() : '';

    return (
      formattedDate.includes(searchTextLower) ||
      (Array.isArray(workout.exercises?.items) &&
        workout.exercises.items.some((exercise) => {
          const exerciseName = exercise.name ? exercise.name.toLowerCase() : '';
          const weight = exercise.weight ? exercise.weight.toString().toLowerCase() : '';
          const sets = exercise.sets ? exercise.sets.toString().toLowerCase() : '';
          const reps = exercise.reps ? exercise.reps.toString().toLowerCase() : '';

          return (
            exerciseName.includes(searchTextLower) ||
            weight.includes(searchTextLower) ||
            sets.includes(searchTextLower) ||
            reps.includes(searchTextLower)
          );
        }))
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Workout Log</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Date, Exercise, or Weight"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#666"
        />
      </View>
      <FlatList
        data={filteredLog}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  workoutContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  exerciseBox: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 10,
  },
  exerciseContainer: {
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  deleteButton: {
    padding: 8,
  },
});

export default WorkoutLogScreen;
