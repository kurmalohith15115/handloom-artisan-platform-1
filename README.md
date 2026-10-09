# Handloom Artisan Support Platform

The **Handloom Artisan Support Platform** is a full-stack e-commerce marketplace that empowers local handloom weavers and artisans by enabling them to sell authentic, handmade textiles directly to patrons without intermediaries. 

The project features a **React.js** frontend styled with custom traditional heritage CSS, a **Node.js/Express.js** backend, and a database layer supporting **MySQL** (with automated **SQLite** local fallback for instant testing). It includes multi-language support (English, Telugu, Hindi) and simulated **Razorpay** checkout integration.

---

## Folder Structure

```
handloom-artisan-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # Unified DB connector (MySQL & SQLite fallback)
│   │   │   └── razorpay.js    # Razorpay SDK initialization & Mock state
│   │   ├── controllers/       # Route controllers (Auth, Products, Orders, Reviews)
│   │   ├── middleware/        # JWT Authentication & role verification
│   │   ├── routes/            # Router configurations
│   │   ├── database.sqlite    # Auto-generated SQLite local DB
│   │   ├── db_setup.js        # Programmatic database setup
│   │   ├── db_setup.sql       # Raw MySQL DDL schema dump
│   │   ├── seed.js            # Seeding script with mock weavers and products
│   │   └── server.js          # Express app server entry point
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/        # Shared elements (Navbar, Footer, Product/Artisan cards)
    │   ├── context/           # React state contexts (AuthContext, CartContext)
    │   ├── pages/             # Layout pages (Home, Products, Details, Dashboards)
    │   ├── translations/      # Multi-language localization (EN, TE, HI)
    │   ├── App.css            # Boilerplate reset
    │   ├── App.jsx            # Routing and provider wrappers
    │   ├── index.css          # Heritage theme CSS design system
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Local Setup Instructions

This repository is pre-configured to run with a local **SQLite** file by default, meaning **no database configuration is required** for testing. If you wish to use **MySQL**, see the MySQL section below.

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Step 1: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment config and check settings (default uses SQLite and simulated payments):
   ```bash
   cp .env.example .env
   ```
4. Run the database configuration and populate initial seed data:
   ```bash
   npm run db:setup
   npm run db:seed
   ```
5. Start the backend API server:
   ```bash
   npm run dev
   ```
   The server will start on **`http://localhost:5001`**.

### Step 2: Frontend Setup
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will start on **`http://localhost:5173`** (or next available port). Open your browser and navigate to it to view the platform.

---

## MySQL Setup (Optional Toggle)

If you prefer to run the system on a live MySQL instance rather than SQLite:

1. Open your MySQL client and create a new database:
   ```sql
   CREATE DATABASE handloom_db;
   ```
