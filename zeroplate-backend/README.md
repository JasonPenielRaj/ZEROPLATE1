# ZeroPlate Backend API

Backend server for ZeroPlate food donation platform using Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zeroplate
```

For MongoDB Atlas (cloud), use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zeroplate
```

3. Make sure MongoDB is running (local or Atlas).

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Donations
- `GET /api/donations` - Get all donations (query: `?includeExpired=true` to include expired)
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Food Requests
- `GET /api/food-requests` - Get all requests (query: `?foodId=xxx` to filter by food)
- `GET /api/food-requests/:id` - Get single request
- `POST /api/food-requests` - Create request
- `PUT /api/food-requests/:id` - Update request
- `DELETE /api/food-requests/:id` - Delete request

### Trusted NGOs
- `GET /api/trusted-ngos` - Get all NGOs
- `GET /api/trusted-ngos/:id` - Get single NGO
- `POST /api/trusted-ngos` - Create NGO
- `PUT /api/trusted-ngos/:id` - Update NGO
- `DELETE /api/trusted-ngos/:id` - Delete NGO

### Health Check
- `GET /api/health` - Check API status

## Frontend Configuration

Set the API URL in frontend `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```
