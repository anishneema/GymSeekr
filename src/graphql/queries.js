/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getWorkout = /* GraphQL */ `
  query GetWorkout($id: ID!) {
    getWorkout(id: $id) {
      id
      date
      owner
      exercises {
          items {
          name
          id
          owner
          reps
          sets
          updatedAt
          weight
          workoutID
        }
        nextToken
        startedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listWorkouts = /* GraphQL */ `
  query ListWorkouts(
    $filter: ModelWorkoutFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listWorkouts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        date
        owner
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
        exercises {
        items {
          name
          id
          owner
          reps
          sets
          updatedAt
          weight
          workoutID
        }
      }
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncWorkouts = /* GraphQL */ `
  query SyncWorkouts(
    $filter: ModelWorkoutFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncWorkouts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        date
        owner
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getExercise = /* GraphQL */ `
  query GetExercise($id: ID!) {
    getExercise(id: $id) {
      id
      name
      sets
      reps
      weight
      date
      owner
      workoutID
      workout {
        id
        date
        owner
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listExercises = /* GraphQL */ `
  query ListExercises(
    $filter: ModelExerciseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listExercises(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        sets
        reps
        weight
        date
        owner
        workoutID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncExercises = /* GraphQL */ `
  query SyncExercises(
    $filter: ModelExerciseFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncExercises(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        name
        sets
        reps
        weight
        date
        owner
        workoutID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const exercisesByWorkoutIDAndDate = /* GraphQL */ `
  query ExercisesByWorkoutIDAndDate(
    $workoutID: ID!
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelExerciseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    exercisesByWorkoutIDAndDate(
      workoutID: $workoutID
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        sets
        reps
        weight
        date
        owner
        workoutID
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
