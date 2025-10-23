import { pgTable, foreignKey, varchar, uuid, jsonb, integer, timestamp, boolean, text, serial, bigint, time, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const appointmentStatus = pgEnum("appointment_status", ['scheduled', 'pending', 'completed', 'cancelled', 'rescheduled', 'missed', 'in_progress'])
export const appointmentType = pgEnum("appointment_type", ['online', 'physical'])
export const collection = pgEnum("collection", ['onsite', 'home', 'both'])
export const collectionMethod = pgEnum("collection_method", ['onsite', 'home', 'both'])
export const doctorStatus = pgEnum("doctor_status", ['pending', 'verified', 'rejected'])
export const gender = pgEnum("gender", ['male', 'female'])
export const role = pgEnum("role", ['patient', 'doctor', 'lab', 'admin'])
export const weekDay = pgEnum("week_day", ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])



export const doctor = pgTable("doctor", {
	id: varchar("id").notNull(),
	specialtyId: uuid("specialty_id"),
	subSpecialties: jsonb("sub_specialties").default([]),
	experience: integer("experience"),
	registrationNumber: varchar("registration_number"),
	hospitalId: varchar("hospital_id"),
	bio: varchar("bio"),
	gender: gender("gender"),
	title: varchar("title"),
	consultationFee: integer("consultation_fee"),
	status: doctorStatus("status").default('pending'),
	dob: timestamp("dob", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	userId: varchar("user_id").notNull(),
	phone: varchar("phone"),
	officeId: varchar("office_id"),
},
(table) => {
	return {
		doctorHospitalIdFacilityPlaceIdFk: foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [facility.placeId],
			name: "doctor_hospital_id_facility_place_id_fk"
		}).onDelete("set null"),
		doctorOfficeIdOfficeLocationPlaceIdFk: foreignKey({
			columns: [table.officeId],
			foreignColumns: [officeLocation.placeId],
			name: "doctor_office_id_office_location_place_id_fk"
		}).onDelete("set null"),
		doctorSpecialtyIdSpecialtyIdFk: foreignKey({
			columns: [table.specialtyId],
			foreignColumns: [specialty.id],
			name: "doctor_specialty_id_specialty_id_fk"
		}).onDelete("set null"),
		doctorUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "doctor_user_id_user_id_fk"
		}).onDelete("cascade"),
	}
});

export const appointmentLog = pgTable("appointment_log", {
	id: uuid("id").defaultRandom().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	status: appointmentStatus("status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		appointmentLogAppointmentIdAppointmentIdFk: foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointment.id],
			name: "appointment_log_appointment_id_appointment_id_fk"
		}).onDelete("cascade"),
	}
});

export const operatingHours = pgTable("operating_hours", {
	id: uuid("id").defaultRandom().notNull(),
	doctorId: varchar("doctor_id").notNull(),
	consultationDuration: integer("consultation_duration"),
	schedule: jsonb("schedule").default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
},
(table) => {
	return {
		operatingHoursDoctorIdDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctor.id],
			name: "operating_hours_doctor_id_doctor_id_fk"
		}).onDelete("cascade"),
	}
});

export const officeLocation = pgTable("office_location", {
	placeId: varchar("place_id").notNull(),
	name: varchar("name").notNull(),
	location: jsonb("location"),
	address: varchar("address").notNull(),
	county: varchar("county").notNull(),
	town: varchar("town").notNull(),
	phone: varchar("phone"),
	website: varchar("website"),
	verified: boolean("verified").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	type: varchar("type"),
});

