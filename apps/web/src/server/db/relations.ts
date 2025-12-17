import { relations } from 'drizzle-orm'
import {
  appointmentAttachments,
  appointmentLogs,
  appointments,
  article_images,
  articles,
  certificates,
  doctors,
  facilities,
  notifications,
  officeLocation,
  operatingHours,
  patients,
  prescriptionItems,
  prescriptions,
  profilePictures,
  reviews,
  specialties,
  subSpecialties,
  users,
} from './schema'

export const doctorRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  specialty: one(specialties, {
    fields: [doctors.specialty],
    references: [specialties.id],
  }),
  facility: one(facilities, {
    fields: [doctors.facility],
    references: [facilities.placeId],
  }),
  office: one(officeLocation, {
    fields: [doctors.officeId],
    references: [officeLocation.placeId],
  }),
  profilePicture: one(profilePictures, {
    fields: [doctors.id],
    references: [profilePictures.doctorId],
  }),
  certificates: many(certificates),
  operatingHours: many(operatingHours),
  appointments: many(appointments),
  reviews: many(reviews),
  prescriptions: many(prescriptions),
}))

export const patientRelations = relations(patients, ({ many, one }) => ({
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
}))

export const userRelations = relations(users, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  notifications: many(notifications),
  articles: many(articles),
}))

export const facilityRelations = relations(facilities, ({ many }) => ({
  doctors: many(doctors),
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
    logs: many(appointmentLogs),
    review: one(reviews, {
      fields: [appointments.id],
      references: [reviews.appointmentId],
    }),
    attachments: many(appointmentAttachments),
    prescription: one(prescriptions, {
      fields: [appointments.id],
      references: [prescriptions.appointmentId],
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
  doctor: one(doctors, {
    fields: [reviews.doctorId],
    references: [doctors.id],
  }),
}))

export const appointmentAttachmentRelations = relations(
  appointmentAttachments,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentAttachments.appointmentId],
      references: [appointments.id],
    }),
  }),
)

export const profilePictureRelations = relations(
  profilePictures,
  ({ one }) => ({
    doctor: one(doctors, {
      fields: [profilePictures.doctorId],
      references: [doctors.id],
    }),
  }),
)

export const articleRelations = relations(articles, ({ one }) => ({
  image: one(article_images, {
    fields: [articles.id],
    references: [article_images.articleId],
  }),
}))

export const articleImageRelations = relations(article_images, ({ one }) => ({
  article: one(articles, {
    fields: [article_images.articleId],
    references: [articles.id],
  }),
}))

export const prescriptionRelations = relations(
  prescriptions,
  ({ one, many }) => ({
    appointment: one(appointments, {
      fields: [prescriptions.appointmentId],
      references: [appointments.id],
    }),
    doctor: one(doctors, {
      fields: [prescriptions.doctorId],
      references: [doctors.id],
    }),
    patient: one(patients, {
      fields: [prescriptions.patientId],
      references: [patients.id],
    }),
    items: many(prescriptionItems),
  }),
)

export const prescriptionItemRelations = relations(
  prescriptionItems,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionItems.prescriptionId],
      references: [prescriptions.id],
    }),
  }),
)
