import { patients as patientsTable } from '@web/server/db/schema'
import Appointments from '@web/server/services/appointments'
import { Doctors } from '@web/server/services/doctors'
import {
  users as usersTable,
  doctors as doctorsTable,
  facilities as facilitiesTable,
  officeLocation as officeLocationTable  
} from '@web/server/db/schema'
import assert from 'assert'
import { db } from '@web/server/db'
import { eq, ilike, or, and, inArray, sql, between, gte } from 'drizzle-orm'
import { z } from 'zod'
import { doctorProcedure, protectedProcedure, publicProcedure } from '../trpc'
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

export const updatePersonalDetails = protectedProcedure
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

export const updateProfessionalDetails = protectedProcedure
  .input(professionalDetailsSchema)
  .mutation(async ({ input, ctx }) => {
    return Doctors.updateProfessionalDetails(input, ctx.user.id ?? '')
  })

export const updateAvailabilityDetails = protectedProcedure
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
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
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
    return db
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
      subSpecialties: z.array(z.string()).optional(),
      experiences: z
        .array(
          z.object({
            min: z.number(),
            max: z.number().optional(),
          }),
        )
        .optional(),
      genders: z.array(z.enum(['male', 'female'])).optional(),
    }),
  )
  .query(async ({ input }) => {
    const { countyCode, townId, specialtyId, query, subSpecialties, experiences, genders } = input

    // Build base conditions
    const conditions = []

    if (countyCode || townId) {
      let townName: string | undefined
      if (townId) {
        const placeDetails = await googleMapsClient.placeDetails({
          params: {
            place_id: townId,
            fields: ['name'],
            key: env.GOOGLE_MAPS_API_KEY,
          },
        })
        townName = placeDetails.data.result.name
      }

      const facilitySubquery = db
        .select({ placeId: facilitiesTable.placeId })
        .from(facilitiesTable)
        .where(
          and(
            ...(countyCode
              ? [
                  eq(
                    facilitiesTable.county,
                    KENYA_COUNTIES.find((c) => c.code === countyCode)?.name
                      ?.replace(' County', '')
                      .replace('Wilaya ya ', '')
                      .replace('Kaunti ya ', '')
                      .trim() ?? ''
                  ),
                ]
              : []),
            ...(townName
              ? [eq(facilitiesTable.town, townName)]
              : [])
          )
        )

      const officeSubquery = db
        .select({ placeId: officeLocationTable.placeId })
        .from(officeLocationTable)
        .where(
          and(
            ...(countyCode
              ? [
                  eq(
                    officeLocationTable.county,
                    KENYA_COUNTIES.find((c) => c.code === countyCode)?.name
                      ?.replace(' County', '')
                      .replace('Wilaya ya ', '')
                      .replace('Kaunti ya ', '')
                      .trim() ?? ''
                  ),
                ]
              : []),
            ...(townName
              ? [eq(officeLocationTable.town, townName)]
              : [])
          )
        )

      conditions.push(
        or(
          inArray(doctorsTable.facility, facilitySubquery),
          inArray(doctorsTable.officeId, officeSubquery)
        )
      )
    }

    if (specialtyId) {
      conditions.push(eq(doctorsTable.specialty, specialtyId))
    }

    if (query) {
      const userSubquery = db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          or(
            ilike(usersTable.firstName, `%${query}%`),
            ilike(usersTable.lastName, `%${query}%`)
          )
        )

      const facilitySubquery = db
        .select({ placeId: facilitiesTable.placeId })
        .from(facilitiesTable)
        .where(ilike(facilitiesTable.name, `%${query}%`))

      conditions.push(
        or(
          inArray(doctorsTable.userId, userSubquery),
          inArray(doctorsTable.facility, facilitySubquery)
        )
      )
    }

    // Add subspecialties filter
    if (subSpecialties?.length) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements(${doctorsTable.subSpecialties}) elem
          WHERE elem->>'id' IN (${subSpecialties
            .map((id) => sql`${id}`)
            .reduce((acc, curr, idx) =>
              idx === 0 ? curr : sql`${acc}, ${curr}`,
            )})
        )`,
      )
    }

    // Add experience filter
    if (experiences?.length) {
      conditions.push(
        or(
          ...experiences.map((range) =>
            range.max
              ? between(doctorsTable.experience, range.min, range.max)
              : gte(doctorsTable.experience, range.min),
          ),
        ),
      )
    }

    // Add gender filter
    if (genders?.length) {
      conditions.push(inArray(doctorsTable.gender, genders))
    }
    conditions.push(eq(doctorsTable.status, 'verified'))
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
        phone: doctor.phone,
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
