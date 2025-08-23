#!/bin/bash
# Post-build script for FlightControl deployment

echo "Starting post-build tasks for Batshit or Not..."

# Run database migrations if DATABASE_URL is set
if [ ! -z "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npm run db:push
  echo "Database migrations complete!"
else
  echo "No DATABASE_URL found, skipping migrations"
fi

# Verify build output
echo "Verifying build output..."
if [ -d "dist" ]; then
  echo "✅ Build directory found"
  ls -la dist/
else
  echo "❌ Build directory not found!"
  exit 1
fi

echo "Post-build tasks complete!"