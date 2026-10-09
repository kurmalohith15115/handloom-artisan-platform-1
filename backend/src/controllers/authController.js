const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_for_handloom_platform_jwt';

const register = async (req, res) => {
  const { name, email, password, role, phone, address, craft_type, experience, description, profile_image } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into users table
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone || null]
    );
    const userId = userResult.insertId;

    // If role is artisan, insert details into artisans table
    if (role === 'artisan') {
      await db.query(
        'INSERT INTO artisans (user_id, address, craft_type, experience, profile_image, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userId,
          address || '',
          craft_type || '',
          parseInt(experience) || 0,
          profile_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          description || ''
        ]
      );
    }

    // Automatically create admin details or seed if needed, but for normal registration, it is customer/artisan
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('[Auth Register Error]:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Prepare JWT Payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // If user is an artisan, retrieve their artisan_id
    let artisanId = null;
    if (user.role === 'artisan') {
      const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [user.id]);
      if (artisans.length > 0) {
        artisanId = artisans[0].id;
        payload.artisanId = artisanId;
      }
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        artisanId
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.role === 'artisan') {
      const [artisans] = await db.query('SELECT * FROM artisans WHERE user_id = ?', [userId]);
      if (artisans.length > 0) {
        user.artisanDetails = artisans[0];
      }
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('[Auth Profile Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
