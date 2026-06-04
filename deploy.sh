#!/bin/bash
set -e

echo "==> Pulling latest code"
git pull origin main

echo "==> Installing & building API"
cd api
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
cd ..

echo "==> Installing & building Web App"
cd web
npm ci --production=false
npm run build
cd ..

echo "==> Installing & building Landing Page"
cd landing
if [ -f package-lock.json ]; then
  npm ci --production=false
else
  npm install
fi
npm run build
cd ..

if [ "${SKIP_ADMIN}" = "1" ]; then
  echo "==> Skipping Admin Panel (SKIP_ADMIN=1)"
else
  echo "==> Installing & building Admin Panel"
  cd admin
  if [ -f package-lock.json ]; then
    npm ci --production=false
  else
    npm install
  fi
  npm run build
  cd ..
fi

echo "==> Restarting services"
if [ "${SKIP_ADMIN}" = "1" ]; then
  pm2 restart tap2buy-api tap2buy-web tap2buy-landing --update-env
  pm2 delete tap2buy-admin 2>/dev/null || true
else
  pm2 restart ecosystem.config.js --update-env
fi

echo "==> Waiting for services to start..."
sleep 5

echo "==> Health check"
if curl -sf http://localhost:4000/api/health > /dev/null; then
  echo "    API: OK"
else
  echo "    API: FAILED" && pm2 logs tap2buy-api --lines 20 && exit 1
fi

if curl -sf http://localhost:3001 > /dev/null; then
  echo "    Web: OK"
else
  echo "    Web: FAILED" && pm2 logs tap2buy-web --lines 20 && exit 1
fi

if curl -sf http://localhost:3000 > /dev/null; then
  echo "    Landing: OK"
else
  echo "    Landing: FAILED" && pm2 logs tap2buy-landing --lines 20 && exit 1
fi

if [ "${SKIP_ADMIN}" != "1" ]; then
  if curl -sf http://localhost:3002 > /dev/null; then
    echo "    Admin: OK"
  else
    echo "    Admin: FAILED" && pm2 logs tap2buy-admin --lines 20 && exit 1
  fi
fi

echo "==> Done!"
pm2 status