export const specialty = pgTable("specialty", {
	id: uuid("id").defaultRandom().notNull(),
	name: varchar("name").notNull(),
	icon: varchar("icon"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
	id: varchar("id").primaryKey().notNull().default(sql`gen_random_uuid()`),
	firstName: varchar("first_name").notNull(),
	lastName: varchar("last_name").notNull(),
	email: varchar("email"),
	phone: varchar("phone"),
	password: varchar("password").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
	role: role("role").notNull(),
});

export const articles = pgTable("articles", {
	id: uuid("id").defaultRandom().notNull(),
	authorId: varchar("author_id").notNull(),
	title: varchar("title").notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const labs = pgTable("labs", {
	placeId: varchar("place_id").notNull(),
	userId: varchar("user_id").notNull(),
	name: varchar("name").notNull(),
	location: jsonb("location"),
	address: varchar("address").notNull(),
	county: varchar("county").notNull(),
	town: varchar("town").notNull(),
	phone: varchar("phone"),
	website: varchar("website"),
},
(table) => {
	return {
		labsUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "labs_user_id_user_id_fk"
		}).onDelete("cascade"),
	}
});

export const certificate = pgTable("certificate", {
	id: uuid("id").defaultRandom().notNull(),
	doctorId: varchar("doctor_id").notNull(),
	name: varchar("name").notNull(),
	url: varchar("url").notNull(),
	issuedBy: varchar("issued_by"),
	issuedAt: timestamp("issued_at", { mode: 'string' }),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
},
(table) => {
	return {
		certificateDoctorIdDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctor.id],
			name: "certificate_doctor_id_doctor_id_fk"
		}).onDelete("cascade"),
	}
});

export const review = pgTable("review", {
	id: uuid("id").defaultRandom().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	doctorId: varchar("doctor_id"),
	rating: integer("rating").notNull(),
	comment: varchar("comment"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		reviewAppointmentIdAppointmentIdFk: foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointment.id],
			name: "review_appointment_id_appointment_id_fk"
		}).onDelete("cascade"),
		reviewDoctorIdDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctor.id],
			name: "review_doctor_id_doctor_id_fk"
		}).onDelete("cascade"),
	}
});

export const patient = pgTable("patient", {
	id: varchar("id").notNull(),
	emergencyContact: varchar("emergency_contact"),
	lastAppointment: timestamp("last_appointment", { mode: 'string' }),
	dob: timestamp("dob", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	userId: varchar("user_id").notNull(),
	phone: varchar("phone"),
},
(table) => {
	return {
		patientUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "patient_user_id_user_id_fk"
		}).onDelete("cascade"),
	}
});

export const subSpecialty = pgTable("sub_specialty", {
	id: uuid("id").defaultRandom().notNull(),
	name: varchar("name").notNull(),
	specialtyId: uuid("specialty_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		subSpecialtySpecialtyIdSpecialtyIdFk: foreignKey({
			columns: [table.specialtyId],
			foreignColumns: [specialty.id],
			name: "sub_specialty_specialty_id_specialty_id_fk"
		}).onDelete("cascade"),
	}
});

