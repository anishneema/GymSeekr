import React from 'react';
import { StyleSheet } from 'react-native';
import SwipeableRow from 'react-native-swipe-list-view';

const SwipeableRowComponent = ({ children, workout, workoutLog, setWorkoutLog }) => {
  const deleteWorkout = async () => {
    try {
      const updatedLog = workoutLog.filter((w) => w.date !== workout.date);
      await AsyncStorage.setItem('@workout_log', JSON.stringify(updatedLog));
      setWorkoutLog(updatedLog);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SwipeableRow.SwipeableListView
      data={[workout]}
      renderItem={({ item }) => children}
      renderTrailingActions={() => (
        <SwipeableRow.TrailingAction
          title="Delete"
          onPress={deleteWorkout}
          style={styles.deleteAction}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 4,
  },
});

export default SwipeableRowComponent;