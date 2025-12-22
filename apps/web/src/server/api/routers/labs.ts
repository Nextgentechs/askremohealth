import { Client } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'
import { db } from '@web/server/db'
import {
  labAppointments,
  labAvailability,
  labTestsAvailable,
  patients,
  users,
} from '@web/server/db/schema'
import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import AppointmentsService from '../../services/appointments' // Import AppointmentsService
import { LabsService } from '../../services/labs'
import { protectedProcedure, publicProcedure } from '../trpc'

const googleMapsClient = new Client({})

export const registerLab = publicProcedure
  .input(
    z.object({
      placeId: z.string(),
      user_id: z.string(),
      phone: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    return LabsService.register(input.placeId, input.user_id, input.phone)
  })

export const findLabsByLocation = publicProcedure
  .input(
    z.object({
      location: z.object({ lat: z.number(), lng: z.number() }),
      searchRadius: z.number().default(10000),
    }),
  )
  .query(async ({ input }) => {
    const response = await googleMapsClient.placesNearby({
      params: {
        location: input.location,
        radius: input.searchRadius,
        keyword: 'medical laboratory|lab',
        type: 'health',
        key: env.GOOGLE_MAPS_API_KEY,
      },
    })
    return response.data.results.map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
    }))
  })

export const listLabs = publicProcedure.query(async () => {
  return LabsService.list()
})

export const searchLabsByName = publicProcedure
  .input(
    z.object({
      query: z.string().min(1),
    }),
  )
  .query(async ({ input }) => {
    try {
      const response = await googleMapsClient.placeAutocomplete({
        params: {
          input: input.query,
          components: ['country:KE'],
          key: env.GOOGLE_MAPS_API_KEY,
        },
      })

      const suggestions = response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text ?? undefined,
      }))

      return suggestions
    } catch (error) {
      console.error('Error searching labs by name:', error)
      throw new Error('Failed to search labs')
    }
  })

