# 🍽️ Smart Restaurant Management System

An end-to-end full-stack Smart Restaurant Management System built with **FastAPI**, **React (Vite)**, **Tailwind CSS**, and **MySQL/SQLite**. Features include QR table booking & dine-in ordering, live order tracking, interactive kitchen dashboard, inventory & admin management, automated reports, customer reviews, and an AI-powered restaurant assistant with voice command parsing.

---

## ✨ Features

- **📱 Customer Features**
  - **Landing Page & Branding**: Dynamic hero section, featured dishes, and quick navigation.
  - **Digital Menu**: Category-based filtering, search, dietary tags (Veg/Spicy), pricing, ratings, and instant cart additions.
  - **QR Code Table Booking & Dine-In**: Scan table QR codes to view table info and order directly to your table.
  - **Cart & Checkout**: Real-time total calculation, offer coupon validation, and multi-payment option support.
  - **Live Order Tracking**: Real-time updates on order preparation status, assigned table, items, and estimated serving time.
  - **Customer Reviews**: Rate dishes and leave verified feedback.
  - **🤖 Smart AI Assistant & Voice Parsing**: Interactive AI assistant for menu recommendations, live order status inquiries, and voice order parsing.

- **👨‍🍳 Kitchen Dashboard**
  - Real-time kitchen display unit (KDU) for chefs.
  - Live status tracking (`Received` -> `Preparing` -> `Ready`).
  - Itemized dish breakdown, special instructions, and table location.

- **📊 Admin & Inventory Dashboard**
  - **Inventory Management**: Stock level tracking, reorder thresholds, ingredient recipes, and supplier log.
  - **Analytics & Reports**: Revenue trends, popular categories, top-selling dishes, and daily order summaries.
  - **User & Table Management**: Role-based access control for Admins, Restaurant Staff, Kitchen Staff, and Customers.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, React Router, Tailwind CSS, Lucide Icons, Axios, Canvas Confetti.
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt), PyJWT, Python-Dotenv.
- **Database**: MySQL (Production) / SQLite (Development Fallback).

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ & npm
- MySQL Server (Optional, SQLite is supported out of the box)

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# (On macOS/Linux: source venv/bin/activate)

# Install dependencies
pip install -r requirements.txt

# Create .env file from .env.example
cp .env.example .env

# Run the FastAPI server
python run.py
```
The API server will run at `http://localhost:8000`. Interactive API Docs are available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Start dev server
npm run dev
```
The frontend will run at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PROJECT_NAME="Smart Restaurant Management System"
SECRET_KEY="your-secret-jwt-key-here"

MYSQL_USER=root
MYSQL_PASSWORD=your_db_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=smart_restaurant

USE_SQLITE_FALLBACK=true
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📁 Project Structure

```
smart-restaurant-management/
├── backend/
│   ├── app/
│   │   ├── routers/        # API route handlers (auth, orders, menu, kitchen, ai, etc.)
│   │   ├── models.py       # SQLAlchemy database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database engine & sessions
│   │   ├── auth.py         # JWT & password utilities
│   │   └── main.py         # FastAPI app entry point
│   ├── run.py              # Server launcher
│   └── requirements.txt
├── database/
│   ├── schema.sql          # MySQL database schema DDL
│   └── seed.sql            # Sample data seeding script
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Auth & Cart contexts
│   │   ├── pages/          # Application views (Menu, Kitchen, Admin, Orders, QR, etc.)
│   │   └── services/       # Axios API client setup
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---
