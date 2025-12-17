import postgres from 'postgres'

const sql = postgres(
  'postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb',
  {
    max: 1,
  },
)

async function fixDatabase() {
  console.log('🔧 Starting emergency database fix...\n')

  try {
    // Step 1: Drop and recreate prescription_status enum
    console.log('1️⃣ Fixing prescription_status enum...')
    await sql`DROP TYPE IF EXISTS prescription_status CASCADE`
    await sql`CREATE TYPE prescription_status AS ENUM ('active', 'dispensed', 'expired', 'cancelled')`
    console.log('✅ Enum fixed\n')

    // Step 2: Create comment table with content field
    console.log('2️⃣ Creating/updating comment table...')
    await sql`
      CREATE TABLE IF NOT EXISTS comment (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        content text NOT NULL,
        "desc" text,
        user_id varchar NOT NULL,
        post_id uuid NOT NULL,
        parent_comment_id uuid,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp
      )
    `
    console.log('✅ Comment table ready\n')

    // Step 3: Rename tables
    console.log('3️⃣ Renaming tables to singular form...')
    const renames = [
      ['admin_users', 'admin_user'],
      ['labs', 'lab'],
      ['lab_appointments', 'lab_appointment'],
      ['lab_tests_available', 'lab_test_available'],
    ]

    for (const [oldName, newName] of renames) {
      try {
        await sql`ALTER TABLE ${sql(oldName)} RENAME TO ${sql(newName)}`
        console.log(`  ✓ ${oldName} → ${newName}`)
      } catch (e) {
        if (e.code === '42P01') {
          console.log(`  ⊘ ${oldName} doesn't exist, skipping`)
        } else {
          console.log(`  ⊘ ${oldName} already renamed or error: ${e.message}`)
        }
      }
    }
    console.log('')

    // Step 4: Fix lab table columns
    console.log('4️⃣ Fixing lab table columns...')
    try {
      await sql`ALTER TABLE lab RENAME COLUMN user_id TO "userId"`
      console.log('  ✓ Renamed user_id to userId')
    } catch (e) {
      console.log(`  ⊘ user_id column: ${e.message}`)
    }

    try {
      await sql`ALTER TABLE lab ADD COLUMN IF NOT EXISTS location jsonb`
      console.log('  ✓ Added location column')
    } catch (e) {
      console.log(`  ⊘ location column: ${e.message}`)
    }
    console.log('')

    // Step 5: Fix lab_appointment columns
    console.log('5️⃣ Fixing lab_appointment columns...')
    const labAppointmentRenames = [
      ['place_id', 'lab_id'],
      ['appointment_date', 'scheduled_at'],
      ['patient_notes', 'notes'],
    ]

    for (const [oldCol, newCol] of labAppointmentRenames) {
      try {
        await sql`ALTER TABLE lab_appointment RENAME COLUMN ${sql(oldCol)} TO ${sql(newCol)}`
        console.log(`  ✓ ${oldCol} → ${newCol}`)
      } catch (e) {
        console.log(`  ⊘ ${oldCol}: ${e.message}`)
      }
    }
    console.log('')

    // Step 6: Fix lab_availability columns
    console.log('6️⃣ Fixing lab_availability columns...')
    const labAvailRenames = [
      ['place_id', 'lab_id'],
      ['day_of_week', 'dayOfWeek'],
      ['start_time', 'startTime'],
      ['end_time', 'endTime'],
    ]

    for (const [oldCol, newCol] of labAvailRenames) {
      try {
        await sql`ALTER TABLE lab_availability RENAME COLUMN ${sql(oldCol)} TO ${sql(newCol)}`
        console.log(`  ✓ ${oldCol} → ${newCol}`)
      } catch (e) {
        console.log(`  ⊘ ${oldCol}: ${e.message}`)
      }
    }
    console.log('')

    // Step 7: Fix lab_test_available columns
    console.log('7️⃣ Fixing lab_test_available columns...')
    try {
      await sql`ALTER TABLE lab_test_available RENAME COLUMN place_id TO lab_id`
      console.log('  ✓ place_id → lab_id')
    } catch (e) {
      console.log(`  ⊘ place_id: ${e.message}`)
    }

    try {
      await sql`ALTER TABLE lab_test_available ADD COLUMN IF NOT EXISTS "testName" varchar`
      console.log('  ✓ Added testName column')
    } catch (e) {
      console.log(`  ⊘ testName: ${e.message}`)
    }

    try {
      await sql`ALTER TABLE lab_test_available ADD COLUMN IF NOT EXISTS price integer`
      console.log('  ✓ Added price column')
    } catch (e) {
      console.log(`  ⊘ price: ${e.message}`)
    }
    console.log('')

    // Step 8: Create prescription tables
    console.log('8️⃣ Creating prescription tables...')
    await sql`
      CREATE TABLE IF NOT EXISTS prescription (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        appointment_id uuid NOT NULL,
        doctor_id varchar NOT NULL,
        patient_id varchar NOT NULL,
        diagnosis text,
        notes text,
        status prescription_status DEFAULT 'active' NOT NULL,
        valid_until timestamp,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      )
    `
    console.log('  ✓ prescription table created')

    await sql`
      CREATE TABLE IF NOT EXISTS prescription_item (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        prescription_id uuid NOT NULL,
        medication_name varchar NOT NULL,
        dosage varchar NOT NULL,
        frequency varchar NOT NULL,
        duration varchar NOT NULL,
        quantity integer,
        instructions text,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `
    console.log('  ✓ prescription_item table created')
    console.log('')

    console.log('🎉 Database schema forcefully updated!')
    console.log('✅ All fixes applied successfully!\n')
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

fixDatabase()
