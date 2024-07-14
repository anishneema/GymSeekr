// GymDetails.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';


const GymDetails = ({ route }) => {
  const { gym } = route.params;


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{gym.name}</Text>
      <Text style={styles.address}>{gym.address}</Text>
      <Text style={styles.sectionTitle}>Hours:</Text>
      <Text style={styles.text}>{gym.hours}</Text>
      <Text style={styles.sectionTitle}>Equipment:</Text>
      {gym.equipment.map((item, index) => (
        <Text key={index} style={styles.text}>• {item}</Text>
      ))}
      <Text style={styles.sectionTitle}>Description:</Text>
      <Text style={styles.text}>{gym.description}</Text>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
});


export default GymDetails;