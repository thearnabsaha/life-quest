import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_bruICesG0FV2@ep-soft-dust-adje50wj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

const result = await sql`SELECT id, last_modified, last_source, 
  jsonb_array_length(data->'users') as user_count,
  jsonb_array_length(data->'xpLogs') as xp_count,
  jsonb_array_length(data->'calendarEntries') as cal_count
  FROM app_data WHERE id = 1`;

console.log('Direct Neon query result:');
console.log(JSON.stringify(result, null, 2));

// Also check health_ping
const ping = await sql`SELECT * FROM health_ping WHERE id = 1`;
console.log('\nhealth_ping:');
console.log(JSON.stringify(ping, null, 2));

// Test write-read on health_ping
const now = new Date().toISOString();
await sql`UPDATE health_ping SET ts = ${now}, source = 'direct-script' WHERE id = 1`;
const afterWrite = await sql`SELECT * FROM health_ping WHERE id = 1`;
console.log('\nAfter direct UPDATE:');
console.log(JSON.stringify(afterWrite, null, 2));
console.log('Expected ts:', now);
