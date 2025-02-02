import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Ionicons } from '@expo/vector-icons';
import { createWorkout, createExercise } from '../graphql/mutations';
import { deleteExercise as deleteExerciseMutation } from '../graphql/mutations';
import { generateClient } from "aws-amplify/api";
import DateTimePicker from '@react-native-community/datetimepicker';

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

const exerciseDatabase = [
  'Bench Press',
  'Deadlift',
  'Squat',
  'Incline Bench Press',
  'Decline Bench Press',
  'Dumbbell Shoulder Press',
  'Lateral Raise',
  'Front Raise',
  'Push Press',
  'Military Press',
  'Bicep Curls',
  'Hammer Curl',
  'Concentration Curl',
  'Preacher Curl',
  'Barbell Row',
  'Front Squat',
  'Romanian Deadlift',
  'Leg Press',
  'Dumbbell Bench',
  'Pullups',
  'Running'
];

const WorkoutTrackerScreen = ({ navigation }) => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [newSets, setNewSets] = useState('');
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const email = await EncryptedStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadUserEmail();
  }, []);

  useEffect(() => {
    if (newExercise.length >= 2) {
      const filteredSuggestions = exerciseDatabase.filter(exercise =>
        exercise.toLowerCase().startsWith(newExercise.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [newExercise]);

  const addExercise = () => {
    if (newExercise.trim() !== '') {
      const exercise = {
        name: newExercise,
        sets: newSets ? parseInt(newSets, 10) : 0,
        reps: newReps ? parseInt(newReps, 10) : 0,
        weight: newWeight ? parseFloat(newWeight) : 0
      };

      setExercises([...exercises, exercise]);
      setNewExercise('');
      setNewSets('');
      setNewReps('');
      setNewWeight('');
      setSuggestions([]);
    }
  };

  const saveWorkout = async () => {
 
    if (exercises.length > 0 && userEmail) {
      const workout = {
        date: workoutDate.toISOString(), // Use the selected workoutDate
        userEmail: userEmail
      };

      try {
        // Create the workout
        const result = await API.graphql({
          query: createWorkout,
          variables: { input: workout }
        });

        const workoutId = result.data.createWorkout.id;
        // Save each exercise and associate it with the workout
        for (const exercise of exercises) {
          await API.graphql({
            query: createExercise,
            variables: { input: { ...exercise, date: workoutDate.toISOString(), userEmail: userEmail,workoutID: workoutId }}
          });
        }

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

  const confirmDeleteExercise = (rowKey, rowMap) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => rowMap[rowKey] && rowMap[rowKey].closeRow() },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExercise(rowKey, rowMap) },
      ],
      { cancelable: true }
    );
  };

  const deleteExercise = async (rowKey, rowMap) => {
    const exerciseToDelete = exercises[rowKey];

    if (exerciseToDelete && exerciseToDelete.id && exerciseToDelete._version !== undefined) {
      try {
        await API.graphql({
          query: deleteExerciseMutation,
          variables: { input: { id: exerciseToDelete.id, _version: exerciseToDelete._version } }
        });

        const newData = [...exercises];
        newData.splice(rowKey, 1);
        setExercises(newData);
      } catch (e) {
        console.error('Error deleting exercise:', e);
      }
    } else {
      const newData = [...exercises];
      newData.splice(rowKey, 1);
      setExercises(newData);
    }

    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const renderExercise = (data) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{data.item.name}</Text>
      <Text style={styles.detailsText}>
        Sets: {data.item.sets} • Reps: {data.item.reps} • Weight: {data.item.weight} lbs
      </Text>
    </View>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={styles.backRightBtn}
        onPress={() => confirmDeleteExercise(data.index, rowMap)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setWorkoutDate(selectedDate);
      if (Platform.OS === 'android') {
        setShowDatePicker(false); // Hide date picker on Android after selecting date
      }
    }
  };

  const handleSuggestionClick = (exercise) => {
    setNewExercise(exercise);
    timeoutRef.current = setTimeout(() => {
      setSuggestions([]);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
        <View style={styles.datePickerContainer}>
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              style={styles.datePicker}
              value={workoutDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()} // Restrict to current date or earlier
            />
          ) : (
            <View>
              <TouchableOpacity style={styles.datePickerBox} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>{workoutDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={workoutDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()} // Restrict to current date or earlier
                />
              )}
            </View>
          )}
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.dropdownContainer}>
            <TextInput
              style={styles.input}
              placeholder="Exercise"
              value={newExercise}
              onChangeText={setNewExercise}
              placeholderTextColor={colors.lightText}
            />
            {suggestions.length > 0 && (
              <View style={styles.dropdown}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleSuggestionClick(suggestion)}
                  >
                    <Text style={styles.dropdownText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Sets"
              value={newSets}
              onChangeText={setNewSets}
              keyboardType="numeric"
              placeholderTextColor={colors.lightText}
            />
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Reps"
              value={newReps}
              onChangeText={setNewReps}
              keyboardType="numeric"
              placeholderTextColor={colors.lightText}
            />
            <TextInput
              style={[styles.input, styles.inputSmall]}
              placeholder="Weight"
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              placeholderTextColor={colors.lightText}
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
          onRowOpen={(rowKey, rowMap) => {
            confirmDeleteExercise(rowKey, rowMap);
          }}
          style={styles.swipeListView}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    zIndex: 0,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: 5,
    zIndex: 0,
  },
  datePickerBox: {
    width: 150,
    height: 40,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  dateText: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  datePicker: {
    width: 125,
    height: 75,
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    position: 'relative',
    zIndex: 10,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000, // Ensures dropdown appears above other elements
  },
  input: {
    height: 48,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.darkGrey,
  },
  inputSmall: {
    width: '30%',
    marginRight: 5,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    borderRadius: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    zIndex: 1000,
  },
  dropdownText: {
    color: colors.darkGrey,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 0,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    zIndex: 0,
  },
  clearButton: {
    backgroundColor: colors.lightGrey,
    marginRight: 0,
    zIndex: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: colors.darkGrey,
  },
  saveButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 0,
  },
  swipeListView: {
    paddingHorizontal: 20,
  },
  exerciseContainer: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.darkGrey,
  },
  detailsText: {
    fontSize: 14,
    color: colors.mediumGrey,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: colors.red,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    backgroundColor: colors.red,
    right: 0,
    borderRadius: 5,
  },
});

export default WorkoutTrackerScreen;
