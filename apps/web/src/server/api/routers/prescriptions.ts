import { TRPCError } from '@trpc/server'
import {
  createTRPCRouter,
  doctorProcedure,
  procedure,
} from '@web/server/api/trpc'
import { prescriptionsService } from '@web/server/services/prescriptions'
import { z } from 'zod'

const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.number().int().positive().optional(),
  instructions: z.string().optional(),
})

export const prescriptionsRouter = createTRPCRouter({
  /**
   * Create a new prescription (doctors only)
   */
  create: doctorProcedure
    .input(
      z.object({
        appointmentId: z.string().uuid(),
        patientId: z.string(),
        diagnosis: z.string().optional(),
        notes: z.string().optional(),
        validUntil: z.date().optional(),
        items: z
          .array(prescriptionItemSchema)
          .min(1, 'At least one medication is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const doctorId = ctx.user.id
      if (!doctorId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Doctor profile not found',
        })
      }

      const prescription = await prescriptionsService.create({
        appointmentId: input.appointmentId,
        doctorId,
        patientId: input.patientId,
        diagnosis: input.diagnosis,
        notes: input.notes,
        validUntil: input.validUntil,
        items: input.items,
      })

      return prescription
    }),

  /**
   * Get prescription by ID
   */
  getById: procedure.input(z.string().uuid()).query(async ({ ctx, input }) => {
    const prescription = await prescriptionsService.getById(input)

    if (!prescription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Prescription not found',
      })
    }

    // Verify access - only the doctor who created it or the patient can view
    const userId = ctx.user.id
    const userRole = ctx.user.role

    if (userRole === 'doctor' && prescription.doctorId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only view prescriptions you created',
      })
    }

    if (userRole === 'patient' && prescription.patientId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only view your own prescriptions',
      })
    }

    return prescription
  }),

  /**
   * Get prescription for an appointment
   */
  getByAppointment: procedure
    .input(z.string().uuid())
    .query(async ({ input }) => {
      return await prescriptionsService.getByAppointmentId(input)
    }),

  /**
   * Get all prescriptions for the current patient
   */
  getMyPrescriptions: procedure.query(async ({ ctx }) => {
    const patientId = ctx.user.id

    if (!patientId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Patient profile not found',
      })
    }

    return await prescriptionsService.getByPatientId(patientId)
  }),

  /**
   * Get all prescriptions created by the current doctor
   */
  getDoctorPrescriptions: doctorProcedure.query(async ({ ctx }) => {
    const doctorId = ctx.user.id
    return await prescriptionsService.getByDoctorId(doctorId)
  }),

  /**
   * Update prescription status or details
   */
  update: doctorProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        diagnosis: z.string().optional(),
        notes: z.string().optional(),
        status: z
          .enum(['active', 'dispensed', 'expired', 'cancelled'])
          .optional(),
        validUntil: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the doctor owns this prescription
      const existing = await prescriptionsService.getById(input.id)
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prescription not found',
        })
      }

      if (existing.doctorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own prescriptions',
        })
      }

      return await prescriptionsService.update(input)
    }),

  /**
   * Add medications to an existing prescription
   */
  addItems: doctorProcedure
    .input(
      z.object({
        prescriptionId: z.string().uuid(),
        items: z.array(prescriptionItemSchema).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await prescriptionsService.getById(input.prescriptionId)
      if (!existing || existing.doctorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot modify this prescription',
        })
      }

      return await prescriptionsService.addItems(
        input.prescriptionId,
        input.items,
      )
    }),

  /**
   * Remove a medication from a prescription
   */
  removeItem: doctorProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      await prescriptionsService.removeItem(input)
      return { success: true }
    }),

  /**
   * Cancel a prescription
   */
  cancel: doctorProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const existing = await prescriptionsService.getById(input)
      if (!existing || existing.doctorId !== ctx.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot cancel this prescription',
        })
      }

      return await prescriptionsService.cancel(input)
    }),
})
