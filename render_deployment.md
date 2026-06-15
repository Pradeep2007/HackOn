# Render Deployment Guide: Amazon Resell Program

This guide provides the step-by-step process to deploy all three services (Next.js frontend, Express backend, and Python FastAPI service) on **Render.com**.

---

## 1. Deploy the Node.js Express Backend
1. Sign in to your **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing the project.
4. **Configure Settings:**
   * **Name:** `amazon-resell-backend`
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start`
   * **Instance Type:** `Free`
5. **Environment Variables:**
   * Add a variable if you want to use an external Mongo database:
     * Key: `MONGODB_URI`
     * Value: `mongodb+srv://...` (your Mongo Atlas link)
     * *Note: If omitted, the server will automatically download and start the seed memory database.*
6. Click **Create Web Service**. Copy the generated URL (e.g. `https://amazon-resell-backend.onrender.com`).

---

## 2. Deploy the Python FastAPI AI Engine
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. **Configure Settings:**
   * **Name:** `amazon-resell-ai`
   * **Root Directory:** `backend/src/ai`
   * **Environment:** `Python`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn ai_engine:app --host 0.0.0.0 --port 10000`
   * **Instance Type:** `Free`
4. Click **Create Web Service**. Copy the generated URL (e.g. `https://amazon-resell-ai.onrender.com`).

---

## 3. Link Backend to the FastAPI AI Service
1. Go back to your **Express Backend** settings on Render.
2. Add an environment variable to link to the live FastAPI engine:
   * Key: `AI_ENGINE_URL`
   * Value: `https://amazon-resell-ai.onrender.com` (your live FastAPI service URL)
3. Save changes. Render will automatically redeploy the backend.

---

## 4. Deploy the Next.js Frontend
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. **Configure Settings:**
   * **Name:** `amazon-resell-frontend`
   * **Root Directory:** `frontend`
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
4. **Environment Variables:**
   * Key: `NEXT_PUBLIC_API_URL`
   * Value: `https://amazon-resell-backend.onrender.com` (your live Express backend URL from Step 1)
5. Click **Create Web Service**.
6. Once deployed, open the generated frontend URL to access your live Amazon Resell application!
