import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { listWorkouts } from '../graphql/queries';
import { generateClient } from "aws-amplify/api";

const API = generateClient();

const HomeScreen = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [workoutLog, setWorkoutLog] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email) {
          setUserEmail(email);
        }
      } catch (e) {
        console.error('Error loading user email:', e);
      }
    };

    loadUserEmail();
  }, []);

  useEffect(() => {
    if (userEmail) {
      loadWorkoutLog();
    }
  }, [userEmail]);

  const loadWorkoutLog = async () => {
    if (!userEmail) return;
    try {
      const filter = {
        owner: { eq: userEmail }
      };

      const result = await API.graphql({
        query: listWorkouts,
        variables: { filter }
      });

      const workouts = result?.data?.listWorkouts?.items.filter(workout => !workout._deleted) || [];
      console.log('Fetched workouts:', workouts);
      setWorkoutLog(workouts);
      updateMarkedDates(workouts);
    } catch (e) {
      console.error('Error loading workout log:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkoutLog();
    }, [userEmail])
  );

  const updateMarkedDates = (log) => {
    const marked = log.reduce((acc, workout) => {
      const date = new Date(workout.date);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      acc[formattedDate] = { marked: true, dotColor: '#007AFF' };
      return acc;
    }, {});
    setMarkedDates(marked);
  };

  const handleDatePress = (date) => {
    const selectedDate = new Date(Date.UTC(date.year, date.month - 1, date.day)).toISOString();
    const workoutsForSelectedDate = workoutLog.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getFullYear() === date.year &&
        workoutDate.getMonth() === date.month - 1 &&
        workoutDate.getDate() === date.day
      );
    });
    console.log('Workouts for selected date:', workoutsForSelectedDate);
    if (workoutsForSelectedDate.length > 0) {
      setSelectedWorkout(workoutsForSelectedDate);
      setShowModal(true);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>{item.name}</Text>
      <Text style={styles.detailsText}>
        Sets: {item.sets} • Reps: {item.reps} • Weight: {item.weight} lbs
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>GymSeekr</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          markingType={'dot'}
          style={styles.calendar}
          theme={{
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#007AFF',
            selectedDayBackgroundColor: '#007AFF',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#007AFF',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#007AFF',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#007AFF',
            monthTextColor: '#007AFF',
            indicatorColor: '#007AFF',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 16
          }}
          onDayPress={handleDatePress}
        />
      </View>
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>Workout Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {selectedWorkout.map((workout, index) => (
                <View key={index} style={styles.workoutContainer}>
                  <Text style={styles.dateText}>{formatDate(workout.date)}</Text>
                  {workout.exercises && Array.isArray(workout.exercises.items) && workout.exercises.items.length > 0 ? (
                    <View style={styles.exerciseBox}>
                      {workout.exercises.items.map((exercise, exerciseIndex) => (
                        <React.Fragment key={exerciseIndex}>
                          {renderExercise({ item: exercise })}
                        </React.Fragment>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noExercisesText}>No exercises recorded.</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  settingsButton: {
    padding: 8,
  },
  calendarContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  workoutContainer: {
    marginBottom: 20,
  },
  exerciseContainer: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  exerciseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  exerciseBox: {
    backgroundColor: '#FFFFFF',
  },
  noExercisesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default HomeScreen;
