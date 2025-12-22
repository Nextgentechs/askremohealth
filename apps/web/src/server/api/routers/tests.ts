import { db } from '../../db'
import { publicProcedure } from '../trpc'

export const listTests = publicProcedure.query(async () => {
  return db.query.tests.findMany()
})

export const testsRouter = {
  listTests,
}
