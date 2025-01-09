import { appointments } from '../db/schema'
import { db } from '../db'
import { type InferInsertModel } from 'drizzle-orm'

export class PatientAppointments {
  static async create(params: InferInsertModel<typeof appointments>) {
    return await db.insert(appointments).values({
      ...params,
    })
  }
}
