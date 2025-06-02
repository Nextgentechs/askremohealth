import { patients as patientsTable } from '@web/server/db/schema'
import Appointments from '@web/server/services/appointments'
import { Doctors } from '@web/server/services/doctors'
import { 
  users as usersTable,
  doctors as doctorsTable,
  specialties as specialtiesTable,
  facilities as facilitiesTable,
  profilePictures as profilePicturesTable,
  reviews as reviewsTable
} from '@web/server/db/schema'
import assert from 'assert'
import { db } from '@web/server/db'
import { eq, ilike, or, and, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { doctorProcedure, procedure, publicProcedure } from '../trpc'
import {
  availabilityDetailsSchema,
  doctorAppointmentListSchema,
  doctorListSchema,
  personalDetailsSchema,
  professionalDetailsSchema,
} from '../validators'
import { KENYA_COUNTIES } from '@web/server/data/kenya-counties'
import { Client } from '@googlemaps/google-maps-services-js'
import { env } from '@web/env'

const googleMapsClient = new Client({})

export const updatePersonalDetails = procedure
  .input(personalDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updatePersonalDetails(input, ctx.user.id ?? '')
  })

export const updateProfilePicture = doctorProcedure
  .input(z.object({ profilePicture: z.string() }))
  .mutation(async ({ input, ctx }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.updateProfilePicture({
      userId: ctx.user.id,
      profilePicture: input.profilePicture,
    })
  })

export const updateProfessionalDetails = procedure
  .input(professionalDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updateProfessionalDetails(input, ctx.user.id ?? '')
  })

export const updateAvailabilityDetails = procedure
  .input(availabilityDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updateAvailabilityDetails(input, ctx.user.id ?? '')
  })

export const currentDoctor = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null
  const userId = ctx.user.id ?? ''
  const doctor = await db.query.doctors.findFirst({
    where: (doctor) => eq(doctor.id, userId),
    with: {
      profilePicture: true,
      specialty: true,
      facility: true,
      operatingHours: true,
      certificates: true,
      user: { // <-- join user table for names
        columns: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })
  return doctor ?? null
})

export const list = publicProcedure
  .input(doctorListSchema)
  .query(async ({ input }) => {
    return Doctors.list(input)
  })

export const details = publicProcedure
  .input(z.string())
  .query(async ({ input }) => {
    return Doctors.details(input)
  })

export const upcommingAppointments = doctorProcedure
  .input(
    z.object({
      type: z.enum(['physical', 'online']),
      page: z.number().optional().catch(1),
      pageSize: z.number().optional().catch(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Appointments.upcoming(
      ctx.user.id,
      input.type,
      input.page ?? 1,
      input.pageSize ?? 10,
    )
  })

export const allAppointments = doctorProcedure
  .input(doctorAppointmentListSchema)
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Appointments.list(ctx.user.id, input)
  })

export const appointmentDetails = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .query(async ({ input }) => {
    return Doctors.appointmentDetails(input.appointmentId)
  })

export const confirmAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ input }) => {
    return Doctors.confirmAppointment(input.appointmentId)
  })

export const declineAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.declineAppointment(input.appointmentId, ctx.user.id)
  })

export const cancelAppointment = doctorProcedure
  .input(z.object({ appointmentId: z.string() }))
  .mutation(async ({ input }) => {
    return Doctors.cancelAppointment(input.appointmentId)
  })

