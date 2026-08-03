# ZeroPlate MongoDB Setup Guide

## Overview
ZeroPlate now uses MongoDB to store all data instead of localStorage. The application consists of:
- **Backend**: Express.js API server (`zeroplate-backend/`)
- **Frontend**: React app (`zeroplate-frontend/`)

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Backend Setup

1. Navigate to backend directory:
```bash
cd zeroplate-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
# Copy the example file
cp .env.example .env
```

4. Edit `.env` with your MongoDB connection string:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zeroplate
```

For MongoDB Atlas (cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zeroplate
```

5. Start MongoDB (if using local installation):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

6. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to frontend directory:
```bash
cd zeroplate-frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Create `.env` file in `zeroplate-frontend/`:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

## Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd zeroplate-backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd zeroplate-frontend
npm run dev
```

## API Endpoints

### Donations
- `GET /api/donations` - Get all active donations
- `GET /api/donations?includeExpired=true` - Get all donations including expired
- `POST /api/donations` - Create new donation
- `GET /api/donations/:id` - Get single donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Food Requests
- `GET /api/food-requests` - Get all requests
- `GET /api/food-requests?foodId=xxx` - Get requests for specific food
- `POST /api/food-requests` - Create new request
- `GET /api/food-requests/:id` - Get single request
- `PUT /api/food-requests/:id` - Update request
- `DELETE /api/food-requests/:id` - Delete request

### Trusted NGOs
- `GET /api/trusted-ngos` - Get all NGOs
- `POST /api/trusted-ngos` - Create new NGO
- `GET /api/trusted-ngos/:id` - Get single NGO
- `PUT /api/trusted-ngos/:id` - Update NGO
- `DELETE /api/trusted-ngos/:id` - Delete NGO

### Health Check
- `GET /api/health` - Check API status

## Migration from localStorage

If you have existing data in localStorage, you can manually migrate it by:
1. Opening browser DevTools → Application → Local Storage
2. Copying the data from keys like `zeroplate_available_foods`, `zeroplate_food_requests`, `zeroplate_trusted_ngos`
3. Using the API endpoints to POST the data to MongoDB

## Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify `.env` file has correct `MONGODB_URI`
- Check port 5000 is not in use

**Frontend can't connect to API:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` file
- Check browser console for CORS errors (should be handled by backend)

**Data not showing:**
- Check MongoDB connection
- Verify API endpoints are responding (test with `/api/health`)
- Check browser Network tab for failed requests
