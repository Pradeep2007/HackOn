# AWS EC2 Deployment Guide: Amazon Resell Program

This guide provides the exact command sequence to launch and manage the backend APIs, python diagnostics, and Next.js frontend on an AWS EC2 instance (Ubuntu 22.04 LTS).

---

## 1. AWS EC2 Instance Security Group Settings
Before connecting, ensure the following inbound ports are opened in your AWS Security Group:
* **SSH:** Port `22` (Restrict to your IP)
* **HTTP:** Port `80` (Open to public `0.0.0.0/0`)
* **Express API:** Port `5000` (Optional / Proxy through Port 80)
* **FastAPI Service:** Port `8000` (Optional / Proxy through Port 80)
* **Next.js Client:** Port `3000` (Optional / Proxy through Port 80)

---

## 2. Server Installation & Configuration

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
```bash
cd /var/www
# Replace with your git repository link
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

### Step 4.1: Install Nginx
```bash
sudo apt install -y nginx
```

### Step 4.2: Configure Nginx Routing rules
Create a new configuration file:
```bash
sudo nano /etc/nginx/sites-available/amazon-resell
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain_or_ec2_public_ip;

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
To ensure they persist across EC2 reboots, run:
```bash
pm2 startup
```
pm2 save
```
