const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('[Seed] Beginning database seeding...');

  try {
    // 1. Clear old data (in reverse order of dependencies)
    console.log('[Seed] Clearing existing data...');
    await db.query('DELETE FROM reviews');
    await db.query('DELETE FROM order_items');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM products');
    await db.query('DELETE FROM artisans');
    await db.query('DELETE FROM users');

    // 2. Encrypt passwords
    const salt = bcrypt.genSaltSync(10);
    const customerPassword = bcrypt.hashSync('customer123', salt);
    const artisanPassword = bcrypt.hashSync('artisan123', salt);
    const adminPassword = bcrypt.hashSync('admin123', salt);

    // 3. Create Users
    console.log('[Seed] Creating users...');
    
    // Customer
    const [custResult] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Ravi Kumar', 'ravi@gmail.com', customerPassword, 'customer', '9876543210']
    );
    const customerId = custResult.insertId;

    // Artisans
    const [artisanUser1] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Srinivas Rao', 'srinivas@pochampally.com', artisanPassword, 'artisan', '9000123456']
    );
    const artisanUserId1 = artisanUser1.insertId;

    const [artisanUser2] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Kamlesh Devi', 'kamlesh@banaras.com', artisanPassword, 'artisan', '9111223344']
    );
    const artisanUserId2 = artisanUser2.insertId;

    const [artisanUser3] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Muthuraman K.', 'muthu@kanchipuram.com', artisanPassword, 'artisan', '9888776655']
    );
    const artisanUserId3 = artisanUser3.insertId;

    const [artisanUser4] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Devaki Bandha', 'devaki@sambalpur.com', artisanPassword, 'artisan', '9222334455']
    );
    const artisanUserId4 = artisanUser4.insertId;

    const [artisanUser5] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Ramesh Prasad', 'ramesh@bhagalpur.com', artisanPassword, 'artisan', '9333445566']
    );
    const artisanUserId5 = artisanUser5.insertId;

    const [artisanUser6] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Sunita Patra', 'sunita@sambhalpur.com', artisanPassword, 'artisan', '9444556677']
    );
    const artisanUserId6 = artisanUser6.insertId;

    const [artisanUser7] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Radheshyam Yadav', 'radheshyam@bhadohi.com', artisanPassword, 'artisan', '9555667788']
    );
    const artisanUserId7 = artisanUser7.insertId;

    // Admin
    await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      ['Platform Administrator', 'admin@handloom.org', adminPassword, 'admin', '9999999999']
    );

    // 4. Create Artisan Profiles
    console.log('[Seed] Creating artisan profiles...');
    
    const [art1] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId1,
        'Pochampally Village, Yadadri Bhuvanagiri, Telangana',
        'Pochampally Ikat Weaving',
        18,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'Fourth-generation master weaver specializing in traditional double-ikat tie-and-dye silk and cotton sarees. Dedicated to preserving ancient geometric motifs.'
      ]
    );
    const artisanId1 = art1.insertId;

    const [art2] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId2,
        'Madhuraman St, Varanasi, Uttar Pradesh',
        'Banarasi Silk Brocade',
        22,
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
        'Award-winning artisan crafting opulent Banarasi silk sarees woven with real silver and gold threads (zari). Passionate about empowering rural women spinners.'
      ]
    );
    const artisanId2 = art2.insertId;

    const [art3] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId3,
        'Nethaji Road, Kanchipuram, Tamil Nadu',
        'Kanjeevaram Temple Border Silk',
        25,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'Expert in weaving pure Mulberry silk sarees with matching heavy zari borders, utilizing the unique Korvai joint technique. Committed to handloom revival.'
      ]
    );
    const artisanId3 = art3.insertId;

    const [art4] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId4,
        'Bargarh District, Sambalpur, Odisha',
        'Sambalpuri Bandha Ikat',
        15,
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        'Award-winning Sambalpuri weaver expert in Bandha tie-dying, utilizing natural organic indigo and turmeric dyes.'
      ]
    );
    const artisanId4 = art4.insertId;

    const [art5] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId5,
        'Nathnagar, Bhagalpur, Bihar',
        'Bhagalpuri Tussar Silk',
        20,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'Specialist in wild Tussar silk textures, hand-spinning cocoons and weaving organic eco-friendly shawls.'
      ]
    );
    const artisanId5 = art5.insertId;

    const [art6] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId6,
        'Sonepur, Sambalpur, Odisha',
        'Bomkai Cotton-Silk Weaving',
        16,
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        'Passionate artisan specializing in heavy Bomkai borders featuring traditional motifs like fish, tortoise, and lotus. Woven using natural dyes.'
      ]
    );
    const artisanId6 = art6.insertId;

    const [art7] = await db.query(
      `INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artisanUserId7,
        'Bhadohi District, Uttar Pradesh',
        'Hand-knotted Woolen Stoles',
        18,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'Weaving fine hand-knotted stoles and carpets for generations, using premium local sheep wool and organic herbal extracts for color extraction.'
      ]
    );
    const artisanId7 = art7.insertId;

    // 5. Create Products
    console.log('[Seed] Inserting handloom products...');
    
    // Pochampally Products (Artisan 1)
    const [p1] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId1,
        'Royal Blue Pochampally Ikat Silk Saree',
        'Handwoven pure silk Pochampally saree featuring classic geometric patterns in vibrant royal blue and crimson. Includes running blouse piece.',
        8500.00,
        5,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
        'Sarees'
      ]
    );
    
    const [p2] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId1,
        'Classic Ikat Cotton Kurta Material',
        'Breathable hand-spun cotton fabric using single-ikat weave, colored with natural organic dyes. Length: 2.5 meters.',
        1200.00,
        15,
        'https://images.unsplash.com/photo-1524282745852-a463843513c5?w=600',
        'Dress Materials'
      ]
    );

    // Banarasi Products (Artisan 2)
    const [p3] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId2,
        'Crimson Red Banarasi Zari Silk Saree',
        'Exquisite wedding collection pure Katan silk Banarasi saree adorned with intricate gold brocade (zari work) floral jaal motifs across the body.',
        24000.00,
        2,
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600',
        'Sarees'
      ]
    );

    const [p4] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId2,
        'Emerald Green Banarasi Silk Brocade Dupatta',
        'Elevate any outfit with this fine silk dupatta featuring traditional motifs and a heavy gold border woven on antique wooden handlooms.',
        4200.00,
        8,
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600',
        'Dupattas'
      ]
    );

    // Kanjeevaram Products (Artisan 3)
    const [p5] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId3,
        'Mustard Gold Kanjeevaram Silk Saree',
        'Heavy Kanchipuram silk saree with traditional temple borders, woven using 3-ply silk threads and pure zari. Perfect for festive celebrations.',
        18500.00,
        3,
        'https://images.unsplash.com/photo-1583391265517-35bbdba01229?w=600',
        'Sarees'
      ]
    );

    const [p6] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId3,
        'Indigo Temple-Motif Handloom Stole',
        'Warm and elegant cotton-silk blend stole featuring borders inspired by Tamil Nadu temple architecture. Length: 2 meters.',
        1800.00,
        12,
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
        'Dupattas'
      ]
    );

    const [p7] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId4,
        'Traditional Red Sambalpuri Cotton Saree',
        'Pure cotton Sambalpuri saree with signature shell and wheel bandha motifs along the borders. Light and comfortable.',
        3800.00,
        6,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
        'Sarees'
      ]
    );

    const [p8] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId5,
        'Tussar Silk Cream-Gold Shawl',
        'Elegant hand-spun wild silk shawl with a natural cream-gold texture and delicate hand-drawn temple borders.',
        2800.00,
        10,
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
        'Dupattas'
      ]
    );

    const [p9] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId6,
        'Indigo Blue Bomkai Silk-Cotton Saree',
        'Saree blending rich indigo silk body with classic Bomkai cotton borders featuring hand-woven fish patterns.',
        6200.00,
        4,
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
        'Sarees'
      ]
    );

    const [p10] = await db.query(
      `INSERT INTO products (artisan_id, name, description, price, stock, image, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        artisanId7,
        'Cream-Charcoal Knotted Woolen Stole',
        'Soft, warm pure woolen stole showcasing traditional geometric hand-knotted designs.',
        2200.00,
        8,
        'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600',
        'Dupattas'
      ]
    );

    // 6. Create Reviews
    console.log('[Seed] Adding reviews...');
    
    await db.query(
      'INSERT INTO reviews (product_id, customer_id, rating, review) VALUES (?, ?, ?, ?)',
      [
        p1.insertId,
        customerId,
        5,
        'Breathtakingly beautiful saree! The double ikat design is perfect, and you can feel the quality of pure hand-woven silk. The packaging had a note signed by Srinivas Rao, which was a lovely personal touch.'
      ]
    );

    await db.query(
      'INSERT INTO reviews (product_id, customer_id, rating, review) VALUES (?, ?, ?, ?)',
      [
        p3.insertId,
        customerId,
        5,
        'Absolute masterpiece. The zari work is incredibly dense and heavy, and the crimson red color is stunning. Direct artisan buying saved me at least 50% compared to high-end boutiques!'
      ]
    );

    await db.query(
      'INSERT INTO reviews (product_id, customer_id, rating, review) VALUES (?, ?, ?, ?)',
      [
        p5.insertId,
        customerId,
        4,
        'The mustard color is rich, and the temple border looks very traditional. Delivery took slightly longer than expected, but the quality of handloom is well worth the wait.'
      ]
    );

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Seeding failed with error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
