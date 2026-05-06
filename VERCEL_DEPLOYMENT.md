# Backend Deployment to Vercel

## Step 1: Prepare Your Repository
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Configure the Project:**
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty (Vercel handles it)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

## Step 3: Add Environment Variables
In Vercel project settings → Environment Variables, add:
```
MONGO_URI=mongodb+srv://ashishdixit20002_db_user:xvPnKLQgnCUeLjxz@bizflow.eghlvc8.mongodb.net/?appName=Bizflow
JWT_SECRET=your_secure_jwt_secret_here_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-netlify-site.netlify.app,http://localhost:5173
NODE_ENV=production
```

## Step 4: Deploy
Click "Deploy" and wait for the deployment to complete.

## Step 5: Get Your Backend URL
After deployment, Vercel will give you a URL like:
`https://your-project-name.vercel.app`

## Step 6: Update Frontend
Update your frontend to use the new backend URL:
1. Go to Netlify → Site settings → Environment variables
2. Update `VITE_API_URL` to: `https://your-project-name.vercel.app/api`
3. Redeploy Netlify site

## Important Notes

### Vercel-Specific Changes Made:
- Created `server/api/index.js` - Vercel-compatible server entry point
- Created `server/vercel.json` - Vercel configuration file
- Adjusted routing to work with Vercel's serverless functions

### Troubleshooting:
- If you get "Cannot find module" errors, check that all imports use `.js` extensions
- If database connection fails, verify MONGO_URI environment variable
- Check Vercel function logs for detailed error messages

### Testing:
After deployment:
1. Test API endpoints: `https://your-project-name.vercel.app/api/health`
2. Test authentication endpoints
3. Verify frontend can connect to backend

## Free Tier Limitations:
- Vercel free tier: 100GB bandwidth/month
- Function execution: 10 seconds max
- Should be sufficient for development and small projects
