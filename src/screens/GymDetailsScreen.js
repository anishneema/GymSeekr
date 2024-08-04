import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gymData } from './Database';

const colors = {
  primary: '#026bd9',
  secondary: '#4A90E2',
  background: '#E9F0F7',
  white: '#FFFFFF',
  lightGrey: '#D0D8E0',
  mediumGrey: '#2d4150',
  darkGrey: '#333333',
};

const GymDetailsScreen = ({ route }) => {
  const { gymId } = route.params;
  const [gym, setGym] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const gymDetails = gymData.find(g => g.id === gymId);
    setGym(gymDetails);
  }, [gymId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gym Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {gym ? (
          <>
            <View style={styles.gymHeader}>
              <Text style={styles.gymName}>{gym.name}</Text>
              <Text style={styles.gymAddress}>{gym.address}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>{gym.description}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment</Text>
              {gym.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Ionicons name="barbell" size={20} color={colors.primary} />
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hours</Text>
              <Text style={styles.sectionContent}>{gym.hours}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionContent}>{gym.address}</Text>
            </View>
          </>
        ) : (
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>This gym is in not our database. If you would like to add this gym, please contact gymseekr@gmail.com. We are always looking to expand our database!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollViewContent: {
    padding: 15,
  },
  gymHeader: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gymName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  gymAddress: {
    fontSize: 16,
    color: colors.mediumGrey,
    marginTop: 5,
  },
  section: {
    backgroundColor: colors.white,
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  equipmentText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGrey,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    padding: 20,
  },
});

export default GymDetailsScreen;
