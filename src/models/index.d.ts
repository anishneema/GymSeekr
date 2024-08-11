import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";





type EagerWorkout = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Workout, 'id'>;
  };
  readonly id: string;
  readonly date: string;
  readonly owner?: string | null;
  readonly userEmail?: string | null;
  readonly exercises?: (Exercise | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWorkout = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Workout, 'id'>;
  };
  readonly id: string;
  readonly date: string;
  readonly owner?: string | null;
  readonly userEmail?: string | null;
  readonly exercises: AsyncCollection<Exercise>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Workout = LazyLoading extends LazyLoadingDisabled ? EagerWorkout : LazyWorkout

export declare const Workout: (new (init: ModelInit<Workout>) => Workout) & {
  copyOf(source: Workout, mutator: (draft: MutableModel<Workout>) => MutableModel<Workout> | void): Workout;
}

type EagerExercise = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Exercise, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly sets: number;
  readonly reps: number;
  readonly weight: number;
  readonly date: string;
  readonly owner?: string | null;
  readonly userEmail?: string | null;
  readonly workoutID: string;
  readonly workout?: Workout | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyExercise = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Exercise, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly sets: number;
  readonly reps: number;
  readonly weight: number;
  readonly date: string;
  readonly owner?: string | null;
  readonly userEmail?: string | null;
  readonly workoutID: string;
  readonly workout: AsyncItem<Workout | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Exercise = LazyLoading extends LazyLoadingDisabled ? EagerExercise : LazyExercise

export declare const Exercise: (new (init: ModelInit<Exercise>) => Exercise) & {
  copyOf(source: Exercise, mutator: (draft: MutableModel<Exercise>) => MutableModel<Exercise> | void): Exercise;
}