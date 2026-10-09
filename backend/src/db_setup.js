const db = require('./config/db');

async function setupDatabase() {
  console.log('[Setup] Initializing database setup...');
  
  const isMySQL = db.type === 'mysql';
  const autoIncrement = isMySQL ? 'AUTO_INCREMENT' : 'AUTOINCREMENT';
  const primaryKey = isMySQL ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const textType = isMySQL ? 'TEXT' : 'TEXT';
  const timestampDefault = 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  const tables = [
    // 1. Users Table
    `CREATE TABLE IF NOT EXISTS users (
      id ${primaryKey},
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'customer',
      phone VARCHAR(20),
      created_at ${timestampDefault}
    )`,

    // 2. Artisans Table
    `CREATE TABLE IF NOT EXISTS artisans (
      id ${primaryKey},
      user_id INT NOT NULL,
      address VARCHAR(255),
      craft_type VARCHAR(100),
      experience INT,
      profile_image ${textType},
      description ${textType},
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 3. Products Table
    `CREATE TABLE IF NOT EXISTS products (
      id ${primaryKey},
      artisan_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      description ${textType},
      price DECIMAL(10, 2) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      image ${textType},
      category VARCHAR(100),
      created_at ${timestampDefault},
      FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
    )`,

    // 4. Orders Table
    `CREATE TABLE IF NOT EXISTS orders (
      id ${primaryKey},
      customer_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      created_at ${timestampDefault},
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 5. Order Items Table
    `CREATE TABLE IF NOT EXISTS order_items (
      id ${primaryKey},
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,

    // 6. Reviews Table
    `CREATE TABLE IF NOT EXISTS reviews (
      id ${primaryKey},
      product_id INT NOT NULL,
      customer_id INT NOT NULL,
      rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review ${textType},
      created_at ${timestampDefault},
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  try {
    for (const sql of tables) {
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      console.log(`[Setup] Creating table: ${tableName}`);
      await db.query(sql);
    }
    console.log('[Setup] Database tables configured successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Setup] Error setting up database:', err.message);
    process.exit(1);
  }
}

setupDatabase();
