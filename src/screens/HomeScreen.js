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
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
      loadWeeklyWorkouts();
    }
  }, [userEmail]);

  const handleMonthChange = (month) => {
    setCurrentMonth(month.month);
    setCurrentYear(month.year);
    loadWorkoutLog(month.month, month.year);
  };

  const loadWorkoutLog = async (month = currentMonth, year = currentYear) => {
    if (!userEmail) return;
    const startOfMonth = new Date(year, month - 1, 1).toISOString();
    const endOfMonth = new Date(year, month, 0).toISOString();

    try {
      const filter = {
        and: [
          { owner: { eq: userEmail } },
          { date: { between: [startOfMonth, endOfMonth] } }
        ]
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

  const loadWeeklyWorkouts = async () => {
    if (!userEmail) return;

    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    try {
      const filter = {
        and: [
          { owner: { eq: userEmail } },
          { date: { between: [startOfWeek.toISOString(), endOfWeek.toISOString()] } }
        ]
      };

      const result = await API.graphql({
        query: listWorkouts,
        variables: { filter }
      });

      const workouts = result?.data?.listWorkouts?.items.filter(workout => !workout._deleted) || [];
      console.log('Fetched weekly workouts:', workouts);
      setWeeklyWorkouts(workouts);
    } catch (e) {
      console.error('Error loading weekly workouts:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkoutLog();
      loadWeeklyWorkouts();
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
    return {
      totalWorkouts: weeklyWorkouts.length,
    };
  };

  const shareWorkout = async (workout) => {
    const workoutDetails = workout.exercises.items.map(ex => `${ex.name}: ${ex.sets} sets, ${ex.reps} reps, ${ex.weight} lbs`).join('\n');
    const message = `Date: ${formatDate(workout.date)}\nExercises:\n${workoutDetails}`;

    console.log('Sharing message:', message);

    try {
      await Share.share({
        message: message,
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
          onMonthChange={handleMonthChange}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  quoteText: {
    fontSize: 24,
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
  noExercisesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default HomeScreen;
