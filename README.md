# 🎬 IMovies — Full-Stack Movie Ticket Booking Website

A complete, cinematic, full-stack movie ticket-booking platform built with **React 18**, **Express**, and **MongoDB**, unified into a **single service** optimized for seamless, one-click deployment on **Vercel**.

---

## 🌟 Key Features

- **Cinematic Homepage**: Dynamic, stacked left-to-right sliding hero carousel with smooth crossfade and official high-resolution movie artwork.
- **Official Movie Releases**: *The Odyssey*, *Dhurandhar*, *Interstellar*, *Gladiator II*, *Dune: Part Two*, *Oppenheimer*, *Inception*, and *Kalki 2898 AD*.
- **Interactive Seating Map**: Real-time seat hold timers, interactive row selection, and dynamic pricing calculations.
- **Dual Checkout Experience**:
  - **PhonePe UPI QR**: Displays custom merchant QR code for **Raghav Agrawal** (`raghav.agrawal@phonepe`) with 12-digit UPI UTR transaction reference verification.
  - **Razorpay Payment Gateway**: Automated card, netbanking, and UPI checkout.
  - **Demo Sandbox Mode**: Clearly labeled testing environment for zero-risk test bookings.
- **User Accounts & Tickets**: Secure authentication (bcrypt hashing + JWT), profile management, and verified booking tickets with barcodes.
- **Admin Management Panel**: Manage movies, theatres, and schedules.

---

## 🏗️ Project Architecture (Vercel Single-Service)

This repository is unified into a single service where Vercel natively deploys both the frontend and serverless backend together:

```
IMOVIES/
├── api/                             # Serverless Express API (Vercel Node runtime)
│   ├── index.js                     # Main serverless entry point
│   ├── config/
│   │   ├── db.js                    # Serverless-cached Mongoose connection
│   │   └── razorpay.js              # Payment provider configuration
│   ├── controllers/                 # Route business logic
│   ├── middleware/                  # JWT auth, admin check, error handler
│   ├── models/                      # MongoDB/Mongoose schemas
│   ├── routes/                      # API endpoints (/api/*)
│   │   └── seedRoutes.js            # One-click Atlas database seeder
│   ├── seed/                        # Seeding data and seeder script
│   └── utils/                       # QR generators and token helpers
├── src/                             # React + Vite frontend application
│   ├── components/                  # UI components (HeroBanner, SeatingMap, etc.)
│   ├── context/                     # Auth and City contexts
│   ├── pages/                       # Home, MovieDetails, Tickets, Admin
│   └── services/api.js              # Unified relative API fetcher
├── public/                          # Static assets (posters, banners, phonepe-qr.png)
├── dist/                            # Production build output
├── vercel.json                      # Vercel routing rules & build configuration
├── vite.config.mjs                  # Vite configuration with /api dev proxy
├── server.js                        # Unified local Node server
└── package.json                     # Single root package manifest
```

---

## 🚀 Deploying to Vercel (Step-by-Step)

### Step 1: Create a Free MongoDB Atlas Database (2 minutes)
Because Vercel runs stateless serverless functions, a persistent cloud database like **MongoDB Atlas** is required:

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for free.
2. Create a free **M0 (Shared)** cluster (select any nearby region, e.g., AWS / Mumbai or Singapore).
3. Under **Security -> Database Access**, create a user (e.g., `imovies_user` and a strong password).
4. Under **Security -> Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel serverless functions can connect.
5. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/imovies?retryWrites=true&w=majority
   ```

---

### Step 2: Push to GitHub & Import into Vercel
1. Initialize a git repository and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of unified IMovies single service"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Open the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... -> Project**.
3. Select your GitHub repository.
4. Vercel automatically detects the project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**, add the following:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<pwd>@cluster...` | **Required**: Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `your_long_random_jwt_secret_key_2026` | **Required**: Secure string for auth tokens |
| `SEED_SECRET` | `seed_imovies_2026` | Secret to trigger `/api/seed` |
| `PHONEPE_MERCHANT_NAME` | `Raghav Agrawal` | Display name in checkout |
| `PHONEPE_MERCHANT_VPA` | `raghav.agrawal@phonepe` | Display UPI ID in checkout |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | *(Optional)* Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `your_secret` | *(Optional)* Razorpay Secret |

6. Click **Deploy**!

---

### Step 3: Populate Your Atlas Database (One Click)
Once deployed, your MongoDB Atlas cluster will initially be empty. Populate all 8 official movies, 11 cinemas, and 1,155 showtimes instantly:

Simply open this URL in your browser:
```
https://<your-vercel-app-name>.vercel.app/api/seed?secret=seed_imovies_2026
```
You will receive a confirmation JSON:
```json
{
  "success": true,
  "message": "IMovies database successfully seeded on MongoDB Atlas!",
  "demoAccounts": {
    "customer": "demo@imovies.com / Password123!",
    "admin": "admin@imovies.com / AdminPassword123!"
  }
}
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(If you leave `MONGODB_URI` empty locally, the app will automatically start a zero-config in-memory MongoDB fallback).*

### 3. Start Development Server
```bash
npm run dev
```
Starts both the **Express API** on port `5000` and the **Vite React Dev Server** on port `5173` with hot module reloading.

### 4. Build and Run Local Production Server
```bash
npm run build
npm start
```
Runs the unified full-stack application at `http://localhost:5000`.

---

## 🔑 Demo Credentials

- **Customer Demo**:
  - Email: `demo@imovies.com`
  - Password: `Password123!`
- **Administrator**:
  - Email: `admin@imovies.com`
  - Password: `AdminPassword123!`
