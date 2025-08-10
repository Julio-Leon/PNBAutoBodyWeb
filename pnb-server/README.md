# PNJ Auto Body - Backend Server

A comprehensive Express.js backend server for PNJ Auto Body shop website with Firebase integration, appointment management, and user authentication.

## 🚀 Features

- **RESTful API** - Clean, documented API endpoints
- **Firebase Integration** - Firestore database and Storage
- **JWT Authentication** - Secure user authentication
- **File Upload** - Image upload with Firebase Storage
- **Role-based Access** - Customer, Staff, and Admin roles
- **Rate Limiting** - API rate limiting for security
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Centralized error management
- **CORS Support** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- Firebase project with Firestore and Storage enabled
- Firebase service account key

## 🛠️ Installation

1. **Clone and navigate to the server directory:**
   ```bash
   cd pnb-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=30d
   FRONTEND_URL=http://localhost:5173
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

### Appointment Endpoints

#### Create Appointment
```http
POST /api/appointments
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token> (optional for public bookings)

{
  "customerName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "vehicleInfo": "2020 Honda Civic",
  "serviceType": "collision-repair",
  "description": "Front bumper damage",
  "preferredDate": "2024-12-20",
  "preferredTime": "10:00",
  "isUrgent": false,
  "images": [file1, file2] // Optional image files
}
```

#### Get All Appointments (Staff/Admin)
```http
GET /api/appointments?page=1&limit=10&status=pending&serviceType=collision-repair
Authorization: Bearer <jwt_token>
```

#### Get Single Appointment
```http
GET /api/appointments/:id
Authorization: Bearer <jwt_token>
```

#### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "status": "confirmed",
  "appointmentDate": "2024-12-20T10:00:00.000Z",
  "notes": "Confirmed for morning slot"
}
```

#### Update Appointment Status (Staff/Admin)
```http
PATCH /api/appointments/:id/status
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Work completed successfully"
}
```

#### Delete Appointment (Staff/Admin)
```http
DELETE /api/appointments/:id
Authorization: Bearer <jwt_token>
```

## 🔐 User Roles

- **Customer** - Can create and manage their own appointments
- **Staff** - Can view and manage all appointments
- **Admin** - Full access including user management

## 📁 Project Structure

```
pnb-server/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # File upload middleware
│   ├── models/
│   │   ├── appointmentModel.js  # Validation schemas
│   │   └── userModel.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   └── authRoutes.js
│   ├── services/
│   │   └── storageService.js    # Firebase Storage service
│   └── utils/
├── .env.example
├── .gitignore
├── package.json
└── server.js                    # Main server file
```

## 🛡️ Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents API abuse
- **Input Validation** - Validates all incoming data
- **Helmet** - Security headers
- **CORS** - Configured cross-origin requests
- **Password Hashing** - bcrypt for password security

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `NODE_ENV=production`
- `PORT=5000`
- `JWT_SECRET` (use a strong, random secret)
- Firebase configuration variables
- `FRONTEND_URL` (your frontend domain)

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (when test suite is implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@pnjautobody.com or create an issue in the repository.
