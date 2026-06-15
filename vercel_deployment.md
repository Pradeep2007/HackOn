# Vercel & Multi-Host Deployment Guide: Amazon Resell

Vercel is designed for hosting serverless frontends (like Next.js). Because our backend relies on an Express server (with an in-memory MongoDB database) and a Python FastAPI service, the best production setup is:
1. **Deploy Frontend:** Hosted on **Vercel**.
2. **Deploy Backend & AI Engine:** Hosted on **Render**, **Railway**, or **AWS EC2** (running 24/7).

---

## 1. Prepare Frontend Code for Deployment

We must update the hardcoded `localhost` URLs in our Next.js codebase to use environment variables. This lets Vercel connect to the live backend domain.

### Step 1.1: Update Next.js API Calls to use Environment Variables
In files like [page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/HackOnanti/frontend/src/app/page.tsx), [orders/page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/HackOnanti/frontend/src/app/orders/page.tsx), and [green-wallet/page.tsx](file:///c:/Users/ASUS/OneDrive/Desktop/HackOnanti/frontend/src/app/green-wallet/page.tsx), change:
```typescript
// From:
fetch('http://localhost:5000/api/user')

// To:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/api/user`)
```

---

## 2. Deploy Frontend on Vercel

### Step 2.1: Push Project to GitHub
1. Initialize git and commit your project:
   ```bash
   git init
   git add .
   git commit -m "feat: ready for deploy"
   ```
2. Create a repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Import to Vercel
1. Log in to your **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. **Configure Project Settings:**
   * **Framework Preset:** Select `Next.js`.
   * **Root Directory:** Edit this and select the `frontend` directory.
   * **Build & Development Settings:** Leave as default.
   * **Environment Variables:** Add:
     * Name: `NEXT_PUBLIC_API_URL`
     * Value: `https://your-express-backend-url.onrender.com` (your live backend URL, see Section 3)
5. Click **Deploy**.

---

## 3. Deploy Backend & AI Engine (Render / Railway)

### Option A: Deploy Backend on Render (Free Tier)
1. Go to **[Render.com](https://render.com)** and sign in.
2. Click **New** > **Web Service**.
3. Connect your GitHub repository.
4. Configure Settings:
   * **Root Directory:** Set to `backend`.
   * **Runtime:** Select `Node`.
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start`
   * **Environment Variables:** (If you want to use a persistent database, add `MONGODB_URI` pointing to MongoDB Atlas. If omitted, the server automatically boots using the seed database).
5. Copy your Render service URL (e.g. `https://amazon-resell-backend.onrender.com`) and add it to your Vercel project's `NEXT_PUBLIC_API_URL` environment variable.

### Option B: Deploy Python FastAPI AI Engine on Render
1. Click **New** > **Web Service**.
2. Connect your GitHub repository.
3. Configure Settings:
   * **Root Directory:** Set to `backend/src/ai` (or the project root).
   * **Runtime:** Select `Python`.
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn ai_engine:app --host 0.0.0.0 --port 10000`
4. Copy the FastAPI Service URL and add it to your Express backend environment variables so the backend routes the visual uploads to the deployed FastAPI service.
