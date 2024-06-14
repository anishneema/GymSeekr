import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const WorkoutLogScreen = () => {
  const [workoutLog, setWorkoutLog] = useState([]);

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

  useFocusEffect(
    React.useCallback(() => {
      loadWorkoutLog();
    }, [])
  );

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{item.exercise}</Text>
      <Text style={styles.detailsText}>
        Sets: {item.sets} Reps: {item.reps} Weight: {item.weight} lbs
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workout Log</Text>
      <FlatList
        data={workoutLog}
        renderItem={renderExercise}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  exerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
  },
  exerciseList: {
    paddingBottom: 16,
  },
});

export default WorkoutLogScreen;
