# EV Charging Station Application

A full-stack application for managing EV charging stations.

## Project Structure

- `/backend` - Node.js + Express backend
- `/frontend` - Vue.js frontend

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

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
   MONGODB_URI=mongodb://localhost:27017/ev_charging
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

## Features

- Backend API with Express
- MongoDB database integration
- Vue.js frontend with Vuex and Vue Router
- Modern UI with responsive design

## Development

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:8080 