export const addLabTests = protectedProcedure
  .input(
    z.object({
      tests: z.array(
        z.object({
          testId: z.string(),
          amount: z.number(),
          collection: z.string(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const user = ctx.user
    if (!user) throw new Error('Not authenticated')

    // Find the lab for the user
    const lab = await db.query.labs.findFirst({
      where: (l, { eq }) => eq(l.userId, user.id),
    })
    if (!lab) throw new Error('Lab not found for user')

    // Fetch test details
    const testIds = input.tests.map((t) => t.testId)
    const testDetails = await db.query.tests.findMany({
      where: (t, { inArray }) => inArray(t.id, testIds),
    })
    const testMap = new Map(testDetails.map((t) => [t.id, t]))

    // Insert tests
    const allowedCollections = ['onsite', 'home', 'both'] as const
    const values = input.tests.map((t) => {
      if (
        !allowedCollections.includes(t.collection as 'onsite' | 'home' | 'both')
      ) {
        throw new Error(`Invalid collection value: ${t.collection}`)
      }
      const test = testMap.get(t.testId)
      if (!test) throw new Error(`Test not found: ${t.testId}`)

      return {
        labId: lab.id,
        testId: t.testId,
        testName: test.name,
        price: t.amount,
        amount: t.amount,
        collection: t.collection as 'onsite' | 'home' | 'both',
      }
    })

    await db.insert(labTestsAvailable).values(values)

    return { success: true }
  })

export const getLabTestsForCurrentLab = protectedProcedure.query(
  async ({ ctx }) => {
    const user = ctx.user
    if (!user) throw new Error('Not authenticated')
    // Find the lab for the user
    const lab = await db.query.labs.findFirst({
      where: (l, { eq }) => eq(l.userId, user.id),
    })
    if (!lab) return []
    // Get all lab tests for this lab
    return db.query.labTestsAvailable.findMany({
      where: (lta, { eq }) => eq(lta.labId, lab.id),
    })
  },
)

export const saveLabAvailability = protectedProcedure
  .input(
    z.object({
      availability: z.array(
        z.object({
          day_of_week: z.string(),
          start_time: z.string(),
          end_time: z.string(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const user = ctx.user
    if (!user) throw new Error('Not authenticated')
    // Find the lab for the user
    const lab = await db.query.labs.findFirst({
      where: (l, { eq }) => eq(l.userId, user.id),
    })
    if (!lab) throw new Error('Lab not found for user')

    // Optionally: delete previous availability for this lab
    await db.delete(labAvailability).where(eq(labAvailability.labId, lab.id))

    // Insert new availability
    await db.insert(labAvailability).values(
      input.availability.map((a) => ({
        labId: lab.id,
        dayOfWeek: a.day_of_week as
          | 'monday'
          | 'tuesday'
          | 'wednesday'
          | 'thursday'
          | 'friday'
          | 'saturday'
          | 'sunday',
        startTime: a.start_time,
        endTime: a.end_time,
      })),
    )

    // Update user onboarding status
    await db
      .update(users)
      .set({ onboardingComplete: true })
      .where(eq(users.id, user.id))

    return { success: true }
  })

export const filterLabs = publicProcedure
  .input(
    z.object({
      name: z.string().optional(),
      county: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    return LabsService.listFiltered({
      name: input.name,
      county: input.county,
    })
  })

export const getLabById = publicProcedure
  .input(z.object({ placeId: z.string() }))
  .query(async ({ input }) => {
    return LabsService.getById(input.placeId)
  })

export const getLabTestsByLabId = publicProcedure
  .input(z.object({ labId: z.string() }))
  .query(async ({ input }) => {
    return LabsService.getTestsByLabId(input.labId)
  })

export const getLabAvailabilityByLabId = publicProcedure
  .input(z.object({ labId: z.string() }))
  .query(async ({ input }) => {
    return LabsService.getAvailabilityByLabId(input.labId)
  })

export const bookLabAppointment = protectedProcedure
  .input(
    z.object({
      labId: z.string(),
      testId: z.string(),
      date: z.string(),
      time: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      phone: z.string(),
      email: z.string(),
      dob: z.string(),
      notes: z.string().optional(),
      patientId: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    // If patientId is provided (doctor booking), use it directly
    let patient
    if (input.patientId) {
      patient = await db.query.patients.findFirst({
        where: (p, { eq }) => eq(p.id, input.patientId!),
      })
    } else {
      // Find or create patient by phone
      patient = await db.query.patients.findFirst({
        where: (p, { eq }) => eq(p.phone, input.phone),
      })
      if (!patient) {
        // Create new patient user and patient record
        const userId = randomUUID()
        await db.insert(users).values({
          id: userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          password: randomUUID(), // Set a random password (not used for lab patients)
          role: 'patient',
          onboardingComplete: true,
        })
        await db.insert(patients).values({
          id: userId,
          userId: userId,
          phone: input.phone,
          dob: new Date(input.dob),
        })
        patient = await db.query.patients.findFirst({
          where: (p, { eq }) => eq(p.id, userId),
        })
      }
    }
    if (!patient) throw new Error('Failed to create or find patient')
    // Note: doctorId for referrals could be added here in the future if needed
    // Combine date and time into a JS Date
    const appointmentDate = new Date(`${input.date}T${input.time}`)
    // Insert appointment
    const [appointment] = await db
      .insert(labAppointments)
      .values({
        labId: input.labId,
        patientId: patient.id,
        testId: input.testId,
        status: 'scheduled',
        scheduledAt: appointmentDate,
        notes: input.notes,
        createdAt: new Date(),
      })
      .returning()
    if (!appointment) throw new Error('Failed to create appointment')
    return { success: true, appointmentId: appointment.id }
  })

export const currentLab = protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.user
  if (!user) throw new Error('Not authenticated')

  const lab = await db.query.labs.findFirst({
    where: (l, { eq }) => eq(l.userId, user.id),
    with: {
      user: true,
    },
  })

  return lab
})

export const labsRouter = {
  registerLab,
  findLabsByLocation,
  listLabs,
  searchLabsByName,
  addLabTests,
  getLabTestsForCurrentLab,
  saveLabAvailability,
  filterLabs,
  getLabById,
  getLabTestsByLabId,
  getLabAvailabilityByLabId,
  bookLabAppointment,
  currentLab,
  getLabAppointments: protectedProcedure
    .input(z.object({ labId: z.string() }))
    .query(async ({ input }) => {
      return AppointmentsService.getLabAppointments(input.labId)
    }),
}
