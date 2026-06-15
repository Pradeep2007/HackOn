# Amazon Linux 2 / 2023 EC2 Deployment Guide: Amazon Resell

This guide provides the exact command sequence to launch and manage the backend APIs, python diagnostics, and Next.js frontend on an **Amazon Linux** (RHEL-based) EC2 instance using the `ec2-user` login.

---

## 1. Install Node.js (via NVM) & PM2
Since Amazon Linux doesn't support Debian-based node scripts, we install Node.js using **NVM** (Node Version Manager). NVM compiles or fetches the correct binaries dynamically.

Run these commands in your SSH terminal:
```bash
# 1. Download and install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Activate NVM in the current terminal session
. ~/.nvm/nvm.sh

# 3. Install Node.js v18 (LTS)
nvm install 18

# 4. Verify installation (should return versions like v18.x.x and 9.x.x)
node -v && npm -v

# 5. Install PM2 process manager
npm install -g pm2
```

---

## 2. Install Python3 & Pip
Install Python and build dependencies using `yum`:
```bash
# 1. Install Python 3 and development packages
sudo yum install -y python3 python3-pip python3-devel git

# 2. Verify installation
python3 --version && pip3 --version
```

---

## 3. Clone Repository & Setup Services

### Step 3.1: Clone the Codebase
We will place the project in `/var/www/` for production standards.
```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
# Replace with your repository link
git clone https://github.com/Pradeep2007/HackOn.git amazon-resell
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
Before building the frontend, we must tell it where to reach our backend. 
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

## 4. Install and Configure Nginx

On Amazon Linux, Nginx loads configuration files directly from the `/etc/nginx/conf.d/` directory.

### Step 4.1: Install Nginx
Run the appropriate command depending on your Amazon Linux version:
```bash
# Try standard package installer first (Amazon Linux 2023)
sudo yum install -y nginx || sudo dnf install -y nginx || sudo amazon-linux-extras install nginx1 -y
```

### Step 4.2: Add Routing Rules
Create a new configuration file in Nginx's configurations folder:
```bash
sudo nano /etc/nginx/conf.d/amazon-resell.conf
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

### Step 4.3: Start Nginx
Enable Nginx to start on boot and start the service:
```bash
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## 5. Verify Running Processes
To inspect the status of your running servers, execute:
```bash
pm2 list
```
To ensure the processes persist across EC2 reboots:
```bash
# Generates startup commands for NVM PM2 (run the command it prints out)
pm2 startup
# Save running states
pm2 save
```
Now, navigate to `http://<your-ec2-public-ip>` in your browser to view your live, fully functional application!
