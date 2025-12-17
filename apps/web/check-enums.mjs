import postgres from 'postgres'

const sql = postgres(
  'postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb',
  {
    max: 1,
  },
)

async function checkAndFixEnums() {
  console.log('🔍 Checking database enum types...\n')

  try {
    // Check role enum
    const roleEnumValues = await sql`
      SELECT e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname = 'role'
      ORDER BY e.enumsortorder;
    `

    console.log(
      'Current role enum values:',
      roleEnumValues.map((r) => r.value).join(', '),
    )

    const hasAdmin = roleEnumValues.some((r) => r.value === 'admin')
    if (!hasAdmin) {
      console.log('Adding "admin" to role enum...')
      await sql`ALTER TYPE role ADD VALUE 'admin'`
      console.log('✅ Added "admin" to role enum')
    } else {
      console.log('✅ Role enum already has "admin"')
    }

    // Check prescription_status
    const prescriptionStatusExists = await sql`
      SELECT 1 FROM pg_type WHERE typname = 'prescription_status'
    `

    if (prescriptionStatusExists.length === 0) {
      console.log('Creating prescription_status enum...')
      await sql`CREATE TYPE prescription_status AS ENUM ('active', 'dispensed', 'expired', 'cancelled')`
      console.log('✅ prescription_status enum created')
    } else {
      console.log('✅ prescription_status enum exists')
    }

    console.log('\n✅ All enums are correctly configured!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await sql.end()
  }
}

checkAndFixEnums()
