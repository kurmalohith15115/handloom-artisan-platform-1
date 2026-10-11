require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Models (loaded so mongoose handles registration)
require('./models/user');
require('./models/artisanProfile');
require('./models/product');
require('./models/order');
require('./models/review');

// Initialize app
const app = express();

// Connect database and safely bootstrap/reset the admin account when explicitly configured.
async function initializeApplication() {
  await connectDB();

  const User = require('./models/user');
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const resetPassword = process.env.ADMIN_RESET_PASSWORD;

  // Only create an admin when both base credentials are provided.
  if (adminEmail && adminPassword) {
    try {
      let admin = await User.findOne({ email: adminEmail });

      if (!admin) {
        admin = new User({
          username: (process.env.ADMIN_USERNAME || 'admin').trim(),
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          status: 'approved'
        });
        await admin.save();
        console.log('Admin bootstrap: created configured admin account.');
      } else if (resetPassword) {
        // Explicit reset path for an existing account. Remove ADMIN_RESET_PASSWORD
        // from Render after a successful login so it is not reapplied on every restart.
        admin.password = resetPassword;
        admin.role = 'admin';
        admin.status = 'approved';
        await admin.save();
        console.log('Admin bootstrap: reset configured admin account password.');
      } else {
        console.log('Admin bootstrap: configured email already exists; no password changed.');
      }
    } catch (error) {
      console.error('Admin bootstrap failed:', error.message);
    }
  } else if (adminEmail || adminPassword) {
    console.warn('Admin bootstrap skipped: set both ADMIN_EMAIL and ADMIN_PASSWORD.');
  }
}

// Express Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create public upload directory if it does not exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve Static Files
app.use(express.static(path.join(__dirname, '../public')));

// Define Route Paths
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Fallback for HTML routing (cleaner URLs)
app.get('*', (req, res, next) => {
  // If request wants API, return 404 json
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found.' });
  }
  // Otherwise, let static serve or return index.html
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Port configuration
const PORT = process.env.PORT || 5001;

initializeApplication().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
