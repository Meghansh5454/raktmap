# SMS Token System Configuration

## Current Setup ✅
- SMS Link: `https://donor-location-tracker.onrender.com/r/${token}`
- Local Backend: `http://localhost:5000`
- CORS: Allows onrender domain

## How to Make It Work

### Option 1: Configure Hosted Page API URL
The hosted page at `donor-location-tracker.onrender.com` needs to send token responses to your local backend.

**Step 1**: Make sure your local backend is accessible
```bash
# Start your local backend
npm start

# Your API should be running at: http://localhost:5000
```

**Step 2**: The hosted page needs to be configured to use:
- GET Token: `http://localhost:5000/r/${token}`
- POST Response: `http://localhost:5000/r/${token}/respond`

**Step 3**: Test the flow:
1. Send SMS from your local system (creates token in your local DB)
2. SMS goes to: `https://donor-location-tracker.onrender.com/r/TOKEN123`
3. Hosted page calls: `http://localhost:5000/r/TOKEN123` (your local API)
4. Location saves to your local database

### Option 2: Environment Variable for API
If the hosted page supports environment variables, set:
```
API_BASE_URL=http://localhost:5000
```

### Option 3: Query Parameter
Access the hosted page with API URL:
```
https://donor-location-tracker.onrender.com/r/TOKEN123?api=http://localhost:5000
```

## Testing
1. Create a blood request (generates token)
2. Check token was created: `http://localhost:5000/r/TOKEN123`
3. Donor clicks SMS link and submits location
4. Check location saved: Filter by request ID

## Troubleshooting
- Ensure local backend is running on port 5000
- Check CORS allows onrender domain ✅
- Verify token exists in local database
- Check if hosted page is configured for correct API endpoint
