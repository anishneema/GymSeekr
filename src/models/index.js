// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Workout, Exercise } = initSchema(schema);

export {
  Workout,
  Exercise
};