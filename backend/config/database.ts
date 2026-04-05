import { newDb, DataType } from 'pg-mem';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an in-memory database
const db = newDb();

// Register uuid-ossp extension
db.registerExtension('uuid-ossp', (schema) => {
  schema.registerFunction({
    name: 'uuid_generate_v4',
    returns: DataType.uuid,
    implementation: () => crypto.randomUUID(),
    impure: true,
  });
});

// Get the connection pool
const { Pool } = db.adapters.createPg();
export const pool = new Pool();

// Initialize the database schema
const schemaPath = path.join(__dirname, 'schema.sql');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  try {
    db.public.none(schema);
    console.log('✅ In-memory database schema initialized');
    
    // Insert some mock data
    db.public.none(`
      INSERT INTO centers (id, name, address, phone, email)
      VALUES ('11111111-1111-1111-1111-111111111111', 'Happy Kids Daycare', '123 Main St', '555-0100', 'info@happykids.com');

      INSERT INTO users (id, center_id, email, password_hash, first_name, last_name, role)
      VALUES 
        ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@happykids.com', '$2b$10$X7/J.G2Q.B.H.0.Z.M.Q.O.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q', 'Admin', 'User', 'ADMIN'),
        ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'teacher@happykids.com', '$2b$10$X7/J.G2Q.B.H.0.Z.M.Q.O.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q', 'Teacher', 'Jane', 'TEACHER'),
        ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'parent@example.com', '$2b$10$X7/J.G2Q.B.H.0.Z.M.Q.O.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q', 'Parent', 'John', 'PARENT');

      INSERT INTO classrooms (id, center_id, name, capacity, age_group)
      VALUES ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Toddlers Room', 15, '1-3 years');
    `);
    console.log('✅ Mock data inserted');
  } catch (err) {
    console.error('❌ Error initializing schema:', err);
  }
} else {
  console.warn('⚠️ schema.sql not found at', schemaPath);
}

export const query = (text: string, params?: any[]) => pool.query(text, params);
