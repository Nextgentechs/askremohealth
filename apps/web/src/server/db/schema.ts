import { sql, type InferSelectModel } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

/**
 * Database Schema for Ask Remo Health
 *
 * This file defines the complete database schema using Drizzle ORM.
 * All tables include proper constraints, indexes, and documentation.
 *
 * SECURITY NOTES:
 * - Soft deletes implemented via deletedAt column for audit trails
 * - Unique constraints on email to prevent duplicate accounts
 * - Proper foreign key relationships with cascade deletes
 *
 * PERFORMANCE NOTES:
 * - Indexes added on frequently queried columns
 * - Composite indexes for common query patterns
 */

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum('role', ['patient', 'doctor', 'admin'])

export const weekDayEnum = pgEnum('week_day', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
])

export const appointmentsStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'pending',
  'completed',
  'cancelled',
  'rescheduled',
  'missed',
  'in_progress',
])

export const genderEnum = pgEnum('gender', ['male', 'female'])

export const appointmentTypesEnum = pgEnum('appointment_type', [
  'online',
  'physical',
])

export const doctorStatusEnum = pgEnum('doctor_status', [
  'pending',
  'verified',
  'rejected',
])

export const specialties = pgTable('specialty', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  icon: varchar('icon'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const subSpecialties = pgTable('sub_specialty', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name').notNull(),
  specialty: uuid('specialty_id')
    .notNull()
    .references(() => specialties.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Users Table - Core user accounts for all roles
 *
 * SECURITY: Email has unique constraint to prevent duplicate accounts
 * AUDIT: Includes deletedAt for soft deletes and audit trail
 */
export const users = pgTable(
  'user',
  {
    id: varchar('id')
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    firstName: varchar('first_name').notNull(),
    lastName: varchar('last_name').notNull(),
    email: varchar('email').unique(), // SECURITY: Unique constraint prevents duplicate accounts
    emailVerified: boolean('email_verified').default(false), // For email verification flow
    phone: varchar('phone').unique(),
    password: varchar('password').notNull(),
    role: roleEnum('role').notNull(),
    onboardingComplete: boolean('onboarding_complete').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow() // Fix: Added defaultNow() to prevent NOT NULL constraint errors
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'), // Soft delete support for audit trail
  },
  (table) => ({
    // Performance indexes for common queries
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
  }),
)
export type User = InferSelectModel<typeof users>

/**
 * Patients Table - Extended profile for patient users
 */
export const patients = pgTable(
  'patient',
  {
    id: varchar('id').primaryKey().notNull(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    emergencyContact: varchar('emergency_contact'),
    phone: varchar('phone').unique(),
    lastAppointment: timestamp('last_appointment'),
    dob: timestamp('dob'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow() // Fix: Added default to prevent NOT NULL errors
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'), // Soft delete support
  },
  (table) => ({
    userIdIdx: index('patients_user_id_idx').on(table.userId),
  }),
)
export type Patient = InferSelectModel<typeof patients>

/**
 * Doctors Table - Extended profile for doctor/specialist users
 *
 * PERFORMANCE: Indexes on specialty, status, and facility for common queries
 */
export const doctors = pgTable(
  'doctor',
  {
    id: varchar('id').primaryKey().notNull(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    specialty: uuid('specialty_id').references(() => specialties.id, {
      onDelete: 'set null',
    }),
    subSpecialties: jsonb('sub_specialties')
      .$type<Array<{ id: string }>>()
      .default([]),
    experience: integer('experience'),
    licenseNumber: varchar('registration_number'),
    facility: varchar('hospital_id').references(() => facilities.placeId, {
      onDelete: 'set null',
    }),
    officeId: varchar('office_id').references(() => officeLocation.placeId, {
      onDelete: 'set null',
    }),
    bio: varchar('bio'),
    gender: genderEnum('gender'),
    title: varchar('title'),
    phone: varchar('phone').unique(),
    consultationFee: integer('consultation_fee'),
    status: doctorStatusEnum('status').default('pending'),
    dob: timestamp('dob'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow() // Fix: Added default to prevent NOT NULL errors
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'), // Soft delete support
  },
  (table) => ({
    // Performance indexes for doctor listing and filtering
    specialtyIdx: index('doctors_specialty_idx').on(table.specialty),
    statusIdx: index('doctors_status_idx').on(table.status),
    facilityIdx: index('doctors_facility_idx').on(table.facility),
    userIdIdx: index('doctors_user_id_idx').on(table.userId),
  }),
)
export type Doctor = InferSelectModel<typeof doctors>

export const profilePictures = pgTable('profile_picture', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  doctorId: varchar('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  url: varchar('url').notNull(),
  path: varchar('path').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const certificates = pgTable('certificate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  doctorId: varchar('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  url: varchar('url').notNull(),
  issuedBy: varchar('issued_by'),
  issuedAt: timestamp('issued_at'),
  expiryDate: timestamp('expiry_date'),
})

export const facilities = pgTable('facility', {
  placeId: varchar('place_id').primaryKey(),
  name: varchar('name').notNull(),
  location: jsonb('location').$type<{ lat: number; lng: number }>(),
  address: varchar('address').notNull(),
  county: varchar('county').notNull(),
  town: varchar('town').notNull(),
  phone: varchar('phone'),
  website: varchar('website'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  type: varchar('type'),
})

export const officeLocation = pgTable('office_location', {
  placeId: varchar('place_id').primaryKey(),
  name: varchar('name').notNull(),
  location: jsonb('location').$type<{ lat: number; lng: number }>(),
  address: varchar('address').notNull(),
  county: varchar('county').notNull(),
  town: varchar('town').notNull(),
  phone: varchar('phone'),
  website: varchar('website'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  type: varchar('type'),
})

export const operatingHours = pgTable('operating_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: varchar('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  consultationDuration: integer('consultation_duration'),
  schedule: jsonb('schedule')
    .$type<
      Array<{
        day: string
        opening: string | null
        closing: string | null
        isOpen: boolean
      }>
    >()
    .default([]),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  }).$onUpdate(() => new Date()),
})

/**
 * Appointments Table - Patient-Doctor appointment bookings
 *
 * PERFORMANCE: Indexes on doctorId, patientId, appointmentDate for common queries
 * BUSINESS RULE: Unique constraint on doctor+date+time would prevent double bookings
 */
export const appointments = pgTable(
  'appointment',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    doctorId: varchar('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade' }),
    patientId: varchar('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    appointmentDate: timestamp('appointment_date').notNull(),
    type: appointmentTypesEnum('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow() // Fix: Added default to prevent NOT NULL errors
      .$onUpdate(() => new Date()),
    patientNotes: varchar('patient_notes'),
    doctorNotes: varchar('doctor_notes'),
    status: appointmentsStatusEnum('status').notNull(),
    cancelledBy: varchar('cancelled_by'), // Track who cancelled the appointment
    cancellationReason: varchar('cancellation_reason'), // Required when cancelling
    // Reminder tracking to prevent duplicate notifications
    reminder24hSentAt: timestamp('reminder_24h_sent_at'),
    reminder1hSentAt: timestamp('reminder_1h_sent_at'),
  },
  (table) => ({
    // Performance indexes for appointment queries
    doctorIdIdx: index('appointments_doctor_id_idx').on(table.doctorId),
    patientIdIdx: index('appointments_patient_id_idx').on(table.patientId),
    dateIdx: index('appointments_date_idx').on(table.appointmentDate),
    statusIdx: index('appointments_status_idx').on(table.status),
  }),
)

export const appointmentAttachments = pgTable('appointment_attachments', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  url: varchar('url').notNull(),
  path: varchar('path').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const appointmentLogs = pgTable('appointment_log', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  status: appointmentsStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/**
 * Reviews Table - Patient reviews for doctors after appointments
 *
 * BUSINESS RULE: doctorId is now required to ensure review integrity
 */
export const reviews = pgTable(
  'review',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    appointmentId: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    doctorId: varchar('doctor_id')
      .notNull() // Fix: Made required to prevent orphan reviews
      .references(() => doctors.id, { onDelete: 'cascade' }),
    patientId: varchar('patient_id') // Added for tracking who left the review
      .references(() => patients.id, { onDelete: 'set null' }),
    rating: integer('rating').notNull(),
    comment: varchar('comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    doctorIdIdx: index('reviews_doctor_id_idx').on(table.doctorId),
    appointmentIdIdx: index('reviews_appointment_id_idx').on(
      table.appointmentId,
    ),
  }),
)

/**
 * Notifications Table - User notifications for various events
 *
 * Supports appointment reminders, status updates, and system messages
 */
export const notifications = pgTable(
  'notification',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type'), // 'appointment_reminder', 'appointment_confirmed', 'system', etc.
    title: varchar('title').notNull(),
    message: text('message').notNull(),
    link: varchar('link'), // Optional link to navigate to when clicked
    metadata: text('metadata'), // JSON string for additional data (appointmentId, etc.)
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  }),
)

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: varchar('author_id').notNull(),
  title: varchar('title').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const article_images = pgTable('article_images', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  articleId: uuid('article_id')
    .notNull()
    .unique()
    .references(() => articles.id, { onDelete: 'cascade' }),
  url: varchar('url').notNull(),
  path: varchar('path').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})
