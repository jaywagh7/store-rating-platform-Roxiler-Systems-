# Roxiler FullStack – Store Rating Platform

A multi-role **Store Rating Platform** built using **React.js** for frontend and **Express.js + PostgreSQL** for backend.  
This project allows users to submit ratings for registered stores and provides role-based access for **System Administrators, Normal Users, and Store Owners**.

---

## Table of Contents
- [Features](#features)  
- [User Roles](#user-roles)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Setup Instructions](#setup-instructions)  
- [Form Validations](#form-validations)  
- [License](#license)

---

## Features
- **System Administrator**
  - Add new stores and users (normal/admin)
  - Dashboard with total users, stores, and ratings
  - View and filter users and stores
- **Normal User**
  - Sign up and log in
  - View stores and submit/modify ratings (1–5)
  - Search stores by name or address
- **Store Owner**
  - Log in and update password
  - View ratings submitted by users for their store
  - See average store rating

---

## User Roles
1. **System Administrator**
2. **Normal User**
3. **Store Owner**

---

## Tech Stack
- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Express.js, Node.js  
- **Database:** PostgreSQL  
- **Authentication:** JWT (JSON Web Tokens)

---

## Project Structure
Roxiler_FullStack/
├── backend/
│ ├── config/database.js
│ ├── database/schema.sql
│ ├── middleware/auth.js
│ ├── routes/
│ └── index.js
├── frontend/
│ ├── public/index.html
│ ├── src/components/
│ ├── src/pages/
│ └── src/App.js
├── package.json
└── README.md

yaml
Copy
Edit

---

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install
# Create a .env file with database credentials
node init-db.js  # Initialize database
node index.js    # Start backend server
2. Frontend
bash
Copy
Edit
cd frontend
npm install
npm start        # Start React development server
Note: Ensure PostgreSQL is running and .env variables are correctly set.

Form Validations
Name: 20–60 characters

Address: Max 400 characters

Password: 8–16 characters, at least one uppercase letter and one special character

Email: Standard email format

License
This project is for Roxiler Systems FullStack Coding Challenge and not intended for public commercial use.