import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView, SafeAreaView, StatusBar, Share } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { listWorkouts } from '../graphql/queries';
import { generateClient } from "aws-amplify/api";

const API = generateClient();
const colors = {
  primary: '#026bd9', // Steel Blue
  secondary: '#4A90E2', // Dodger Blue (used sparingly for emphasis)
  background: '#E9F0F7', // Light blue-grey background
  white: '#FFFFFF', // White
  lightGrey: '#D0D8E0', // Light grey
  mediumGrey: '#2d4150', // Medium grey
  darkGrey: '#333333', // Dark grey
  lightText: '#666666', // Light grey text
};

const quotes = [
  "The hardest part is over. You showed up.",
  "If you think you can't, change your mind.",
  "I am. I can. I will. I do.",
  "You miss 100 percent of the shots you never take.",
];

const HomeScreen = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [workoutLog, setWorkoutLog] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
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
      setQuoteIndex(Math.floor(Math.random() * quotes.length));
    }, [userEmail])
  );

  const updateMarkedDates = (log) => {
    const marked = log.reduce((acc, workout) => {
      const date = new Date(workout.date);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      acc[formattedDate] = { marked: true, dotColor: colors.primary };
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

  const calculateWeeklySummary = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek); // Set to the previous Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Clear time

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to the following Saturday
    endOfWeek.setHours(23, 59, 59, 999); // Set time to the end of the day

    const totalWorkouts = workoutLog.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    }).length;

    return {
      totalWorkouts,
    };
  };

  const shareWorkout = async (workout) => {
    const workoutDetails = workout.exercises.map(ex => `${ex.name}: ${ex.sets} sets, ${ex.reps} reps, ${ex.weight} lbs`).join('\n');
    const message = `Date: ${formatDate(workout.date)}\nExercises:\n${workoutDetails}`;

    try {
      await Share.share({
        message,
        title: 'Share your workout',
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  const { totalWorkouts } = calculateWeeklySummary();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>GymSeekr</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>This Week's Workouts: {totalWorkouts}</Text>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          markedDates={markedDates}
          markingType={'dot'}
          style={styles.calendar}
          theme={{
            calendarBackground: colors.white,
            textSectionTitleColor: colors.primary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.primary,
            dayTextColor: colors.mediumGrey,
            textDisabledColor: colors.lightText,
            dotColor: colors.primary,
            selectedDotColor: colors.white,
            arrowColor: colors.primary,
            monthTextColor: colors.primary,
            indicatorColor: colors.primary,
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
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{quotes[quoteIndex]}</Text>
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
                <Ionicons name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {selectedWorkout.map((workout, index) => (
                <View key={index} style={styles.workoutContainer}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.dateText}>{formatDate(workout.date)}</Text>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => shareWorkout(workout)}
                    >
                      <Ionicons name="share-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {workout.exercises && (
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
    backgroundColor: colors.background,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  settingsButton: {
    padding: 8,
    color: colors.white,
  },
  summaryContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    textAlign: 'center',
  },
  calendarContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteContainer: {
    marginTop: 75,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 30,
    fontStyle: 'italic',
    color: colors.primary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
  },
  closeButton: {
    padding: 8,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  workoutContainer: {
    marginBottom: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  exerciseBox: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGrey,
  },
  detailsText: {
    fontSize: 14,
    color: colors.mediumGrey,
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
