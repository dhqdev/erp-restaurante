import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('Creating database tables...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'garcom',
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create trial_status table
    await sql`
      CREATE TABLE IF NOT EXISTS trial_status (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        start_date TIMESTAMP DEFAULT NOW(),
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create foods table
    await sql`
      CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create tables table
    await sql`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'available',
        capacity INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id) NOT NULL,
        waiter_id INTEGER REFERENCES users(id) NOT NULL,
        items JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_date TIMESTAMP DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'completed',
        method TEXT
      );
    `;

    console.log('Database tables created successfully!');

    // Insert sample admin user
    const hashedPassword = '$2b$10$9zAHKf8QhkzQyKWTJsYY1.PSDxWW8W8c8QzHR5gXZBqQP4K4m9Wy2'; // password: admin123
    
    await sql`
      INSERT INTO users (email, password, name, role)
      VALUES ('admin@restaurante.com', ${hashedPassword}, 'Administrador', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `;

    // Get the admin user ID for trial status
    const adminUser = await sql`SELECT id FROM users WHERE email = 'admin@restaurante.com'`;
    if (adminUser.length > 0) {
      await sql`
        INSERT INTO trial_status (user_id, active)
        VALUES (${adminUser[0].id}, true)
        ON CONFLICT DO NOTHING;
      `;
    }

    // Insert sample tables
    await sql`
      INSERT INTO tables (name, capacity) VALUES 
      ('Mesa 01', 4),
      ('Mesa 02', 4),
      ('Mesa 03', 6),
      ('Mesa 04', 2),
      ('Mesa 05', 8)
      ON CONFLICT (name) DO NOTHING;
    `;

    // Insert sample menu items
    await sql`
      INSERT INTO foods (name, description, category, price, image) VALUES 
      ('Hambúrguer Artesanal', 'Hambúrguer 180g com queijo, alface, tomate e batata frita', 'Pratos Principais', 28.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300'),
      ('Pizza Margherita', 'Molho de tomate, mussarela, manjericão fresco', 'Pratos Principais', 32.90, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300'),
      ('Salada Caesar', 'Mix de folhas, croutons, parmesão e molho caesar', 'Entradas', 18.90, 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=300'),
      ('Refrigerante Lata', 'Coca-Cola, Pepsi ou Guaraná', 'Bebidas', 5.90, 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=300'),
      ('Suco Natural', 'Laranja, limão ou acerola', 'Bebidas', 8.90, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300'),
      ('Pudim de Leite', 'Pudim caseiro com calda de caramelo', 'Sobremesas', 12.90, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300')
      ON CONFLICT DO NOTHING;
    `;

    console.log('Sample data inserted successfully!');
    console.log('Admin user created: admin@restaurante.com / admin123');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();