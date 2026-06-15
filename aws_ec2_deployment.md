# AWS EC2 Deployment Guide: Amazon Resell Program

This guide provides the complete step-by-step process to launch an AWS EC2 instance, connect to it via SSH, and configure all services (Express backend, Python FastAPI engine, and Next.js frontend) with Nginx as a reverse proxy.

---

## 1. Step-by-Step Instance Launch & Connection

### Step 1.1: Launch the EC2 Instance
1. Log in to your **[AWS Management Console](https://aws.amazon.com/console/)**.
2. Search for **EC2** and click **Launch Instance**.
3. **Configure Settings:**
   * **Name:** `amazon-resell-server`
   * **OS Image (AMI):** `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type`
   * **Instance Type:** `t2.micro` (or `t3.micro` depending on free tier availability in your region)
   * **Key Pair:** Click **Create new key pair**:
     * Key pair name: `amazon-resell-key`
     * Key pair type: `RSA`
     * Private key file format: `.pem`
     * Click **Create key pair** to download the file (e.g., `amazon-resell-key.pem`). Save it securely.
4. **Network Settings (Security Group):**
   * Check **Allow SSH traffic from** and select **My IP** (or *Anywhere* if you need access from different locations).
   * Check **Allow HTTP traffic from the internet** (Port 80).
   * Check **Allow HTTPS traffic from the internet** (Port 443).
5. Click **Launch Instance**.

### Step 1.2: Set Key Pair Permissions
Open your terminal (on macOS/Linux) or PowerShell (on Windows) and navigate to the directory where your key is saved.

* **On macOS/Linux:**
  ```bash
  chmod 400 amazon-resell-key.pem
  ```
* **On Windows (PowerShell):**
  ```powershell
  icacls.exe .\amazon-resell-key.pem /inheritance:r /grant:r "$($env:username):(R)"
  ```

### Step 1.3: Connect via SSH
Find your EC2 instance's **Public IPv4 Address** or **Public IPv4 DNS** from the EC2 Console. Run:
```bash
ssh -i "amazon-resell-key.pem" ubuntu@<your-ec2-public-ip>
```
Type `yes` when asked to confirm the connection.

---

## 2. Server Installation & Configuration

Once connected to your Ubuntu instance, run the following commands to install Node.js, Python, and the process manager (PM2).

### Step 2.1: Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2.2: Install Node.js (v18+) & NPM
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
# Verify installation
node -v && npm -v
```

### Step 2.3: Install Python3, Pip, and Virtual Environment
```bash
sudo apt install -y python3 python3-pip python3-venv
# Verify installation
python3 --version && pip3 --version
```

### Step 2.4: Install PM2 (Process Manager for Node & Python)
```bash
sudo npm install -y -g pm2
```

---

## 3. Clone Repository & Setup Services

### Step 3.1: Clone the Codebase
We will place the project in `/var/www/` for production standards.
```bash
cd /var/www
# Replace with your repository link
sudo git clone https://github.com/Pradeep2007/HackOn.git amazon-resell
sudo chown -R $USER:$USER /var/www/amazon-resell
cd amazon-resell
```

### Step 3.2: Configure & Start Express Backend
```bash
cd backend
npm install
# Compile TypeScript files
npm run build
# Start backend in background with PM2
pm2 start dist/server.js --name "amazon-backend"
cd ..
```

### Step 3.3: Configure & Start FastAPI AI Service
```bash
# Set up a python virtual environment
cd backend/src/ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Start the AI engine in the background with PM2
pm2 start "uvicorn ai_engine:app --host 127.0.0.1 --port 8000" --name "amazon-ai-engine"
deactivate
cd ../../..
```

### Step 3.4: Configure & Start Next.js Frontend
Before building the frontend, we must tell it where to reach our backend. Since we are using an Nginx reverse proxy on the same server, all requests to `<your-ec2-public-ip>/api/...` will go to the Express server.
1. Create a `.env.production` file inside the `frontend` folder:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://<your-ec2-public-ip>" > frontend/.env.production
   ```
2. Build and start the Next.js production build:
   ```bash
   cd frontend
   npm install
   # Build the production bundle
   npm run build
   # Start Next.js server in the background with PM2
   pm2 start "npm run start" --name "amazon-frontend"
   cd ..
   ```

---

## 4. Setup Nginx Reverse Proxy (Access via Port 80)

Nginx handles routing incoming public HTTP requests on port 80 to the correct internal ports (3000 for frontend, 5000 for backend API, 8000 for FastAPI).

### Step 4.1: Install Nginx
```bash
sudo apt install -y nginx -y
```

### Step 4.2: Configure Nginx Routing Rules
Create a new configuration file:
```bash
sudo nano /etc/nginx/sites-available/amazon-resell
```

Paste the following configuration (replace `<your-ec2-public-ip>` with your EC2 Public IP address):
```nginx
server {
    listen 80;
    server_name <your-ec2-public-ip>;

    # Frontend Routing
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Routing
    location /api {
        proxy_pass http://127.0.0.1:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI AI Engine Routing
    location /analyze {
        proxy_pass http://127.0.0.1:8000/analyze;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 4.3: Enable Configuration & Restart Nginx
Enable your site config, test the configuration syntax, and restart the service:
```bash
sudo ln -s /etc/nginx/sites-available/amazon-resell /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5. Verify Running Processes
To inspect the status of your running servers, execute:
```bash
pm2 list
```
To ensure the processes persist across EC2 reboots, set up startup scripts:
```bash
pm2 startup
pm2 save
```
Now, navigate to `http://<your-ec2-public-ip>` in your browser to view your live, fully functional application!
