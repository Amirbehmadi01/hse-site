# HSE Full-Stack Application

A full-stack web application for managing Non-Conformances with Admin and User roles.

## Features

### Authentication
- Username/password login (case-insensitive)
- Role-based access control (Admin/User)
- Plain text password storage (as per requirements)

### Admin Features
- Create and manage users
- Register non-conformances by department
- View monthly non-conformances with supervisor score
- Approve/reject user responses
- View responses with notification badges
- Access to all sections and checklists

### User Features
- View department-specific non-conformances
- Upload after-repair images
- Submit responses for review
- View approval/rejection notifications
- See alerts for new non-conformances

## Tech Stack

- **Frontend**: React 19, Vite, React Router
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Creating Default Admin User

To create an admin user, you can use the User Management page after logging in, or use MongoDB directly:

```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  username: "admin",
  password: "admin123",
  role: "Admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the API:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "role": "Admin"
  }'
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Non-Conformances
- `GET /api/nonconformities` - Get non-conformances (filtered by role/department)
- `POST /api/nonconformities` - Create non-conformance (Admin only)
- `PUT /api/nonconformities/:id` - Update non-conformance
- `DELETE /api/nonconformities/:id` - Delete non-conformance (Admin only)
- `POST /api/nonconformities/:id/approve` - Approve response (Admin only)
- `POST /api/nonconformities/:id/reject` - Reject response (Admin only)
- `GET /api/nonconformities/responses` - Get responses awaiting review (Admin only)
- `GET /api/nonconformities/notifications` - Get user notifications

## Departments

- Production 1
- Plastic Injection
- Maintenance
- Warehouse

## S Values

- S1
- S2
- S3
- S4
- S5
- Safety

## Status Values

- Fixed
- Not Fixed
- Incomplete
- Awaiting Review

## File Structure

```
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── nonConformityController.js
│   ├── models/
│   │   ├── User.js
│   │   └── NonConformity.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── nonConformityRoutes.js
│   ├── middlewars/
│   │   └── uploadMiddleware.js
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── UserDashboard.jsx
    │   │   ├── NonConformitiesRegister.jsx
    │   │   ├── AdminMonthlyNonConformances.jsx
    │   │   ├── AdminResponses.jsx
    │   │   ├── UserNonConformances.jsx
    │   │   └── UserManagement.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── router.jsx
    └── package.json
```

## Notes

- Images are stored in `/backend/uploads/nonconformities/`
- Passwords are stored in plain text as per requirements
- Notifications are frontend-only (no real-time system)
- Supervisor score = (Number of Fixed / Total) × 100

