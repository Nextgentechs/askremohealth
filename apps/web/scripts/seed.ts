/**
 * Database Seed Script
 *
 * Seeds the database with sample data for development and testing.
 *
 * Usage:
 *   npm run db:seed
 *
 * IMPORTANT: This script should only be run in development environments.
 * It will create sample users, doctors, patients, facilities, and appointments.
 */

import { db } from '../src/server/db'
import {
  appointments,
  doctors,
  facilities,
  operatingHours,
  patients,
  specialties,
  users,
} from '../src/server/db/schema'

const COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Kiambu',
  'Machakos',
  'Nyeri',
]

const SPECIALTIES_DATA = [
  { name: 'General Practice', icon: 'stethoscope' },
  { name: 'Cardiology', icon: 'heart' },
  { name: 'Dermatology', icon: 'skin' },
  { name: 'Pediatrics', icon: 'baby' },
  { name: 'Gynecology', icon: 'female' },
  { name: 'Orthopedics', icon: 'bone' },
  { name: 'Neurology', icon: 'brain' },
  { name: 'Ophthalmology', icon: 'eye' },
  { name: 'ENT', icon: 'ear' },
  { name: 'Psychiatry', icon: 'mind' },
]

const FACILITIES_DATA = [
  {
    placeId: 'seed-hospital-1',
    name: 'Nairobi Central Hospital',
    address: 'Kenyatta Avenue, Nairobi',
    county: 'Nairobi',
    town: 'Nairobi CBD',
    type: 'hospital',
    phone: '+254 20 123 4567',
    verified: true,
  },
  {
    placeId: 'seed-hospital-2',
    name: 'Mombasa General Hospital',
    address: 'Moi Avenue, Mombasa',
    county: 'Mombasa',
    town: 'Mombasa Island',
    type: 'hospital',
    phone: '+254 41 234 5678',
    verified: true,
  },
  {
    placeId: 'seed-lab-1',
    name: 'Lancet Laboratories',
    address: 'Westlands, Nairobi',
    county: 'Nairobi',
    town: 'Westlands',
    type: 'laboratory',
    phone: '+254 20 345 6789',
    verified: true,
  },
  {
    placeId: 'seed-lab-2',
    name: 'Pathologists Lancet Kenya',
    address: 'Upper Hill, Nairobi',
    county: 'Nairobi',
    town: 'Upper Hill',
    type: 'laboratory',
    phone: '+254 20 456 7890',
    verified: true,
  },
  {
    placeId: 'seed-pharmacy-1',
    name: 'HealthPlus Pharmacy',
    address: 'Kenyatta Market, Nairobi',
    county: 'Nairobi',
    town: 'Kilimani',
    type: 'pharmacy',
    phone: '+254 20 567 8901',
    verified: true,
  },
  {
    placeId: 'seed-pharmacy-2',
    name: 'MedCare Chemist',
    address: 'Nyali, Mombasa',
    county: 'Mombasa',
    town: 'Nyali',
    type: 'pharmacy',
    phone: '+254 41 678 9012',
    verified: true,
  },
]

const DOCTOR_NAMES = [
  { firstName: 'James', lastName: 'Kimani' },
  { firstName: 'Mary', lastName: 'Wanjiku' },
  { firstName: 'Peter', lastName: 'Ochieng' },
  { firstName: 'Sarah', lastName: 'Muthoni' },
  { firstName: 'John', lastName: 'Kipchoge' },
  { firstName: 'Grace', lastName: 'Akinyi' },
  { firstName: 'David', lastName: 'Mutua' },
  { firstName: 'Lucy', lastName: 'Njeri' },
]

