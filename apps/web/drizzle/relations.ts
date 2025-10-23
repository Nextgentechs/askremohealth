import { relations } from "drizzle-orm/relations";
import { facility, doctor, officeLocation, specialty, user, appointment, appointmentLog, operatingHours, labs, certificate, review, patient, subSpecialty, labAvailability, articles, articleImages, labTestsAvailable, test, notification, appointmentAttachments, profilePicture } from "./schema";

export const doctorRelations = relations(doctor, ({one, many}) => ({
	facility: one(facility, {
		fields: [doctor.hospitalId],
		references: [facility.placeId]
	}),
	officeLocation: one(officeLocation, {
		fields: [doctor.officeId],
		references: [officeLocation.placeId]
	}),
	specialty: one(specialty, {
		fields: [doctor.specialtyId],
		references: [specialty.id]
	}),
	user: one(user, {
		fields: [doctor.userId],
		references: [user.id]
	}),
	operatingHours: many(operatingHours),
	certificates: many(certificate),
	reviews: many(review),
	appointments: many(appointment),
	profilePictures: many(profilePicture),
}));

export const facilityRelations = relations(facility, ({many}) => ({
	doctors: many(doctor),
}));

export const officeLocationRelations = relations(officeLocation, ({many}) => ({
	doctors: many(doctor),
}));

export const specialtyRelations = relations(specialty, ({many}) => ({
	doctors: many(doctor),
	subSpecialties: many(subSpecialty),
}));

export const userRelations = relations(user, ({many}) => ({
	doctors: many(doctor),
	labs: many(labs),
	patients: many(patient),
	notifications: many(notification),
}));

export const appointmentLogRelations = relations(appointmentLog, ({one}) => ({
	appointment: one(appointment, {
		fields: [appointmentLog.appointmentId],
		references: [appointment.id]
	}),
}));

export const appointmentRelations = relations(appointment, ({one, many}) => ({
	appointmentLogs: many(appointmentLog),
	reviews: many(review),
	doctor: one(doctor, {
		fields: [appointment.doctorId],
		references: [doctor.id]
	}),
	patient: one(patient, {
		fields: [appointment.patientId],
		references: [patient.id]
	}),
	appointmentAttachments: many(appointmentAttachments),
}));

export const operatingHoursRelations = relations(operatingHours, ({one}) => ({
	doctor: one(doctor, {
		fields: [operatingHours.doctorId],
		references: [doctor.id]
	}),
}));

export const labsRelations = relations(labs, ({one, many}) => ({
	user: one(user, {
		fields: [labs.userId],
		references: [user.id]
	}),
	labAvailabilities: many(labAvailability),
	labTestsAvailables: many(labTestsAvailable),
}));

export const certificateRelations = relations(certificate, ({one}) => ({
	doctor: one(doctor, {
		fields: [certificate.doctorId],
		references: [doctor.id]
	}),
}));

export const reviewRelations = relations(review, ({one}) => ({
	appointment: one(appointment, {
		fields: [review.appointmentId],
		references: [appointment.id]
	}),
	doctor: one(doctor, {
		fields: [review.doctorId],
		references: [doctor.id]
	}),
}));

export const patientRelations = relations(patient, ({one, many}) => ({
	user: one(user, {
		fields: [patient.userId],
		references: [user.id]
	}),
	appointments: many(appointment),
}));

export const subSpecialtyRelations = relations(subSpecialty, ({one}) => ({
	specialty: one(specialty, {
		fields: [subSpecialty.specialtyId],
		references: [specialty.id]
	}),
}));

export const labAvailabilityRelations = relations(labAvailability, ({one}) => ({
	lab: one(labs, {
		fields: [labAvailability.placeId],
		references: [labs.placeId]
	}),
}));

export const articleImagesRelations = relations(articleImages, ({one}) => ({
	article: one(articles, {
		fields: [articleImages.articleId],
		references: [articles.id]
	}),
}));

export const articlesRelations = relations(articles, ({many}) => ({
	articleImages: many(articleImages),
}));

export const labTestsAvailableRelations = relations(labTestsAvailable, ({one}) => ({
	lab: one(labs, {
		fields: [labTestsAvailable.placeId],
		references: [labs.placeId]
	}),
	test: one(test, {
		fields: [labTestsAvailable.testId],
		references: [test.id]
	}),
}));

export const testRelations = relations(test, ({many}) => ({
	labTestsAvailables: many(labTestsAvailable),
}));

export const notificationRelations = relations(notification, ({one}) => ({
	user: one(user, {
		fields: [notification.userId],
		references: [user.id]
	}),
}));

export const appointmentAttachmentsRelations = relations(appointmentAttachments, ({one}) => ({
	appointment: one(appointment, {
		fields: [appointmentAttachments.appointmentId],
		references: [appointment.id]
	}),
}));

export const profilePictureRelations = relations(profilePicture, ({one}) => ({
	doctor: one(doctor, {
		fields: [profilePicture.doctorId],
		references: [doctor.id]
	}),
}));