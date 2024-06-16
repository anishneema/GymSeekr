import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutLogScreen = ({ navigation }) => {
  const [workoutLog, setWorkoutLog] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadWorkoutLog = async () => {
      try {
        const savedWorkoutLog = await AsyncStorage.getItem('@workout_log');
        if (savedWorkoutLog !== null) {
          setWorkoutLog(JSON.parse(savedWorkoutLog));
        }
      } catch (e) {
        console.error(e);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadWorkoutLog();
    });

    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <Text style={styles.dateText}>{formatDate(item.date)}</Text>
      {item.exercises && (
        <View style={styles.exerciseBox}>
          {item.exercises.map((exercise, index) => (
            <React.Fragment key={index}>
              {renderExercise({ item: exercise })}
            </React.Fragment>
          ))}
        </View>
      )}
    </View>
  );

  const filteredLog = workoutLog.filter((workout) => {
    const formattedDate = formatDate(workout.date).toLowerCase();
    const searchTextLower = searchText ? searchText.toLowerCase() : '';
  
    return (
      formattedDate.includes(searchTextLower) ||
      (workout.exercises &&
        workout.exercises.some((exercise) => {
          const exerciseName = exercise.name ? exercise.name.toLowerCase() : '';
          const weight = exercise.weight ? exercise.weight.toString().toLowerCase() : '';
  
          return (
            exerciseName.includes(searchTextLower) ||
            weight.includes(searchTextLower)
          );
        }))
    );
  });
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workout Log</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Date, Exercise, or Weight"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredLog}
        renderItem={renderWorkout}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.exerciseList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 20, // Decreased from 24
    fontWeight: 'bold',
    marginBottom: 16,
  },
  workoutContainer: {
    marginBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: '#f2f2f2',
    padding: 12, // Decreased from 16
    borderRadius: 4,
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 16, // Decreased from 18
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 14, // Decreased from 16
    color: '#666',
  },
  dateText: {
    fontSize: 18, // Decreased from 20
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseBox: {
    backgroundColor: '#e6e6e6',
    padding: 12, // Decreased from 16
    borderRadius: 8,
  },
  exerciseList: {
    paddingBottom: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
  },
});

export default WorkoutLogScreen;