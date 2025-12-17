import { db } from '@web/server/db'
import {
  appointments,
  doctors,
  patients,
  prescriptionItems,
  prescriptions,
  users,
} from '@web/server/db/schema'
import { desc, eq } from 'drizzle-orm'

export interface CreatePrescriptionInput {
  appointmentId: string
  doctorId: string
  patientId: string
  diagnosis?: string
  notes?: string
  validUntil?: Date
  items: Array<{
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    quantity?: number
    instructions?: string
  }>
}

export interface UpdatePrescriptionInput {
  id: string
  diagnosis?: string
  notes?: string
  status?: 'active' | 'dispensed' | 'expired' | 'cancelled'
  validUntil?: Date
}

export const prescriptionsService = {
  /**
   * Create a new prescription with medication items
   */
  async create(input: CreatePrescriptionInput) {
    return await db.transaction(async (tx) => {
      // Create the prescription
      const [prescription] = await tx
        .insert(prescriptions)
        .values({
          appointmentId: input.appointmentId,
          doctorId: input.doctorId,
          patientId: input.patientId,
          diagnosis: input.diagnosis,
          notes: input.notes,
          validUntil: input.validUntil,
          status: 'active',
        })
        .returning()

      if (!prescription) {
        throw new Error('Failed to create prescription')
      }

      // Insert prescription items
      if (input.items.length > 0) {
        await tx.insert(prescriptionItems).values(
          input.items.map((item) => ({
            prescriptionId: prescription.id,
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        )
      }

      return prescription
    })
  },

  /**
   * Get a prescription by ID with all items
   */
  async getById(id: string) {
    const prescription = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.id, id),
    })

    if (!prescription) {
      return null
    }

    const items = await db
      .select()
      .from(prescriptionItems)
      .where(eq(prescriptionItems.prescriptionId, id))

    // Get doctor info
    const doctor = await db
      .select({
        id: doctors.id,
        firstName: users.firstName,
        lastName: users.lastName,
        licenseNumber: doctors.licenseNumber,
      })
      .from(doctors)
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(doctors.id, prescription.doctorId))
      .limit(1)

    // Get patient info
    const patient = await db
      .select({
        id: patients.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(patients)
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, prescription.patientId))
      .limit(1)

    return {
      ...prescription,
      items,
      doctor: doctor[0] ?? null,
      patient: patient[0] ?? null,
    }
  },

  /**
   * Get prescription by appointment ID
   */
  async getByAppointmentId(appointmentId: string) {
    const prescription = await db.query.prescriptions.findFirst({
      where: eq(prescriptions.appointmentId, appointmentId),
    })

    if (!prescription) {
      return null
    }

    const items = await db
      .select()
      .from(prescriptionItems)
      .where(eq(prescriptionItems.prescriptionId, prescription.id))

    return {
      ...prescription,
      items,
    }
  },

  /**
   * Get all prescriptions for a patient
   */
  async getByPatientId(patientId: string) {
    const prescriptionsList = await db
      .select({
        prescription: prescriptions,
        appointmentDate: appointments.appointmentDate,
        doctorId: doctors.id,
        doctorFirstName: users.firstName,
        doctorLastName: users.lastName,
      })
      .from(prescriptions)
      .innerJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .innerJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .innerJoin(users, eq(doctors.userId, users.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt))

    // Get items for each prescription
    const prescriptionsWithItems = await Promise.all(
      prescriptionsList.map(async (p) => {
        const items = await db
          .select()
          .from(prescriptionItems)
          .where(eq(prescriptionItems.prescriptionId, p.prescription.id))

        return {
          ...p.prescription,
          appointmentDate: p.appointmentDate,
          doctor: {
            id: p.doctorId,
            firstName: p.doctorFirstName,
            lastName: p.doctorLastName,
          },
          items,
        }
      }),
    )

    return prescriptionsWithItems
  },

  /**
   * Get all prescriptions created by a doctor
   */
  async getByDoctorId(doctorId: string) {
    const prescriptionsList = await db
      .select({
        prescription: prescriptions,
        appointmentDate: appointments.appointmentDate,
        patientId: patients.id,
        patientFirstName: users.firstName,
        patientLastName: users.lastName,
      })
      .from(prescriptions)
      .innerJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(users, eq(patients.userId, users.id))
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt))

    // Get items for each prescription
    const prescriptionsWithItems = await Promise.all(
      prescriptionsList.map(async (p) => {
        const items = await db
          .select()
          .from(prescriptionItems)
          .where(eq(prescriptionItems.prescriptionId, p.prescription.id))

        return {
          ...p.prescription,
          appointmentDate: p.appointmentDate,
          patient: {
            id: p.patientId,
            firstName: p.patientFirstName,
            lastName: p.patientLastName,
          },
          items,
        }
      }),
    )

    return prescriptionsWithItems
  },

  /**
   * Update prescription details
   */
  async update(input: UpdatePrescriptionInput) {
    const [updated] = await db
      .update(prescriptions)
      .set({
        diagnosis: input.diagnosis,
        notes: input.notes,
        status: input.status,
        validUntil: input.validUntil,
      })
      .where(eq(prescriptions.id, input.id))
      .returning()

    return updated
  },

  /**
   * Add items to an existing prescription
   */
  async addItems(
    prescriptionId: string,
    items: Array<{
      medicationName: string
      dosage: string
      frequency: string
      duration: string
      quantity?: number
      instructions?: string
    }>,
  ) {
    if (items.length === 0) return []

    const inserted = await db
      .insert(prescriptionItems)
      .values(
        items.map((item) => ({
          prescriptionId,
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions,
        })),
      )
      .returning()

    return inserted
  },

  /**
   * Remove an item from a prescription
   */
  async removeItem(itemId: string) {
    await db.delete(prescriptionItems).where(eq(prescriptionItems.id, itemId))
  },

  /**
   * Cancel a prescription
   */
  async cancel(id: string) {
    const [updated] = await db
      .update(prescriptions)
      .set({ status: 'cancelled' })
      .where(eq(prescriptions.id, id))
      .returning()

    return updated
  },

  /**
   * Mark prescription as dispensed
   */
  async markDispensed(id: string) {
    const [updated] = await db
      .update(prescriptions)
      .set({ status: 'dispensed' })
      .where(eq(prescriptions.id, id))
      .returning()

    return updated
  },
}
