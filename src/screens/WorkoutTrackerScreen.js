import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutTrackerScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [newSets, setNewSets] = useState('');
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');

  const addExercise = () => {
    if (newExercise.trim() !== '') {
      setExercises([...exercises, { key: `${Date.now()}`, name: newExercise, sets: newSets, reps: newReps, weight: newWeight }]);
      setNewExercise('');
      setNewSets('');
      setNewReps('');
      setNewWeight('');
    }
  };

  const saveWorkout = async () => {
    if (exercises.length > 0) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const existingWorkouts = await AsyncStorage.getItem('@workout_log');
        const workoutLogs = existingWorkouts ? JSON.parse(existingWorkouts) : [];
        const newWorkoutLog = { date: today, exercises: exercises };
  
        // Prepend the new workout log to the existing logs array
        workoutLogs.unshift(newWorkoutLog);
  
        await AsyncStorage.setItem('@workout_log', JSON.stringify(workoutLogs));
  
        setExercises([]);
        navigation.navigate('WorkoutLog');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const confirmDeleteExercise = (rowKey) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExercise(rowKey),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteExercise = (rowKey) => {
    setExercises((prevExercises) => prevExercises.filter((exercise) => exercise.key !== rowKey));
  };

  const renderExercise = (data) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{data.item.name}</Text>
      <Text style={styles.detailsText}>
        Sets: {data.item.sets} Reps: {data.item.reps} Weight: {data.item.weight} lbs
      </Text>
    </View>
  );

  const renderHiddenItem = () => (
    <View style={styles.rowBack}>
      <View style={styles.backRightBtn}>
        <Text style={styles.backTextWhite}>Delete</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workout Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise"
        value={newExercise}
        onChangeText={setNewExercise}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Sets"
          value={newSets}
          onChangeText={setNewSets}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Reps"
          value={newReps}
          onChangeText={setNewReps}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Weight"
          value={newWeight}
          onChangeText={setNewWeight}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={addExercise}>
        <Text style={styles.buttonText}>Add Exercise</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={saveWorkout}>
        <Text style={styles.buttonText}>Save Workout</Text>
      </TouchableOpacity>
      <SwipeListView
        data={exercises}
        renderItem={renderExercise}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-Dimensions.get('window').width}
        onRowOpen={(rowKey, rowMap) => {
          setTimeout(() => {
            confirmDeleteExercise(rowKey);
            rowMap[rowKey].closeRow();
          }, 250);
        }}
        disableRightSwipe
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        useNativeDriver={false}
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
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSmall: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
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
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#FF3B30', // Nicer shade of red
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8, // Ensures no red line underneath
    borderRadius: 4,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    backgroundColor: '#FF3B30', // Nicer shade of red
    right: 0,
    borderRadius: 4,
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default WorkoutTrackerScreen;