export const postAppointment = doctorProcedure
  .input(
    z.object({
      appointmentId: z.string(),
      doctorNotes: z.string(),
      attachment: z.string().optional(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.postAppointment(
      ctx.user.id,
      input.appointmentId,
      input.doctorNotes,
      input.attachment,
    )
  })

export const patients = doctorProcedure
  .input(
    z.object({
      query: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(10),
    }),
  )
  .query(async ({ ctx, input }) => {
    assert(ctx.user?.id, 'User not found')
    return Doctors.patients({
      query: input.query,
      doctorId: ctx.user.id,
      page: input.page,
      limit: input.limit,
    })
  })

export const searchPatient = doctorProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.db
      .select({
        id: patientsTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(patientsTable)
      .innerJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .where(
        or(
          ilike(usersTable.firstName, `%${input.query}%`),
          ilike(usersTable.lastName, `%${input.query}%`),
        ),
      )
      .limit(6)
  })

export const searchByLocation = publicProcedure
  .input(
    z.object({
      countyCode: z.string().optional(),
      townId: z.string().optional(),
      specialtyId: z.string().optional(),
      query: z.string().optional(),
    }),
  )
  .query(async ({ input }) => {
    const { countyCode, townId, specialtyId, query } = input

    // Build base conditions
    const conditions = []
    
    if (countyCode || townId) {
      const facilityConditions = []
      
      if (countyCode) {
        const county = KENYA_COUNTIES.find((c) => c.code === countyCode)
        if (county) {
          facilityConditions.push(eq(facilitiesTable.county, county.name))
        }
      }

      if (townId) {
        // Get the town name from the Google Places API
        const placeDetails = await googleMapsClient.placeDetails({
          params: {
            place_id: townId,
            fields: ['name'],
            key: env.GOOGLE_MAPS_API_KEY,
          },
        })
        const townName = placeDetails.data.result.name
        if (townName) {
          facilityConditions.push(eq(facilitiesTable.town, townName))
        }
      }

      // Create a subquery to find facilities matching the location criteria
      const facilitySubquery = db
        .select({ placeId: facilitiesTable.placeId })
        .from(facilitiesTable)
        .where(facilityConditions.length > 0 ? and(...facilityConditions) : undefined)

      // Add condition to find doctors in those facilities
      conditions.push(inArray(doctorsTable.facility, facilitySubquery))
    }

    if (specialtyId) {
      conditions.push(eq(doctorsTable.specialty, specialtyId))
    }

    if (query) {
      // Create a subquery to find users matching the search criteria
      const userSubquery = db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          or(
            ilike(usersTable.firstName, `%${query}%`),
            ilike(usersTable.lastName, `%${query}%`),
          ),
        )

      // Create a subquery to find facilities matching the search criteria
      const facilitySubquery = db
        .select({ placeId: facilitiesTable.placeId })
        .from(facilitiesTable)
        .where(ilike(facilitiesTable.name, `%${query}%`))

      conditions.push(
        or(
          inArray(doctorsTable.userId, userSubquery),
          inArray(doctorsTable.facility, facilitySubquery),
        ),
      )
    }

    // Start building the query with conditions
    const doctorsQuery = db.query.doctors.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        profilePicture: true,
        facility: {
          columns: {
            placeId: true,
            name: true,
            address: true,
            town: true,
            county: true,
          },
        },
        office: {
          columns: {
            placeId: true,
            name: true,
            address: true,
            town: true,
            county: true,
          },
        },
        specialty: true,
        operatingHours: true,
        user: {
          columns: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Execute the query
    const doctors = await doctorsQuery

    // Get upcoming appointments for all doctors
    const upcomingAppointments = await Doctors.getUpcomingAppointments(
      doctors.map((d) => d.id),
    )

    // Get reviews for all doctors
    const reviews = await db.query.reviews.findMany({
      where: (review) =>
        inArray(
          review.doctorId,
          doctors.map((d) => d.id),
        ),
      columns: {
        doctorId: true,
        rating: true,
      },
    })

    // Get subspecialties for all doctors
    const subSpecialtyIds = doctors.flatMap((d) =>
      (d.subSpecialties as Array<{ id: string }>).map((s) => s.id),
    )

    const subspecialties = await db.query.subSpecialties.findMany({
      where: (subSpecialty) => inArray(subSpecialty.id, subSpecialtyIds),
    })

    // Format the results
    const doctorsWithAllData = doctors.map((doctor) => {
      const bookedSlots = upcomingAppointments
        .filter((apt) => apt.doctorId === doctor.id)
        .map((apt) => apt.appointmentDate)

      const doctorReviews = reviews.filter((r) => r.doctorId === doctor.id)
      const averageRating = doctorReviews.length
        ? doctorReviews.reduce((acc, r) => acc + r.rating, 0) /
          doctorReviews.length
        : 0

      return {
        ...doctor,
        firstName: doctor.user?.firstName,
        lastName: doctor.user?.lastName,
        email: doctor.user?.email,
        phone: doctor.user?.phone,
        subSpecialties: subspecialties.filter((sub) =>
          (doctor.subSpecialties as Array<{ id: string }>).some(
            (ds) => ds.id === sub.id,
          ),
        ),
        bookedSlots,
        reviewStats: {
          averageRating,
          totalReviews: doctorReviews.length,
        },
      }
    })

    return {
      doctors: doctorsWithAllData,
      count: doctors.length,
    }
  })
