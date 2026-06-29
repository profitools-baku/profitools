import { getDb } from './api/queries/connection';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function setup() {
  const db = getDb();
  try {
    console.log('Adding columns and constraints...');
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password text`);
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'`);
    try {
      await db.execute(sql`ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)`);
    } catch (e) {
      // Constraint might already exist
    }
    
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash('admin777', 10);
    
    console.log('Upserting admin...');
    await db.execute(sql`
      INSERT INTO users (name, email, password, role, "unionId") 
      VALUES ('Главный Админ', 'admin@zendor.tools', ${hashedPassword}, 'admin', '') 
      ON CONFLICT (email) 
      DO UPDATE SET role = 'admin', password = ${hashedPassword}
    `);
    
    console.log('✅ Admin account ready: admin@zendor.tools / admin777');
  } catch (e) {
    console.error('❌ Setup failed:', e);
  } finally {
    process.exit(0);
  }
}

setup();
