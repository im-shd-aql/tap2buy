#!/bin/bash
# One-time server setup for Tap2Buy on Ubuntu 24.04 (DigitalOcean)
set -e

echo "==> Updating system"
apt update && apt upgrade -y

echo "==> Installing Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "==> Installing PM2"
npm install -g pm2

echo "==> Installing PostgreSQL 17"
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
apt update
apt install -y postgresql-17

echo "==> Installing nginx"
apt install -y nginx

echo "==> Creating database user and database"
sudo -u postgres psql -c "CREATE USER tap2buy WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE tap2buy OWNER tap2buy;"

echo "==> Creating SSL directory"
mkdir -p /etc/ssl/tap2buy
echo "    *** Copy your Cloudflare Origin cert.pem and key.pem to /etc/ssl/tap2buy/ ***"

echo "==> Creating app directory"
mkdir -p /var/www
cd /var/www

echo "==> Cloning repo (you'll need to auth with GitHub)"
git clone https://github.com/im-shd-aql/tap2buy.git
cd tap2buy

echo "==> Creating production .env files"
cp api/.env.production api/.env
echo "    *** Edit /var/www/tap2buy/api/.env with real secrets ***"

echo "NEXT_PUBLIC_API_URL=https://tap2buy.lk" > web/.env.production

echo "==> First build"
# API
cd api && npm ci --production=false && npx prisma generate && npx prisma migrate deploy && npm run build && cd ..
# Web
cd web && npm ci --production=false && npm run build && cd ..
# Landing
cd landing && npm ci --production=false && npm run build && cd ..

echo "==> Setting up nginx"
cp nginx.conf /etc/nginx/sites-available/tap2buy
ln -sf /etc/nginx/sites-available/tap2buy /etc/nginx/sites-enabled/tap2buy
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "==> Starting PM2"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "==> Setting up daily database backup"
mkdir -p /var/backups/tap2buy
cat > /etc/cron.d/tap2buy-backup << 'CRON'
0 3 * * * postgres pg_dump tap2buy | gzip > /var/backups/tap2buy/tap2buy_$(date +\%Y\%m\%d).sql.gz
0 4 * * * root find /var/backups/tap2buy -mtime +7 -delete
CRON

echo ""
echo "========================================="
echo "  Setup complete! Next steps:"
echo "========================================="
echo "1. Copy Cloudflare Origin cert to /etc/ssl/tap2buy/cert.pem and key.pem"
echo "2. Edit /var/www/tap2buy/api/.env — fill in real secrets:"
echo "   - DATABASE_URL password"
echo "   - JWT_SECRET (random 64 chars)"
echo "   - notify.lk API key + sender ID"
echo "   - R2 credentials"
echo "   - PayHere credentials"
echo "3. Restart: pm2 restart all"
echo "4. Test: curl https://tap2buy.lk/api/health"
echo "========================================="
