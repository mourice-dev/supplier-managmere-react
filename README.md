# ProCureSys+ — Supplier Management System

A modern procurement management web application built with **React** (Vite) and **Express.js**.

## Tech Stack

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React 18, Vite, Bootstrap 5 |
| Backend  | Node.js, Express.js      |
| Database | MySQL                    |

## Project Structure

```
SupplierManagementSystem/
├── backend/          # Express.js REST API
│   ├── server.js     # All API routes
│   ├── db.js         # MySQL connection pool
│   ├── .env          # DB credentials (not committed)
│   └── package.json
├── frontend/         # React SPA (Vite)
│   ├── src/
│   │   ├── pages/    # Dashboard, Login, Suppliers, Requests, Orders, Payments
│   │   ├── Layout.jsx
│   │   ├── App.jsx
│   │   └── index.css # ProCureSys+ Design System
│   └── package.json
└── database.sql      # MySQL schema & seed data
```

## Getting Started

### 1. Database Setup
Import `database.sql` into your MySQL server:
```bash
mysql -u root -p < database.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # set your DB credentials
npm install
npm run dev            # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

## Demo Credentials

| Role  | Username | Password |
|-------|----------|----------|
| Admin | admin    | admin123 |
| User  | user     | user123  |

## Features

- 🔐 Role-based access (Admin / User)
- 📋 Procurement request submission & approval workflow
- 🏢 Supplier management (CRUD)
- 📦 Purchase order auto-generation on approval
- 💳 Payment tracking with status management
- 🔔 Real-time notification system
- 📊 Dashboard with live statistics