2. Open the backend `.env` file and modify the database driver configuration:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=handloom_db
   ```
3. Run the migrations and seeding command in the backend folder:
   ```bash
   npm run db:setup
   npm run db:seed
   ```
   *The DDL code is also located in `backend/src/db_setup.sql` for manual importing.*

---

## REST API Documentation

### 1. Authentication
* **`POST /api/auth/register`**
  * **Role**: Customer or Artisan
  * **Body Parameters**:
    ```json
    {
      "name": "Full Name",
      "email": "email@example.com",
      "password": "secure_password",
      "role": "customer", // or "artisan"
      "phone": "9876543210",
      // (Artisan Specific Fields below)
      "address": "Weaving Village, State",
      "craft_type": "Kanjeevaram Brocade",
      "experience": 20,
      "description": "Artisan history..."
    }
    ```
* **`POST /api/auth/login`**
  * **Body Parameters**: `{"email": "...", "password": "..."}`
  * **Returns**: JSON object with JWT token and logged-in user profile attributes.
* **`GET /api/auth/profile`**
  * **Headers**: `Authorization: Bearer <token>`
  * **Returns**: Current authenticated user details and associated artisan metadata (if artisan).

### 2. Product Catalog
* **`GET /api/products`**
  * **Query Parameters** (Optional): `category`, `search`, `minPrice`, `maxPrice`
  * **Returns**: Array of product objects joining weaver details.
* **`GET /api/products/:id`**
  * **Returns**: Product detail object, joined artisan biography, and customer reviews array.
* **`POST /api/products`** (Artisan Only)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body Parameters**: `{"name": "...", "description": "...", "price": 4500, "stock": 5, "image": "URL", "category": "Sarees"}`
* **`PUT /api/products/:id`** (Artisan Owner Only)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body**: Product fields to update.
* **`DELETE /api/products/:id`** (Artisan Owner or Admin)
  * **Headers**: `Authorization: Bearer <token>`

### 3. Orders & Razorpay Checkout
* **`POST /api/orders`** (Customer Only)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body Parameters**:
    ```json
    {
      "items": [
        { "id": 1, "quantity": 1, "price": 8500.00 }
      ],
      "total_amount": 8500.00
    }
    ```
  * **Returns**: Local order ID and simulated/real Razorpay order attributes.
* **`POST /api/orders/verify`** (Customer Only)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body**: `{"orderId": 12, "razorpayPaymentId": "pay_id", "status": "success"}`
  * **Action**: Verifies signature (real mode) or accepts parameters (mock sandbox), confirms order, and decrements product inventory.
* **`GET /api/orders`** (Authenticated Users)
  * **Headers**: `Authorization: Bearer <token>`
  * **Returns**: List of orders. Role-tailored (Customers see own orders, Artisans see orders containing their products, Admins see all).
* **`PUT /api/orders/:id`** (Artisan / Admin)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body**: `{"status": "Shipped"}` (Statuses: `Pending`, `Confirmed`, `Shipped`, `Delivered`)

### 4. Reviews & Ratings
* **`POST /api/reviews`** (Customer Only)
  * **Headers**: `Authorization: Bearer <token>`
  * **Body**: `{"product_id": 1, "rating": 5, "review": "Amazing handloom fabric!"}`
* **`DELETE /api/reviews/:id`** (Reviewer or Admin)
  * **Headers**: `Authorization: Bearer <token>`

---

## Razorpay Mock Simulator

When `RAZORPAY_KEY_ID` is not configured, the platform activates **Mock Payment Mode**:
1. When a customer checks out, the backend generates simulated order tokens.
2. In the frontend, instead of invoking the Razorpay external SDK overlay, the app loads a custom **Razorpay Sandbox simulation modal**.
3. Clicking **Simulate Success** sends a validation signal back to the server, confirming the order, recording payment status as Paid, and adjusting stock.
4. Clicking **Simulate Failure** registers the checkout as failed, letting you test error paths.

---

## Deployment Guide

### Deploying the Backend to Render or Railway

#### Render Setup
1. **Database Options**:
   * Create a PostgreSQL database on Render (as MySQL is not natively hosted on free tiers) or connect to an external free MySQL service (like Aiven or PlanetScale).
   * Modify the connection in `db.js` if necessary, or simply deploy using the **SQLite fallback**. If deploying on Render's free tier with SQLite, note that SQLite files are ephemeral unless mounted on a Render Persistent Disk.
2. **Web Service Creation**:
   * Create a new **Web Service** on Render linked to your GitHub repo.
   * Root Directory: `backend`
   * Build Command: `npm install`
   * Start Command: `npm start`
3. **Environment Variables**:
   * Add: `PORT=10000`, `JWT_SECRET=your_jwt_secret`, `DB_TYPE=sqlite`, `MOCK_PAYMENT=true`.

#### Railway Setup (Full MySQL Support)
1. **Services Creation**:
   * Create a new project on Railway.
   * Provision a **MySQL Database** service.
2. **Server Deployment**:
   * Add a new service linked to your repository and target the `backend` subdirectory.
   * Railway automatically reads `package.json` and runs `npm install` and `npm start`.
3. **Variables Linkage**:
   * Link the backend service to the MySQL service variables:
     * `DB_TYPE=mysql`
     * `DB_HOST=${{MySQL.MYSQLHOST}}`
     * `DB_USER=${{MySQL.MYSQLUSER}}`
     * `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
     * `DB_NAME=${{MySQL.MYSQLDATABASE}}`
4. **Setup Database**:
   * Add a deploy start script or run a startup migration task in Railway: `npm run db:setup && npm run db:seed` to instantiate the database before start.

---

### Deploying the Frontend to Vercel

1. **Vercel Settings**:
   * Create a new project on Vercel linked to your repository.
   * Framework Preset: **Vite**.
   * Root Directory: **`frontend`**.
   * Build Command: `npm run build`
   * Output Directory: `dist`
2. **API Endpoint Linkage**:
   * Open `frontend/src/context/AuthContext.jsx` and change `API_URL` to point to your deployed backend domain (e.g., `https://your-backend.onrender.com/api`).
   * Deploy! Vercel will build the React bundles and distribute them on global edge networks.
