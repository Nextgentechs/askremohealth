import { relations } from 'drizzle-orm'
import {
  appointmentLogs,
  appointments,
  certificates,
  doctors,
  facilities,
  operatingHours,
  patients,
  profilePictures,
  specialties,
  subSpecialties,
  users,
  reviews,
} from './schema'

export const userRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.id],
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.id],
  }),
  profilePicture: one(profilePictures, {
    fields: [users.id],
    references: [profilePictures.id],
  }),
}))

export const doctorRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.id],
    references: [users.id],
  }),
  specialty: one(specialties, {
    fields: [doctors.specialty],
    references: [specialties.id],
  }),
  subspecialties: many(subSpecialties),
  facility: one(facilities, {
    fields: [doctors.facility],
    references: [facilities.placeId],
  }),
  certificates: many(certificates),
  operatingHours: many(operatingHours),
  appointments: many(appointments),
}))

export const patientRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.id],
    references: [users.id],
  }),
  appointments: many(appointments),
}))

export const facilityRelations = relations(facilities, ({ many }) => ({
  doctors: many(doctors),
  appointments: many(appointments),
}))

export const appointmentRelations = relations(
  appointments,
  ({ one, many }) => ({
    doctor: one(doctors, {
      fields: [appointments.doctorId],
      references: [doctors.id],
    }),
    patient: one(patients, {
      fields: [appointments.patientId],
      references: [patients.id],
    }),
    facility: one(facilities, {
      fields: [appointments.facility],
      references: [facilities.placeId],
    }),
    logs: many(appointmentLogs),
    review: one(reviews, {
      fields: [appointments.id],
      references: [reviews.appointmentId],
    }),
  }),
)

export const appointmentLogRelations = relations(
  appointmentLogs,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentLogs.appointmentId],
      references: [appointments.id],
    }),
  }),
)

export const specialtyRelations = relations(specialties, ({ many }) => ({
  doctors: many(doctors),
  subspecialties: many(subSpecialties),
}))

export const certificateRelations = relations(certificates, ({ one }) => ({
  doctor: one(doctors, {
    fields: [certificates.doctorId],
    references: [doctors.id],
  }),
}))

export const operatingHourRelations = relations(operatingHours, ({ one }) => ({
  doctor: one(doctors, {
    fields: [operatingHours.doctorId],
    references: [doctors.id],
  }),
}))

export const reviewRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
}))
