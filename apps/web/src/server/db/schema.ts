import { type InferSelectModel } from 'drizzle-orm'
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
} from 'drizzle-orm/pg-core'

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

export const appointmentTypesEnum = pgEnum('appointment_type', [
  'online',
  'physical',
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

export const users = pgTable('user', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  email: varchar('email'),
  phone: varchar('phone').unique(),
  password: varchar('password').notNull(),
  role: roleEnum('role').notNull(),
  dob: timestamp('dob'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
  isAdmin: boolean('is_admin').default(false),
})
export type User = InferSelectModel<typeof users>

export const sessions = pgTable('sessions', {
  id: varchar('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})
export type Session = InferSelectModel<typeof sessions>

export const patients = pgTable('patient', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  emergencyContact: varchar('emergency_contact'),
  lastAppointment: timestamp('last_appointment'),
})

export const doctors = pgTable('doctor', {
  id: uuid('id')
    .primaryKey()
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
  bio: varchar('bio'),
})

export const profilePictures = pgTable('profile_picture', {
  id: uuid('id')
    .primaryKey()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  url: varchar('url').notNull(),
  path: varchar('path').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})

export const certificates = pgTable('certificate', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  doctorId: uuid('doctor_id')
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
})

export const operatingHours = pgTable('operating_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
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

export const appointments = pgTable('appointment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  facility: varchar('facility_id')
    .notNull()
    .references(() => facilities.placeId, { onDelete: 'cascade' }),
  appointmentDate: timestamp('appointment_date').notNull(),
  type: appointmentTypesEnum('type').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
  notes: varchar('notes'),
  status: appointmentsStatusEnum('status').notNull(),
})

export const appointmentLogs = pgTable('appointment_log', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  status: appointmentsStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const reviews = pgTable('review', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id')
    .notNull()
    .references(() => appointments.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: varchar('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notifications = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  message: varchar('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
