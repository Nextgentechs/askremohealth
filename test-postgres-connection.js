// PostgreSQL Connection Test Script
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb';

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('🔄 Attempting to connect to PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query executed successfully:');
    console.log('   Current Time:', result.rows[0].current_time);
    console.log('   PostgreSQL Version:', result.rows[0].pg_version);
    
    // List tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log('   -', row.table_name);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('   Error details:', error);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

testConnection();
