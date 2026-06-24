<div align="center">
  <img src="./user-app/assets/icon.png" alt="Red Rose Mart Logo" width="120" />

  # 🏪 Red Rose Mart

  **A modern, full-stack e-commerce grocery platform built for speed, scale, and a seamless user experience.**

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)](https://expo.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

  <br />
</div>

---

## 👨‍💻 Creators

This project was architected, designed, and developed by:
- **Muzakkir** - Lead Full-Stack Developer & Architect
- **Hafeez** - Co-Developer & UI/UX Specialist

---

## 🌟 Overview

**Red Rose Mart** is a complete, end-to-end e-commerce ecosystem consisting of three primary components:

1. **User Mobile App**: A sleek, responsive, and intuitive React Native application built with Expo for iOS and Android.
2. **Admin Dashboard**: A powerful Next.js web panel for real-time inventory, order, and user management.
3. **Backend API**: A highly optimized Express.js REST API backed by MongoDB, featuring robust Google OAuth authentication and secure role-based access controls.

---

## ✨ Key Features

### 📱 User Mobile App
- **Seamless Authentication**: One-tap Google OAuth login & secure JWT session management.
- **Dynamic Marketplace**: Browse categories, search products, and view detailed item pages.
- **Smart Cart & Wishlist**: Real-time state management for shopping carts and favorite items.
- **Location Constraints**: Advanced geocoding to restrict deliveries exclusively to serviceable areas.
- **Hardware-Accelerated UI**: Buttery smooth 60fps animations and skeleton loaders built with React Native's native Animated API.

### 🛡️ Admin Panel
- **Real-time Analytics**: High-level overview of sales, orders, and user growth.
- **Product Management**: Full CRUD capabilities for catalog items with image upload handling.
- **Order Tracking**: Seamlessly update order statuses (Pending -> Preparing -> Out for Delivery -> Delivered).
- **User Control**: Manage user roles and block/unblock capabilities.

### ⚙️ Backend API
- **Strict Security**: JWT validation, role-based route protection, and input sanitization.
- **Data Integrity**: Enforced Mongoose schemas and strict Indian mobile number validation.
- **Optimized Queries**: Advanced MongoDB aggregation pipelines for fast search and filtering.
- **Cloud Ready**: Configured for instant deployment on modern cloud platforms (Render, Vercel).

---

## 🏗️ Architecture & Tech Stack

### Frontend (Mobile)
- **Framework**: React Native (Expo)
- **State Management**: React Context API
- **Navigation**: React Navigation (Native Stack)
- **Styling**: StyleSheet (Responsive units)

### Frontend (Admin Web)
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: React Icons / Lucide

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT & Google OAuth 2.0
- **Validation**: Custom Regex & Middleware guards

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account (or local instance)
- Expo CLI

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on .env.example
npm run dev
```

### 2. User App Setup
```bash
cd user-app
npm install
# Update API endpoints to point to your local/production backend
npx expo start
```

### 3. Admin Panel Setup
```bash
cd admin-panel
npm install
npm run dev
```

---

## 🔒 Security & Deployment

- **Environment Variables**: Sensitive keys (JWT Secrets, DB URIs) are strictly kept out of version control.
- **Role-based Access**: The backend strictly enforces `admin` roles before granting access to sensitive data routes.
- **Production Optimization**: The backend features "early wakeup" pings from the frontend to mitigate cold-start delays on free cloud tiers.

---

<div align="center">
  <i>Built with passion by Muzakkir & Hafeez 🚀</i>
</div>
