# BizFlow Manager - Complete Deployment Guide

## Project Structure
This repository is now structured for easy deployment on any computer:

```
bizflow-manager/
├── api/                    # Vercel serverless functions
│   └── index.js           # Main API handler
├── client/                 # React frontend (Netlify)
│   ├── src/
│   ├── package.json
│   └── dist/              # Built frontend
├── server/                # Backend source code (for local development)
│   ├── src/
│   └── package.json
├── vercel.json            # Vercel configuration
├── netlify.toml          # Netlify configuration
└── package.json          # Root workspace
```

## Quick Deployment Steps

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd bizflow-manager
npm install
```

### 2. Deploy Backend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Root Directory**: Leave empty (root)
5. **Framework Preset**: Other
6. **Build Command**: Leave empty
7. **Install Command**: `npm install`

### 3. Add Vercel Environment Variables
```
CLIENT_URL=https://your-netlify-site.netlify.app
NODE_ENV=production
```

### 4. Deploy Frontend to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. **Base directory**: `client`
4. **Build command**: `npm run build`
5. **Publish directory**: `client/dist`

### 5. Add Netlify Environment Variable
```
VITE_API_URL=https://your-vercel-site.vercel.app/api
```

## Local Development

### Start Both Frontend and Backend
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5055

### Start Only Frontend
```bash
npm run dev --workspace client
```

### Start Only Backend
```bash
npm run dev --workspace server
```

## Environment Variables

### For Local Development
- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`
- Update with your MongoDB credentials

### For Production
- Vercel: Add environment variables in Vercel dashboard
- Netlify: Add environment variables in Netlify dashboard

## Important Notes

### Why This Structure Works
- **Vercel**: Looks for `api/` folder in root for serverless functions
- **Netlify**: Builds from `client/` folder
- **Local Development**: Uses `server/` folder with Express
- **Cross-platform**: Works on any computer after cloning

### Database Setup
- MongoDB Atlas connection is configured in environment variables
- Update `MONGO_URI` with your database credentials
- The `server/` folder contains the full backend with database integration

### Security
- Never commit `.env` files with real credentials
- Use different secrets for production
- Update JWT secret for production deployment

## Troubleshooting

### Vercel Deployment Issues
- Check that `api/index.js` exists in root
- Verify environment variables are set
- Check deployment logs for errors

### Netlify Deployment Issues
- Verify build command: `npm run build`
- Check publish directory: `client/dist`
- Ensure `VITE_API_URL` is set correctly

### Local Development Issues
- Ensure MongoDB is running locally or use Atlas
- Check that all dependencies are installed
- Verify port availability (5055 for backend, 5173 for frontend)

## URLs After Deployment
- **Frontend**: https://your-site.netlify.app
- **Backend**: https://your-api.vercel.app/api
- **Health Check**: https://your-api.vercel.app/api/health
