<div align="center">

  <h1>🎯 TrackInfluencer</h1>
  <p><strong>Influencer Affiliate Sales & Payment Tracking Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/Recharts-22b5bf?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
  </p>


  <p>
    <a href="#-demo">View Demo</a> ·
    <a href="#-features">Features</a> ·
    <a href="#-tech-stack">Tech Stack</a> ·
    <a href="#-getting-started">Getting Started</a> ·
    <a href="#-api-reference">API Reference</a>
  </p>

</div>

---

## 📋 Table of Contents

- [Demo](#-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [AI Features](#-ai-features)
- [Affiliate Tracking](#-affiliate-tracking)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎥 Demo

| Role | Credentials | Access |
|------|-------------|--------|
| Admin | `admin@example.com` / `password` | Full platform access |
| Influencer | `influencer@example.com` / `password` | Own dashboard & stats |
| Finance | `finance@example.com` / `password` | Payments & CSV exports |

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based access control** — Admin, Influencer, Finance roles
- Secure JWT-based authentication with password hashing (bcrypt)
- Protected routes and role-specific dashboards

### 📊 Dashboard & Analytics
- **Admin Dashboard** — Platform overview, fraud alerts, revenue analytics
- **Influencer Dashboard** — Personal performance, clicks, sales, commissions
- **Finance Dashboard** — Payment approvals, CSV exports, payout batches
- Interactive charts: Line, Bar, Pie (powered by Recharts)

### 🔗 Affiliate Tracking
- Unique referral codes auto-generated for each influencer
- Click tracking with IP and user-agent logging
- Conversion tracking from click → sale

### 🤖 AI-Powered Insights
- **Sales Prediction** — Polynomial regression with weekly seasonality
- **Influencer Insights** — GPT-3.5 powered performance analysis
- **Fraud Detection** — Automated flagging of suspicious click patterns

### 💰 Payment Workflow
- Multi-stage payment lifecycle: `Pending → Approved → Paid`
- Bulk payment generation for influencers
- CSV & Excel export for accounting
- Razorpay integration ready

### 🔔 Real-Time Updates
- Live notifications via Socket.io
- Real-time dashboard refresh on new sales/payments

---

## 🏗️ Architecture

```
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────────┐
│                     │      │                      │      │                  │
│   React Frontend    │◄────►│   Node.js Backend    │◄────►│    MongoDB       │
│   (Vite + Recharts) │      │   (Express + JWT)    │      │   (Mongoose)     │
│                     │      │                      │      │                  │
└─────────────────────┘      └──────────┬───────────┘      └──────────────────┘
                                        │
                                        │ HTTP / REST
                                        ▼
                               ┌───────────────────────┐
                               │   Python AI Service   │
                               │  (FastAPI + OpenAI)   │
                               │                       │
                               │  • Sales Prediction   │
                               │  • Influencer Insights│
                               │  • Fraud Detection    │
                               └───────────────────────┘
```

### Communication Flow
1. **Frontend** communicates with **Backend** via REST API + Socket.io (real-time)
2. **Backend** persists data in **MongoDB** via Mongoose ODM
3. **Backend** calls **AI Service** for predictions and insights
4. **AI Service** uses OpenAI GPT-3.5 + Scikit-learn for ML models

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://react.dev/) | ^19.2.5 | UI Library |
| [Vite](https://vitejs.dev/) | ^8.0.10 | Build Tool & Dev Server |
| [React Router DOM](https://reactrouter.com/) | ^7.14.2 | Client-side Routing |
| [Recharts](https://recharts.org/) | ^3.8.1 | Data Visualization |
| [Socket.io-client](https://socket.io/) | ^4.8.3 | Real-time Communication |
| [Axios](https://axios-http.com/) | ^1.15.2 | HTTP Client |
| [Lucide React](https://lucide.dev/) | ^1.11.0 | Icon Library |
| [React Hot Toast](https://react-hot-toast.com/) | ^2.6.0 | Notifications |
| [Tailwind CSS](https://tailwindcss.com/) | *via Vite* | Utility-first CSS |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | Runtime Environment |
| [Express.js](https://expressjs.com/) | ^5.2.1 | Web Framework |
| [MongoDB](https://www.mongodb.com/) | 6+ | NoSQL Database |
| [Mongoose](https://mongoosejs.com/) | ^9.5.0 | MongoDB ODM |
| [JWT](https://jwt.io/) | ^9.0.3 | Authentication |
| [Socket.io](https://socket.io/) | ^4.8.3 | Real-time Engine |
| [Bcryptjs](https://www.npmjs.com/package/bcryptjs) | ^3.0.3 | Password Hashing |
| [Razorpay](https://razorpay.com/) | ^2.9.6 | Payment Gateway |
| [CSV Writer](https://www.npmjs.com/package/csv-writer) | ^1.6.0 | CSV Export |
| [ExcelJS](https://github.com/exceljs/exceljs) | ^4.4.0 | Excel Export |
| [CORS](https://www.npmjs.com/package/cors) | ^2.8.6 | Cross-Origin Resource Sharing |
| [Dotenv](https://www.npmjs.com/package/dotenv) | ^17.4.2 | Environment Variables |
| [Nodemon](https://nodemon.io/) | ^3.1.14 | Dev Auto-restart |

### AI Service
| Technology | Version | Purpose |
|------------|---------|---------|
| [Python](https://www.python.org/) | 3.10+ | Programming Language |
| [FastAPI](https://fastapi.tiangolo.com/) | *latest* | High-performance API Framework |
| [Uvicorn](https://www.uvicorn.org/) | *latest* | ASGI Server |
| [Pandas](https://pandas.pydata.org/) | *latest* | Data Manipulation |
| [NumPy](https://numpy.org/) | *latest* | Numerical Computing |
| [Scikit-learn](https://scikit-learn.org/) | *latest* | Machine Learning |
| [OpenAI](https://openai.com/) | *latest* | GPT-3.5 Turbo API |
| [python-dotenv](https://pypi.org/project/python-dotenv/) | *latest* | Environment Variables |

---

## 📁 Project Structure

```
trackinfluencer/
├── 📁 frontend/                 # React SPA (Vite)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios instance & interceptors
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   └── StatCard.jsx     # Dashboard stat cards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Global auth state
│   │   │   └── SocketContext.jsx # Real-time socket state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FinanceDashboard.jsx
│   │   │   ├── InfluencerDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── 📁 backend/                  # Node.js REST API
│   ├── src/
│   │   ├── db/
│   │   │   └── index.js         # MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification middleware
│   │   ├── models/
│   │   │   ├── Brand.js
│   │   │   ├── Click.js
│   │   │   ├── Influencer.js
│   │   │   ├── Payment.js
│   │   │   ├── Sale.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── analytics.js     # AI & fraud endpoints
│   │   │   ├── auth.js          # Register / Login
│   │   │   ├── brands.js
│   │   │   ├── influencers.js   # Affiliate tracking
│   │   │   ├── payments.js      # Payment workflow
│   │   │   └── sales.js         # Sales & commissions
│   │   └── index.js             # App entry point
│   ├── seed.js                  # Database seeder
│   └── package.json
│
├── 📁 ai-service/               # Python AI Microservice
│   ├── main.py                  # FastAPI app & endpoints
│   └── requirements.txt         # Python dependencies
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

| Dependency | Version | Download |
|------------|---------|----------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| MongoDB | 6+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Python | 3.10+ | [python.org](https://www.python.org/downloads/) |
| npm | 9+ | Included with Node.js |
| pip | Latest | Included with Python |

> 💡 **Tip:** Use [MongoDB Atlas](https://www.mongodb.com/atlas) for a free cloud database instead of local MongoDB.

---

### Environment Variables

#### Backend `.env`
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trackinfluencer
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/trackinfluencer

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# AI Service URL
AI_SERVICE_URL=http://localhost:8000

# Razorpay (optional, for payments)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### AI Service `.env`
```bash
OPENAI_API_KEY=sk-your-openai-api-key
BACKEND_URL=http://localhost:5000
```

#### Frontend `.env`
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/trackinfluencer.git
cd trackinfluencer
```

#### 2️⃣ Start MongoDB

```bash
# macOS/Linux (local MongoDB)
sudo mongod --dbpath /var/lib/mongodb

# Windows (local MongoDB)
net start MongoDB

# OR use MongoDB Atlas (cloud) — no local setup needed
```

#### 3️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Seed database with sample data (optional)
node seed.js

# Start development server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

#### 4️⃣ Setup AI Service

```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your OPENAI_API_KEY

# Start AI service
uvicorn main:app --reload --port 8000
```

**AI Service runs on:** `http://localhost:8000`

#### 5️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

### 🐳 Docker Setup (Optional)

---

## 📚 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user (Admin, Influencer, Finance) |
| `POST` | `/api/auth/login` | — | Login and receive JWT token |
| `GET` | `/api/auth/me` | ✅ | Get current user profile |

### Influencers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/influencers` | Admin | List all influencers with stats |
| `GET` | `/api/influencers/me` | Influencer | Get own influencer profile |
| `GET` | `/api/influencers/track/:code` | — | Track affiliate click & redirect |
| `GET` | `/api/influencers/:id/sales` | Influencer | Get sales for an influencer |

### Sales
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/sales` | Admin | Record a new sale |
| `GET` | `/api/sales` | All | List all sales (role-filtered) |
| `GET` | `/api/sales/over-time` | All | Aggregated sales data for charts |
| `GET` | `/api/sales/by-influencer` | Admin | Sales grouped by influencer |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/payments` | All | List payments (role-filtered) |
| `POST` | `/api/payments/generate` | Admin | Generate payout batch for period |
| `PATCH` | `/api/payments/:id/status` | Admin/Finance | Update payment status |
| `GET` | `/api/payments/export/csv` | Admin/Finance | Export payments as CSV |
| `GET` | `/api/payments/export/excel` | Admin/Finance | Export payments as Excel |

### Analytics & AI
| Method | Endpoint                       | Auth          | Description                      |
|--------|--------------------------------|---------------|----------------------------------|
| `GET`  | `/api/analytics/overview`      | Admin/Finance | Dashboard KPIs & stats           |
| `GET`  | `/api/analytics/fraud`         | Admin         | Fraud alerts & flagged IPs       |
| `GET`  | `/api/analytics/predict?days=7`| Admin/Finance | AI sales forecast                |
| `GET`  | `/api/analytics/ai-insights`   | Admin/Finance | AI-generated influencer insights |

### Brands
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/brands` | All | List all brands |
| `POST` | `/api/brands` | Admin | Create a new brand |
| `PUT` | `/api/brands/:id` | Admin | Update brand details |

---

## 🗄️ Database Schema

### Collections Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  users                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id          | ObjectId  | Primary key                                     │
│  email        | String    | Unique, required                                │
│  password     | String    | Hashed with bcrypt                              │
│  role         | String    | Enum: ['admin', 'influencer', 'finance']        │
│  name         | String    | Full name                                       │
│  createdAt    | Date      | Auto-generated                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  influencers                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id             | ObjectId  | Primary key                                  │
│  user_id         | ObjectId  | Ref → User                                   │
│  referral_code   | String    | Unique affiliate code                        │
│  commission_rate | Number    | Percentage (default: 10%)                    │
│  total_clicks    | Number    | Total affiliate clicks                       │
│  total_sales     | Number    | Total sales generated                        │
│  total_earnings  | Number    | Lifetime commission earnings                 │
│  bio             | String    | Influencer bio/description                   │
│  social_links    | Object    | { instagram, youtube, tiktok, twitter }      │
│  createdAt       | Date      | Auto-generated                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  sales                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id               | ObjectId  | Primary key                                │
│  influencer_id     | ObjectId  | Ref → Influencer                           │
│  amount            | Number    | Sale amount (₹)                            │
│  product_name      | String    | Product sold                               │
│  customer_email    | String    | Buyer email                                │
│  commission_amount | Number    | Auto-calculated from commission_rate       │
│  status            | String    | Enum: ['confirmed', 'refunded', 'pending'] │
│  date              | Date      | Date of sale                               │
│  createdAt         | Date      | Auto-generated                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  payments                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id           | ObjectId  | Primary key                                    │
│  influencer_id | ObjectId  | Ref → Influencer                               │
│  amount        | Number    | Total payout amount                            │
│  status        | String    | Enum: ['pending', 'approved', 'paid']          │
│  period_start  | Date      | Payout period start                            │
│  period_end    | Date      | Payout period end                              │
│  paid_at       | Date      | Date marked as paid                            │
│  transaction_id| String    | External payment gateway ID                    │
│  createdAt     | Date      | Auto-generated                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  clicks                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id            | ObjectId  | Primary key                                   │
│  influencer_id  | ObjectId  | Ref → Influencer                              │
│  ip_address     | String    | Visitor IP (for fraud detection)              │
│  user_agent     | String    | Browser/client identifier                     │
│  clicked_at     | Date      | Timestamp of click                            │
│  converted      | Boolean   | Did click result in a sale?                   │
│  referrer       | String    | Traffic source URL                            │
│  country        | String    | Geo-located country (optional)                │
│  createdAt      | Date      | Auto-generated                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  brands                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  _id          | ObjectId  | Primary key                                     │
│  name         | String    | Brand name                                      │
│  logo         | String    | Logo URL                                        │
│  website      | String    | Brand website                                   │
│  description  | String    | Brand description                               │
│  createdAt    | Date      | Auto-generated                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Features

### Sales Prediction (`GET /api/analytics/predict?days=7`)
- **Algorithm:** Polynomial regression (degree 2) on 90-day sales history
- **Seasonality:** Weekly pattern adjustments
  - Weekends: +15% uplift
  - Mondays: -5% dip
- **Fallback:** Moving average if insufficient historical data
- **Output:** Daily predicted sales amounts with confidence intervals

### Influencer Insights (`GET /api/analytics/ai-insights`)
- **Engine:** OpenAI GPT-3.5-turbo
- **Input:** Aggregated performance metrics (clicks, conversions, top products, trends)
- **Output:** Natural language insights including:
  - Conversion rate issues
  - Best performing days/time slots
  - Revenue concentration warnings
  - Growth recommendations
- **Fallback:** Rule-based engine activates if OpenAI API is unavailable

### Fraud Detection (`GET /api/analytics/fraud`)
- **Rule 1:** Blocks IPs with >10 clicks/hour per influencer (auto-reject)
- **Rule 2:** Flags IPs with >5 clicks in 24h per influencer (admin review)
- **Detection:** Click velocity analysis + IP reputation scoring
- **Actions:** Automated flagging, admin dashboard alerts, CSV export of violations

---

## 🔗 Affiliate Tracking

### Link Format
```
https://your-domain.com/api/influencers/track/{REFERRAL_CODE}?redirect={TARGET_URL}
```

### Example
```
https://trackinfluencer.com/api/influencers/track/SARAH2024?redirect=https://shop.com/summer-sale
```

### Tracking Flow
```
User clicks affiliate link
        ↓
Backend logs click (IP, user-agent, timestamp)
        ↓
Fraud detection rules applied
        ↓
User redirected to product page
        ↓
Upon purchase → sale recorded with influencer attribution
        ↓
Commission auto-calculated and added to influencer balance
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, semicolons, etc)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Build process or auxiliary tool changes

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

```
MIT License

Copyright (c) 2025 TrackInfluencer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

---

## 🙏 Acknowledgements

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Shields.io](https://shields.io/) for badges

---

<div align="center">

  <p><strong>⭐ Star this repo if you find it helpful!</strong></p>
  
</div>
