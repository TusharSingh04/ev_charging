# EV Charging Project Setup Guide

## Prerequisites
- Node.js installed
- MongoDB installed
- Postman installed
- Cursor IDE

## Project Structure
```
/EV_charging
├── /backend
│   ├── /models
│   │   ├── User.js
│   │   └── ChargingStation.js
│   ├── /routes
│   │   ├── auth.js
│   │   └── chargingStations.js
│   ├── /middleware
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Startup Steps

1. **Start MongoDB**
   - Open Services (Windows + R, type "services.msc")
   - Find "MongoDB" service
   - Start the service
   - Verify MongoDB is running by opening MongoDB Compass

2. **Start Backend Server**
   ```bash
   cd backend
   npm install (if first time)
   npm run dev
   ```
   - Server should start on http://localhost:5000
   - You should see "MongoDB connected successfully" message

3. **Verify API Endpoints**
   - Import the Postman collection (EV_Charging_API.postman_collection.json)
   - Test the endpoints in sequence:
     1. Register user
     2. Login
     3. Create charging station
     4. Get all stations
     5. Update station
     6. Delete station

## API Endpoints

### Authentication
- Register: `POST http://localhost:5000/api/auth/register`
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- Login: `POST http://localhost:5000/api/auth/login`
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

### Charging Stations
- Create: `POST http://localhost:5000/api/charging-stations`
  ```json
  {
    "name": "Downtown Station",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "status": "available",
    "powerOutput": 50,
    "connectorType": "Type 2"
  }
  ```

- Get All: `GET http://localhost:5000/api/charging-stations`
- Get One: `GET http://localhost:5000/api/charging-stations/:id`
- Update: `PATCH http://localhost:5000/api/charging-stations/:id`
- Delete: `DELETE http://localhost:5000/api/charging-stations/:id`

## Troubleshooting

1. **MongoDB Connection Issues**
   - Check if MongoDB service is running
   - Verify connection string in .env file
   - Check MongoDB Compass connection

2. **Server Issues**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check console for error messages

3. **API Issues**
   - Verify JWT token is valid
   - Check request headers
   - Validate request body format

## Environment Variables
- PORT=5000
- MONGODB_URI=mongodb://127.0.0.1:27017/ev_charging
- JWT_SECRET=your-super-secret-jwt-key-change-this-in-production 