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
npm ci --production=false
npm run build
cd ..

echo "==> Restarting services"
pm2 restart ecosystem.config.js --update-env

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

echo "==> Done!"
pm2 status
