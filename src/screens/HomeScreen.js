import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';


const HomeScreen = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [workoutLog, setWorkoutLog] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState([]);
  const [showModal, setShowModal] = useState(false);


  const loadWorkoutLog = async () => {
    try {
      const savedWorkoutLog = await AsyncStorage.getItem('@workout_log');
      if (savedWorkoutLog !== null) {
        const parsedLog = JSON.parse(savedWorkoutLog);
        setWorkoutLog(parsedLog);
        updateMarkedDates(parsedLog);
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
                  {workout.exercises && (
                    <View style={styles.exerciseBox}>
                      {workout.exercises.map((exercise, index) => (
                        <React.Fragment key={index}>
                          {renderExercise({ item: exercise })}
                        </React.Fragment>
                      ))}
                    </View>
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
    padding: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  workoutContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseContainer: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
});


export default HomeScreen;