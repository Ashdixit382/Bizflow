# Setup Instructions

## After Cloning the Repository

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment Files

#### Server Environment (.env)
Create `server/.env` file with:
```
PORT=5055
MONGO_URI=mongodb+srv://ashishdixit20002_db_user:xvPnKLQgnCUeLjxz@bizflow.eghlvc8.mongodb.net/?appName=Bizflow
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://localhost:5174
```

#### Client Environment (.env)
Create `client/.env` file with:
```
VITE_API_URL=http://localhost:5055/api
```

### 3. Run the Application
```bash
npm run dev
```

## Important Notes

### Why .env Files Aren't in Git
- Security: Database credentials and secrets shouldn't be public
- Flexibility: Different environments need different settings
- Best Practice: Keeps sensitive information out of version control

### For Your Specific Setup
- The MongoDB URI above uses your database credentials
- You can change the JWT_SECRET to something more secure
- Client URL allows both possible Vite ports (5173, 5174)

### Database Setup
- Your MongoDB Atlas database is already configured
- No additional database setup needed
- The application will connect automatically with the provided URI

## Quick Start Summary
1. Clone repo
2. `npm install`
3. Create `server/.env` and `client/.env` with the content above
4. `npm run dev`
5. Visit http://localhost:5173
