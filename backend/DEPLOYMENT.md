# Backend Deployment Guide for Render

This guide provides step-by-step instructions to deploy the PlusWay e-commerce backend to Render.

## Prerequisites

Before deploying, ensure you have:

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Code pushed to GitHub
3. **MongoDB Atlas**: Production database URL
4. **Cloudinary Account**: Cloud name, API key, and secret
5. **Razorpay Account**: Key ID and secret for payments

## Deployment Steps

### 1. Prepare Your Repository

Ensure your backend code is pushed to GitHub:

```bash
cd backend
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create a New Web Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your backend code

### 3. Configure the Service

Fill in the following details:

- **Name**: `plusway-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., Singapore, Oregon)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend` (if backend is in a subdirectory)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or paid plan for production)

### 4. Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add the following:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Auto-assigned by Render if not set |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secret | Strong random string (64+ characters) |
| `JWT_REFRESH_SECRET` | Your secret | Different from JWT_SECRET |
| `JWT_ACCESS_EXPIRE` | `7d` | Token expiration time |
| `JWT_REFRESH_EXPIRE` | `7d` | Refresh token expiration |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Your API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Your API secret | From Cloudinary dashboard |
| `RAZORPAY_KEY_ID` | Your key ID | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Your secret | From Razorpay dashboard |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your deployed frontend URL |

> **Important**: Do not include trailing slashes in URLs.

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your application
3. Monitor the build logs for any errors
4. Wait for the deployment to complete (usually 2-5 minutes)

### 6. Verify Deployment

Once deployed, Render will provide a URL like: `https://plusway-backend.onrender.com`

Test the following endpoints:

1. **Health Check**:
   ```bash
   curl https://plusway-backend.onrender.com/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-19T06:00:00.000Z",
     "uptime": 123.45,
     "environment": "production"
   }
   ```

2. **Root Endpoint**:
   ```bash
   curl https://plusway-backend.onrender.com/
   ```
   Expected: `PlusWay Backend API is Running`

3. **Test API Endpoint** (e.g., categories):
   ```bash
   curl https://plusway-backend.onrender.com/api/categories
   ```

## Post-Deployment Configuration

### Update Frontend Environment

Update your frontend's API URL to point to the Render backend:

**For Vercel/Vite**:
```env
VITE_API_URL=https://plusway-backend.onrender.com
```

### Enable CORS

Ensure `FRONTEND_URL` environment variable is set correctly in Render to allow cross-origin requests from your frontend.

## Monitoring and Logs

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab to view real-time logs

### Monitor Health
- Render automatically monitors the `/health` endpoint
- If health checks fail, Render will attempt to restart the service

### Auto-Deploy
By default, Render automatically deploys when you push to the connected branch. To disable:
1. Go to service settings
2. Scroll to **"Auto-Deploy"**
3. Toggle off if needed

## Troubleshooting

### Common Issues

#### 1. Build Failure
- **Error**: `npm install` fails
- **Solution**: Check `package.json` is valid and all dependencies are listed

#### 2. Database Connection Error
- **Error**: `MongoDB Connection Error`
- **Solution**: 
  - Verify `MONGO_URI` is correct
  - Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
  - Check network access settings in MongoDB Atlas

#### 3. CORS Errors
- **Error**: Frontend can't access API
- **Solution**: 
  - Verify `FRONTEND_URL` matches your frontend domain exactly
  - No trailing slashes in the URL
  - Check browser console for specific CORS error

#### 4. Environment Variables Not Loading
- **Error**: `process.env.VARIABLE is undefined`
- **Solution**:
  - Double-check spelling in Render dashboard
  - Restart service after adding new variables
  - Verify `.env` is in `.gitignore`

#### 5. Port Binding Issues
- **Error**: `Port already in use`
- **Solution**: Ensure `PORT` uses `process.env.PORT || 5000`

#### 6. Health Check Failing
- **Error**: Service keeps restarting
- **Solution**: 
  - Verify `/health` endpoint returns 200 status
  - Check logs for startup errors
  - Ensure database connects successfully

### Check Deployment Status

```bash
# Check if service is running
curl -I https://plusway-backend.onrender.com/health

# View detailed health info
curl https://plusway-backend.onrender.com/health | json_pp
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` to Git
2. **MongoDB**: Limit IP whitelist in production (not 0.0.0.0/0)
3. **Rate Limiting**: Already configured (1000 req/min per IP)
4. **Helmet**: Security headers enabled
5. **CORS**: Only allow your frontend domain

## Scaling

For production use:

1. **Upgrade Plan**: Free tier sleeps after inactivity
   - Consider **Starter** ($7/month) for always-on service
   
2. **Database**: Monitor MongoDB Atlas usage
   - Upgrade cluster size as needed

3. **Caching**: Consider adding Redis for session management

4. **CDN**: Cloudinary handles image CDN automatically

## Backup and Recovery

1. **Database Backups**: MongoDB Atlas auto-backups (M10+ clusters)
2. **Code**: Always in Git repository
3. **Environment Variables**: Keep secure backup of all env vars

## Useful Commands

```bash
# Test health endpoint
curl https://plusway-backend.onrender.com/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://plusway-backend.onrender.com/api/products

# Check response headers
curl -I https://plusway-backend.onrender.com/
```

## Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Status**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)

---

**Deployment Checklist**:
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas database created
- [ ] Cloudinary account configured
- [ ] Razorpay account setup
- [ ] Render service created
- [ ] All environment variables added
- [ ] Health check endpoint returns 200
- [ ] Test API endpoints
- [ ] Frontend `VITE_API_URL` updated
- [ ] CORS configured correctly
- [ ] Logs monitored for errors