export const test = pgTable("test", {
	id: uuid("id").defaultRandom().notNull(),
	loincTestId: varchar("loinc_test_id", { length: 100 }),
	specificCategory: varchar("specific_category", { length: 255 }),
	sampleType: varchar("sample_type", { length: 255 }),
	name: varchar("name").notNull(),
	generalCategory: varchar("general_category", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const drizzleMigrations = pgTable("__drizzle_migrations", {
	id: serial("id").primaryKey().notNull(),
	hash: text("hash").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdAt: bigint("created_at", { mode: "number" }),
});

export const facility = pgTable("facility", {
	placeId: varchar("place_id").notNull(),
	name: varchar("name").notNull(),
	location: jsonb("location"),
	address: varchar("address").notNull(),
	county: varchar("county").notNull(),
	town: varchar("town").notNull(),
	phone: varchar("phone"),
	website: varchar("website"),
	verified: boolean("verified").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	type: varchar("type"),
});

export const labAvailability = pgTable("lab_availability", {
	id: uuid("id").defaultRandom().notNull(),
	placeId: varchar("place_id").notNull(),
	dayOfWeek: weekDay("day_of_week").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
},
(table) => {
	return {
		labAvailabilityPlaceIdLabsPlaceIdFk: foreignKey({
			columns: [table.placeId],
			foreignColumns: [labs.placeId],
			name: "lab_availability_place_id_labs_place_id_fk"
		}).onDelete("cascade"),
	}
});

export const articleImages = pgTable("article_images", {
	id: uuid("id").defaultRandom().notNull(),
	articleId: uuid("article_id").notNull(),
	url: varchar("url").notNull(),
	path: varchar("path").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => {
	return {
		articleImagesArticleIdArticlesIdFk: foreignKey({
			columns: [table.articleId],
			foreignColumns: [articles.id],
			name: "article_images_article_id_articles_id_fk"
		}).onDelete("cascade"),
	}
});

export const labTestsAvailable = pgTable("lab_tests_available", {
	id: uuid("id").defaultRandom().notNull(),
	testId: uuid("test_id").notNull(),
	amount: integer("amount").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	collection: collection("collection").notNull(),
	placeId: varchar("place_id").notNull(),
},
(table) => {
	return {
		labTestsAvailablePlaceIdLabsPlaceIdFk: foreignKey({
			columns: [table.placeId],
			foreignColumns: [labs.placeId],
			name: "lab_tests_available_place_id_labs_place_id_fk"
		}).onDelete("cascade"),
		labTestsAvailableTestIdTestIdFk: foreignKey({
			columns: [table.testId],
			foreignColumns: [test.id],
			name: "lab_tests_available_test_id_test_id_fk"
		}).onDelete("cascade"),
	}
});

export const notification = pgTable("notification", {
	id: uuid("id").defaultRandom().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar("title").notNull(),
	message: varchar("message").notNull(),
	isRead: boolean("is_read").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		notificationUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "notification_user_id_user_id_fk"
		}).onDelete("cascade"),
	}
});

export const appointment = pgTable("appointment", {
	id: uuid("id").defaultRandom().notNull(),
	doctorId: varchar("doctor_id").notNull(),
	patientId: varchar("patient_id").notNull(),
	appointmentDate: timestamp("appointment_date", { mode: 'string' }).notNull(),
	type: appointmentType("type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	patientNotes: varchar("patient_notes"),
	doctorNotes: varchar("doctor_notes"),
	status: appointmentStatus("status").notNull(),
},
(table) => {
	return {
		appointmentDoctorIdDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctor.id],
			name: "appointment_doctor_id_doctor_id_fk"
		}).onDelete("cascade"),
		appointmentPatientIdPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [patient.id],
			name: "appointment_patient_id_patient_id_fk"
		}).onDelete("cascade"),
	}
});

export const appointmentAttachments = pgTable("appointment_attachments", {
	id: uuid("id").defaultRandom().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	url: varchar("url").notNull(),
	path: varchar("path").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		appointmentAttachmentsAppointmentIdAppointmentIdFk: foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointment.id],
			name: "appointment_attachments_appointment_id_appointment_id_fk"
		}).onDelete("cascade"),
	}
});

export const profilePicture = pgTable("profile_picture", {
	id: uuid("id").defaultRandom().notNull(),
	doctorId: varchar("doctor_id").notNull(),
	url: varchar("url").notNull(),
	path: varchar("path").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
},
(table) => {
	return {
		profilePictureDoctorIdDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctor.id],
			name: "profile_picture_doctor_id_doctor_id_fk"
		}).onDelete("cascade"),
	}
});

export const labAppointments = pgTable("lab_appointments", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	placeId: varchar("place_id").notNull(),
	patientId: varchar("patient_id").notNull(),
	doctorId: varchar("doctor_id"),
	appointmentDate: timestamp("appointment_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	patientNotes: varchar("patient_notes"),
	doctorNotes: varchar("doctor_notes"),
	status: appointmentStatus("status").default('pending').notNull(),
});