import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, SafeAreaView, StatusBar } from 'react-native';
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
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const existingWorkouts = await AsyncStorage.getItem('@workout_log');
        const workoutLogs = existingWorkouts ? JSON.parse(existingWorkouts) : [];
        const newWorkoutLog = { date: today, exercises: exercises };


        workoutLogs.unshift(newWorkoutLog);


        await AsyncStorage.setItem('@workout_log', JSON.stringify(workoutLogs));


        setExercises([]);
        navigation.navigate('WorkoutLog');
      } catch (e) {
        console.error(e);
      }
    }
  };


  const clearExercises = () => {
    Alert.alert(
      'Clear All Exercises',
      'Are you sure you want to clear all exercises?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setExercises([]),
        },
      ],
      { cancelable: true }
    );
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.heading}>Workout Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Exercise"
        value={newExercise}
        onChangeText={setNewExercise}
        placeholderTextColor="#999"
      />
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Sets"
          value={newSets}
          onChangeText={setNewSets}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Reps"
          value={newReps}
          onChangeText={setNewReps}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Weight"
          value={newWeight}
          onChangeText={setNewWeight}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={addExercise}>
          <Text style={styles.buttonText}>Add Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearExercises}>
          <Text style={[styles.buttonText, styles.clearButtonText]}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
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
        style={styles.swipeListView}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginLeft: 5, // Slightly shifted to the right
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputSmall: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#3A7CA5', // Muted blue color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#C74444', // Muted red color
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButtonText: {
    color: '#FFF',
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Muted green color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  exerciseContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#C74444', // Muted red color
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 8,
    marginBottom: 10,
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: Dimensions.get('window').width,
    borderRadius: 8,
    backgroundColor: '#C74444', // Muted red color
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  swipeListView: {
    marginTop: 20,
  },
});


export default WorkoutTrackerScreen;
