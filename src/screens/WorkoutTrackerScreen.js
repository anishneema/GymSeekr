import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';


const WorkoutTrackerScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [newSets, setNewSets] = useState('');
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [userEmail, setUserEmail] = useState(null);


  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
        }
      } catch (e) {
        console.error(e);
      }
    };


    loadUserEmail();
  }, []);


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
    if (exercises.length > 0 && userEmail) {
      try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const workoutLogKey = `@workout_log_${userEmail}`;
        const existingWorkouts = await AsyncStorage.getItem(workoutLogKey);
        const workoutLogs = existingWorkouts ? JSON.parse(existingWorkouts) : [];
        const newWorkoutLog = { date: today, exercises: exercises };


        workoutLogs.unshift(newWorkoutLog);


        await AsyncStorage.setItem(workoutLogKey, JSON.stringify(workoutLogs));


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
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => setExercises([]) },
      ],
      { cancelable: true }
    );
  };


  const confirmDeleteExercise = (rowKey) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExercise(rowKey) },
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
        Sets: {data.item.sets} • Reps: {data.item.reps} • Weight: {data.item.weight} lbs
      </Text>
    </View>
  );


  const renderHiddenItem = () => (
    <View style={styles.rowBack}>
      <View style={styles.backRightBtn}>
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      </View>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Workout Tracker</Text>
        </View>
        <View style={styles.inputContainer}>
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
          rightOpenValue={-75}
          disableRightSwipe
          onRowOpen={(rowKey) => {
            confirmDeleteExercise(rowKey);
          }}
          useNativeDriver={false}
          style={styles.swipeListView}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  inputContainer: {
    padding: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSmall: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  clearButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButtonText: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  exerciseContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  swipeListView: {
    paddingHorizontal: 20,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
  },
});


export default WorkoutTrackerScreen;