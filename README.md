# EV Charging Station Application

A full-stack application for managing EV charging stations.

## Project Structure

- `/backend` - Node.js + Express backend
- `/frontend` - Vue.js frontend

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (for local development)

## Setup Instructions

These instructions are for setting up the project locally for development.

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ev_charging # Replace with your MongoDB Atlas connection string for deployment
   JWT_SECRET=your_jwt_secret # Add a strong secret
   RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
   RATE_LIMIT_MAX=100 # 100 requests per window
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

## Deployment

- Backend: Hosted on Render
- Frontend: Hosted on Vercel
- Database: Hosted on MongoDB Atlas

For deployment to these services, refer to their specific documentation and configure environment variables accordingly (e.g., `MONGODB_URI`, `JWT_SECRET`).

## Features

- Backend API with Express
- MongoDB database integration
- Vue.js frontend with Vuex and Vue Router
- Modern UI with responsive design

## API Documentation (using Postman)

This project includes a Postman collection (`EV_Charging_API.postman_collection.json`) to help you interact with the backend API.

1.  Import the `EV_Charging_API.postman_collection.json` file into Postman.
2.  Set up an environment in Postman with a variable `apiUrl` pointing to your deployed backend API URL (e.g., `https://your-render-app.onrender.com/api`).
3.  Use the login requests in the "Authentication" folder to obtain a `user_token` or `admin_token` and set the corresponding environment variables in Postman.
4.  Use the `station_id` environment variable to store the ID of a charging station when performing operations on a specific station.

The collection is organized into folders corresponding to the different API routes.

### Sample Login Credentials (Placeholders)

*   **User Role:**
    *   Email: `user@example.com`
    *   Password: `password123`
*   **Admin Role:**
    *   Email: `admin@evcharging.com`
    *   Password: `Admin@123`

**Note:** These are placeholder credentials. You should replace them with the actual credentials you used when setting up or registering users/admins in your application.

## Development

- Backend runs on: Render
- Frontend runs on: Vercel