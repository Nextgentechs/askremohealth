// PostgreSQL Connection Test Script
import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://cloud_admin:yaZM4jvs2TOk@144.91.78.222:5432/neondb';

async function dumpSchema() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    const query = `
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
      ORDER BY 
        table_name, ordinal_position;
    `;
    
    const res = await client.query(query);
    
    const schema = {};
    res.rows.forEach(row => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        default: row.column_default
      });
    });

    fs.writeFileSync('db_schema_dump.json', JSON.stringify(schema, null, 2));
    console.log('Schema dumped to db_schema_dump.json');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

dumpSchema();
