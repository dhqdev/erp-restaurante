import postgres from 'postgres';
import bcrypt from 'bcrypt';

const sql = postgres(process.env.DATABASE_URL);

async function createAdmin() {
  try {
    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin user with the correct hash
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE email = 'admin@restaurante.com';
    `;
    
    console.log('Admin password updated successfully!');
    console.log('Login with: admin@restaurante.com / admin123');
    
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await sql.end();
  }
}

createAdmin();