import { publicProcedure } from '../trpc';
import { db } from '../../db';
import { tests } from '../../db/schema';

export const listTests = publicProcedure.query(async () => {
  return db.query.tests.findMany();
});

export const testsRouter = {
  listTests,
}; 