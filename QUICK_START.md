# Quick Start Guide - EV Charging Project

## 1. Start MongoDB
```bash
# Open Services (Windows + R, type "services.msc")
# Find and start "MongoDB" service
```

## 2. Start Backend
```bash
# Navigate to project directory
cd EV_charging

# Start backend server
cd backend
npm run dev
```

## 3. Test APIs in Postman
1. **Import Collection**
   - Open Postman
   - Click "Import"
   - Select `EV_Charging_API.postman_collection.json`

2. **Test Authentication**
   - Run "Register" request
   - Run "Login" request
   - Copy the token from login response

3. **Test Charging Stations**
   - Add token to all requests
   - Test CRUD operations in sequence

## Quick Reference

### API Endpoints
```
Auth:
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login

Charging Stations:
POST   http://localhost:5000/api/charging-stations
GET    http://localhost:5000/api/charging-stations
GET    http://localhost:5000/api/charging-stations/:id
PATCH  http://localhost:5000/api/charging-stations/:id
DELETE http://localhost:5000/api/charging-stations/:id
```

### Common Issues
- If MongoDB connection fails: Check if MongoDB service is running
- If server won't start: Check if port 5000 is available
- If API calls fail: Verify JWT token is valid

### Useful Commands
```bash
# Check MongoDB status
services.msc

# Kill process on port 5000 (if needed)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

## Need More Help?
- Check `SETUP_GUIDE.md` for detailed setup instructions
- Use `VERIFICATION_CHECKLIST.md` to verify everything is working
- Review `EV_Charging_API.postman_collection.json` for API details 