const PATIENT_NAMES = [
  { firstName: 'Kevin', lastName: 'Ouma' },
  { firstName: 'Faith', lastName: 'Wambui' },
  { firstName: 'Brian', lastName: 'Kiptoo' },
  { firstName: 'Ann', lastName: 'Moraa' },
  { firstName: 'Daniel', lastName: 'Otieno' },
]

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Check if data already exists
    const existingSpecialties = await db.select().from(specialties).limit(1)
    if (existingSpecialties.length > 0) {
      console.log('⚠️  Database already has data. Skipping seed.')
      console.log('   To reseed, run: npm run db:reset && npm run db:seed')
      return
    }

    // 1. Seed specialties
    console.log('📋 Seeding specialties...')
    const insertedSpecialties = await db
      .insert(specialties)
      .values(SPECIALTIES_DATA)
      .returning()
    console.log(`   ✓ Created ${insertedSpecialties.length} specialties`)

    // 2. Seed facilities
    console.log('🏥 Seeding facilities...')
    const insertedFacilities = await db
      .insert(facilities)
      .values(FACILITIES_DATA)
      .returning()
    console.log(`   ✓ Created ${insertedFacilities.length} facilities`)

    // 3. Seed users (doctors)
    console.log('👨‍⚕️ Seeding doctors...')
    const doctorUsers = await db
      .insert(users)
      .values(
        DOCTOR_NAMES.map((name, i) => ({
          id: `seed-doctor-${i + 1}`,
          firstName: name.firstName,
          lastName: name.lastName,
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@example.com`,
          phone: `+254 7${i}0 ${100 + i}${200 + i} ${300 + i}${400 + i}`,
          password: '$2a$10$dummy.hashed.password.for.seed.data.only',
          role: 'doctor' as const,
          onboardingComplete: true,
        })),
      )
      .returning()

    const insertedDoctors = await db
      .insert(doctors)
      .values(
        doctorUsers.map((user, i) => ({
          id: user.id,
          userId: user.id,
          specialty: insertedSpecialties[i % insertedSpecialties.length]!.id,
          experience: 5 + i * 2,
          licenseNumber: `KEN-MD-${10000 + i}`,
          facility: insertedFacilities[i % 2]!.placeId,
          bio: `Dr. ${user.firstName} ${user.lastName} is an experienced ${insertedSpecialties[i % insertedSpecialties.length]!.name} specialist with over ${5 + i * 2} years of practice.`,
          gender: i % 2 === 0 ? ('male' as const) : ('female' as const),
          title: 'Dr.',
          consultationFee: 1500 + i * 500,
          status: 'verified' as const,
        })),
      )
      .returning()

    // Add operating hours for doctors
    for (const doctor of insertedDoctors) {
      await db.insert(operatingHours).values({
        doctorId: doctor.id,
        consultationDuration: 30,
        schedule: [
          { day: 'monday', opening: '09:00', closing: '17:00', isOpen: true },
          { day: 'tuesday', opening: '09:00', closing: '17:00', isOpen: true },
          {
            day: 'wednesday',
            opening: '09:00',
            closing: '17:00',
            isOpen: true,
          },
          { day: 'thursday', opening: '09:00', closing: '17:00', isOpen: true },
          { day: 'friday', opening: '09:00', closing: '15:00', isOpen: true },
          { day: 'saturday', opening: '10:00', closing: '13:00', isOpen: true },
          { day: 'sunday', opening: null, closing: null, isOpen: false },
        ],
      })
    }
    console.log(
      `   ✓ Created ${insertedDoctors.length} doctors with operating hours`,
    )

    // 4. Seed users (patients)
    console.log('🧑‍🤝‍🧑 Seeding patients...')
    const patientUsers = await db
      .insert(users)
      .values(
        PATIENT_NAMES.map((name, i) => ({
          id: `seed-patient-${i + 1}`,
          firstName: name.firstName,
          lastName: name.lastName,
          email: `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}@example.com`,
          phone: `+254 7${i + 5}0 ${500 + i}${600 + i} ${700 + i}${800 + i}`,
          password: '$2a$10$dummy.hashed.password.for.seed.data.only',
          role: 'patient' as const,
          onboardingComplete: true,
        })),
      )
      .returning()

    const insertedPatients = await db
      .insert(patients)
      .values(
        patientUsers.map((user) => ({
          id: user.id,
          userId: user.id,
          phone: user.phone,
        })),
      )
      .returning()
    console.log(`   ✓ Created ${insertedPatients.length} patients`)

    // 5. Seed sample appointments
    console.log('📅 Seeding appointments...')
    const now = new Date()
    const appointmentData = []

    for (let i = 0; i < 10; i++) {
      const appointmentDate = new Date(now)
      appointmentDate.setDate(appointmentDate.getDate() + (i % 14) - 3) // Past 3 days to 10 days future
      appointmentDate.setHours(9 + (i % 8), 0, 0, 0)

      appointmentData.push({
        doctorId: insertedDoctors[i % insertedDoctors.length]!.id,
        patientId: insertedPatients[i % insertedPatients.length]!.id,
        appointmentDate,
        type: i % 2 === 0 ? ('online' as const) : ('physical' as const),
        status: i < 3 ? ('completed' as const) : ('scheduled' as const),
        patientNotes: i % 3 === 0 ? 'Regular checkup' : null,
      })
    }

    const insertedAppointments = await db
      .insert(appointments)
      .values(appointmentData)
      .returning()
    console.log(`   ✓ Created ${insertedAppointments.length} appointments`)

    console.log('')
    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - ${insertedSpecialties.length} specialties`)
    console.log(
      `   - ${insertedFacilities.length} facilities (hospitals, labs, pharmacies)`,
    )
    console.log(`   - ${insertedDoctors.length} doctors`)
    console.log(`   - ${insertedPatients.length} patients`)
    console.log(`   - ${insertedAppointments.length} appointments`)
    console.log('')
    console.log('🔑 Test credentials:')
    console.log(
      '   Doctors: james.kimani@example.com, mary.wanjiku@example.com, etc.',
    )
    console.log(
      '   Patients: kevin.ouma@example.com, faith.wambui@example.com, etc.',
    )
    console.log('   (Use password reset flow as passwords are dummy hashes)')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
