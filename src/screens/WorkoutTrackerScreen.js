import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutTrackerScreen = ({ navigation }) => {
 const [exercises, setExercises] = useState([]);
 const [newExercise, setNewExercise] = useState('');
 const [newSets, setNewSets] = useState('');
 const [newReps, setNewReps] = useState('');
 const [newWeight, setNewWeight] = useState('');

 const addExercise = () => {
   if (newExercise.trim() !== '') {
     setExercises([...exercises, { name: newExercise, sets: newSets, reps: newReps, weight: newWeight }]);
     setNewExercise('');
     setNewSets('');
     setNewReps('');
     setNewWeight('');
   }
 };

 const saveWorkout = async () => {
   if (exercises.length > 0) {
     try {
       // Get the current date
       const today = new Date().toISOString().slice(0, 10);

       // Get the existing workout log from storage
       const existingWorkouts = await AsyncStorage.getItem('@workout_log');
       const workoutLogs = existingWorkouts ? JSON.parse(existingWorkouts) : [];

       // Create a new workout log entry
       const newWorkoutLog = {
         date: today,
         exercises: exercises,
       };

       // Add the new workout log to the list
       workoutLogs.push(newWorkoutLog);

       // Save the updated workout log
       await AsyncStorage.setItem('@workout_log', JSON.stringify(workoutLogs));

       // Clear the exercises array and navigate to the WorkoutLog screen
       setExercises([]);
       navigation.navigate('WorkoutLog');
     } catch (e) {
       console.error(e);
     }
   }
 };

 const renderExercise = ({ item }) => (
   <View style={styles.exerciseContainer}>
     <Text style={styles.exerciseText}>{item.name}</Text>
     <Text style={styles.detailsText}>
       Sets: {item.sets} Reps: {item.reps} Weight: {item.weight} lbs
     </Text>
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
     <FlatList
       data={exercises}
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
 exerciseList: {
   paddingBottom: 16,
 },
});

export default WorkoutTrackerScreen;