import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutLogScreen = ({ navigation }) => {
  const [workoutLog, setWorkoutLog] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('date'); // Default search type

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

  const renderExercise = ({ item, index }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{item.exercise}</Text>
      <Text style={styles.detailsText}>
        Sets: {item.sets} Reps: {item.reps} Weight: {item.weight} lbs
      </Text>
      {item.date && <Text style={styles.dateText}>Date: {item.date}</Text>}
    </View>
  );

  const renderWorkout = ({ item }) => (
    <View>
      {Array.isArray(item) ? (
        item.map((exercise, index) => (
          <React.Fragment key={index}>
            {renderExercise({ item: exercise, index })}
          </React.Fragment>
        ))
      ) : (
        <Text>Invalid workout data</Text>
      )}
    </View>
  );

  const handleSearch = (text, type) => {
    setSearchText(text);
    setSearchType(type);
  };

  const filteredLog = workoutLog.filter((workout) =>
    Array.isArray(workout)
      ? workout.some((exercise) =>
          exercise[searchType]?.toLowerCase().includes(searchText.toLowerCase())
        )
      : false
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Workout Log</Text>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search by ${searchType}`}
          value={searchText}
          onChangeText={(text) => handleSearch(text, searchType)}
        />
        <View style={styles.searchButtons}>
          <TouchableOpacity
            style={searchType === 'date' ? styles.activeButton : styles.inactiveButton}
            onPress={() => setSearchType('date')}
          >
            <Text>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={searchType === 'exercise' ? styles.activeButton : styles.inactiveButton}
            onPress={() => setSearchType('exercise')}
          >
            <Text>Exercise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={searchType === 'weight' ? styles.activeButton : styles.inactiveButton}
            onPress={() => setSearchType('weight')}
          >
            <Text>Weight</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
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
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  activeButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  inactiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default WorkoutLogScreen;

