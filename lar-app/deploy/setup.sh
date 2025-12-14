#!/bin/bash
set -e

echo "🚀 Starting Deployment for LAR App..."

# 1. Install Node.js 20.x if not exists
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js is already installed."
fi

# Ensure Git is installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo apt-get install -y git
fi

# 2. Database Setup
echo "🗄️ Setting up PostgreSQL..."
# Create User if not exists
sudo -u postgres psql -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'Lar') THEN CREATE ROLE \"Lar\" WITH LOGIN PASSWORD 'Cuongnv@123'; END IF; END \$\$;"
# Create DB if not exists
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'LarDB'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE \"LarDB\" OWNER \"Lar\";"
# Grant privileges
sudo -u postgres psql -c "ALTER USER \"Lar\" CREATEDB;"

# 3. App Setup
REPO_DIR="/var/www/AppMarketingSMEs"
APP_DIR="$REPO_DIR/lar-app"

echo "📂 Setting up repository at $REPO_DIR..."

# Fix previous incorrect path if exists
if [ -d "/var/www/lar-app" ] && [ -d "/var/www/lar-app/.git" ] && [ ! -d "$REPO_DIR" ]; then
    echo "⚠️  Renaming previous install to correct structure..."
    mv /var/www/lar-app $REPO_DIR
fi

if [ -d "$REPO_DIR/.git" ]; then
    echo "🔄 Pulling latest code..."
    cd $REPO_DIR
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/cuongccna/AppMarketingSMEs.git $REPO_DIR
fi

echo "📂 Entering application directory: $APP_DIR"
cd $APP_DIR

# 4. Environment Configuration
echo "⚙️ Configuring environment..."
cp /tmp/.env.production $APP_DIR/.env

# 5. Install & Build
echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run db:generate
npm run db:push
npm run build

# 6. PM2 Setup
echo "🚀 Configuring PM2..."
if pm2 list | grep -q "lar-app"; then
    echo "🔄 Restarting lar-app..."
    pm2 restart lar-app
else
    echo "▶️ Starting lar-app on port 3001..."
    pm2 start npm --name "lar-app" -- start -- -p 3001
    pm2 save
fi

# 7. Nginx Setup
echo "🌐 Configuring Nginx..."
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/lar-app
sudo ln -sf /etc/nginx/sites-available/lar-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment Complete! Visit http://larai.vn"
echo "⚠️  Note: Run 'sudo certbot --nginx -d larai.vn' manually to enable HTTPS."
