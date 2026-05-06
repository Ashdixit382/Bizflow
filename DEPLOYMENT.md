# BizFlow Manager Deployment Guide

## Frontend Deployment (Netlify)

### Step 1: Deploy to Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up
3. Click "Add new site" → "Import an existing project"
4. Connect to your GitHub repository
5. Configure build settings:
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`
6. Add environment variables:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (update after backend deployment)
7. Click "Deploy site"

### Step 2: Update Netlify Redirects
Create `netlify.toml` in root:
```toml
[build]
  base = "client/"
  command = "npm run build"
  publish = "dist/"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Backend Deployment (Render)

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect to your GitHub repository
4. Configure service:
   - **Name**: bizflow-server
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free
5. Add environment variables:
   - `PORT`: 5055
   - `MONGO_URI`: `mongodb+srv://ashishdixit20002_db_user:xvPnKLQgnCUeLjxz@bizflow.eghlvc8.mongodb.net/?appName=Bizflow`
   - `JWT_SECRET`: `your_secure_jwt_secret_here`
   - `JWT_EXPIRES_IN`: 7d
   - `CLIENT_URL`: `https://your-netlify-site.netlify.app,http://localhost:5173`
6. Click "Create Web Service"

### Step 2: Update Frontend API URL
After backend is deployed, update Netlify environment variables:
- Go to Netlify → Site settings → Environment variables
- Update `VITE_API_URL` to your Render backend URL
- Redeploy the site

## Important Notes

1. **JWT Secret**: Change the default JWT secret to something secure
2. **CORS**: Make sure your backend allows requests from your Netlify domain
3. **Database**: Your MongoDB Atlas connection is already configured
4. **Free Tiers**: Both Netlify and Render have free tiers suitable for development

## Testing
After deployment:
1. Visit your Netlify site
2. Try logging in with demo accounts
3. Test CRUD operations for products, customers, etc.
4. Check browser console for any API errors
