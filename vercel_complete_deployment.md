# Complete Vercel Deployment Guide: Amazon Resell

This guide provides the complete step-by-step process to deploy both the **Frontend** and **Backend** services, detailing the two main options:
1. **Option A (Recommended):** Next.js Frontend on Vercel + Express Backend & Python AI on Render (Free & preserves the local database state).
2. **Option B:** Both Frontend and Express Backend hosted directly on Vercel (requires setting up a free external MongoDB Atlas cluster since Vercel is stateless/serverless).

---

## Option A: Frontend on Vercel + Backend on Render (Recommended)

This is the standard approach for hackathons. It keeps the Node.js Express server running 24/7 with the seed memory database, so you don't need to configure MongoDB Atlas.

### Step 1: Deploy the Express Backend on Render
1. Go to **[Render.com](https://render.com)** and sign in.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. **Configure Settings:**
   * **Name:** `amazon-resell-backend`
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start`
   * **Instance Type:** `Free`
5. Click **Create Web Service**. 
6. Wait for deployment to finish and copy your live backend URL (e.g., `https://amazon-resell-backend.onrender.com`).

### Step 2: Deploy the Next.js Frontend on Vercel
1. Log in to your **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Configure Settings:**
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Select `frontend`
   * **Environment Variables:**
     * Key: `NEXT_PUBLIC_API_URL`
     * Value: `https://amazon-resell-backend.onrender.com` (your live Render backend URL from Step 1)
5. Click **Deploy**.
6. Vercel will build and launch your frontend. Open the provided Vercel URL to access your live application!

---

## Option B: Deploying Both Frontend and Backend on Vercel

If you want both the frontend and backend hosted on Vercel, the backend will run as a **Vercel Serverless Function**. 

> [!WARNING]
> Vercel Serverless Functions are stateless and ephemeral. The in-memory MongoDB database will reset constantly. To use this option, you **MUST** create a free MongoDB database cluster on MongoDB Atlas and supply the connection string.

### Step 1: Create a Free MongoDB Database on MongoDB Atlas
1. Sign up/log in at **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Create a new project and build a **Free Shared Cluster** (M0).
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Vercel serverless IPs change dynamically.
4. Under **Database Access**, create a user credentials pair (username and password).
5. Click **Connect** > **Drivers** and copy the Connection String (e.g., `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`).

### Step 2: Configure Backend for Vercel Serverless
To allow Vercel to route requests to our Express backend, we need to add a configuration file.
1. Create a `vercel.json` file inside the `backend/` directory with the following contents:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.ts"
       }
     ]
   }
   ```
2. Update the end of [backend/src/server.ts](file:///c:/Users/ASUS/OneDrive/Desktop/HackOnanti/backend/src/server.ts) to export `app` so Vercel can handle the routes:
   Add `export default app;` at the bottom of the file.

### Step 3: Deploy the Express Backend on Vercel
1. Go to your **Vercel Dashboard**.
2. Click **Add New** > **Project** and import your repository.
3. **Configure Settings:**
   * **Framework Preset:** `Other` (or Node.js)
   * **Root Directory:** Select `backend`
   * **Environment Variables:**
     * Key: `MONGODB_URI`
     * Value: `mongodb+srv://...` (your MongoDB Atlas connection string from Step 1)
4. Click **Deploy**.
5. Once deployed, copy your backend API domain (e.g., `https://amazon-resell-backend.vercel.app`).

### Step 4: Deploy the Next.js Frontend on Vercel
1. Go to your **Vercel Dashboard**.
2. Click **Add New** > **Project** and import your repository.
3. **Configure Settings:**
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Select `frontend`
   * **Environment Variables:**
     * Key: `NEXT_PUBLIC_API_URL`
     * Value: `https://amazon-resell-backend.vercel.app` (your backend Vercel URL from Step 3)
4. Click **Deploy**.
