import { TRPCError } from '@trpc/server'
import { createTRPCRouter, procedure } from '../trpc'
import { z } from 'zod'
import twilio from 'twilio'
import { env } from '@web/env'
import { db } from '@web/server/db'
import { eq, inArray } from 'drizzle-orm'
import { appointments } from '@web/server/db/schema'
import { AppointmentStatus } from '../validation'

const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
const AccessToken = twilio.jwt.AccessToken
const VideoGrant = AccessToken.VideoGrant

export const videoRouter = createTRPCRouter({
  generateToken: procedure
    .input(
      z.object({
        appointmentId: z.string(),
        roomName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const appointment = await db.query.appointments.findFirst({
        where: (appointments, { eq, and }) =>
          and(
            eq(appointments.id, input.appointmentId),
            inArray(appointments.status, [
              AppointmentStatus.InProgress,
              AppointmentStatus.Pending,
              AppointmentStatus.Scheduled,
            ]),
          ),
        with: {
          doctor: true,
          patient: true,
        },
      })

      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        })
      }

      const isAuthorized =
        appointment.doctorId === ctx.user.id ||
        appointment.patientId === ctx.user.id

      if (!isAuthorized) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authorized to join this session',
        })
      }

      const token = new AccessToken(
        env.TWILIO_ACCOUNT_SID,
        env.TWILIO_API_KEY_SID,
        env.TWILIO_API_KEY_SECRET,
        { identity: ctx.user.id },
      )

      const videoGrant = new VideoGrant({
        room: input.roomName,
      })
      token.addGrant(videoGrant)

      return {
        token: token.toJwt(),
        identity: ctx.user.id,
        roomName: input.roomName,
      }
    }),

  createRoom: procedure
    .input(
      z.object({
        appointmentId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const roomName = `appointment-${input.appointmentId}`

        let room
        try {
          room = await twilioClient.video.v1.rooms(roomName).fetch()
        } catch {
          room = await twilioClient.video.v1.rooms.create({
            uniqueName: roomName,
            type: 'group-small',
            maxParticipants: 2,
          })
        }
        await db
          .update(appointments)
          .set({ status: AppointmentStatus.InProgress })
          .where(eq(appointments.id, input.appointmentId))

        return {
          roomName: room.uniqueName,
          status: room.status,
        }
      } catch (error) {
        console.error('Error creating/fetching room:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create/fetch video room',
        })
      }
    }),

  endSession: procedure
    .input(
      z.object({
        appointmentId: z.string(),
        roomName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.id, input.appointmentId),
      })

      if (!appointment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        })
      }
      if (appointment.status === AppointmentStatus.Completed) {
        return { success: true }
      }

      try {
        await twilioClient.video.v1.rooms(input.roomName).update({
          status: 'completed',
        })
      } catch (error) {
        console.error('Error completing room:', error)
      }

      await db
        .update(appointments)
        .set({ status: AppointmentStatus.Completed })
        .where(eq(appointments.id, input.appointmentId))

      return { success: true }
    }),
})
