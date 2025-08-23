#!/bin/bash
# Production startup script with database migration

echo "🦇 Starting Batshit or Not in production mode..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

# Run database migrations
echo "📊 Running database migrations..."
npm run db:push

if [ $? -ne 0 ]; then
  echo "❌ Database migration failed!"
  exit 1
fi

echo "✅ Database migrations complete!"

# Start the application
echo "🚀 Starting application server..."
node dist/index.js