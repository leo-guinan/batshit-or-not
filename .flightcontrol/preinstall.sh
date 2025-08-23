#!/bin/bash
# Pre-install script for FlightControl deployment

echo "Starting pre-install setup for Batshit or Not..."

# Ensure we're using the right Node version
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clean any existing installations
echo "Cleaning previous installations..."
rm -rf node_modules
rm -f package-lock.json

echo "Pre-install setup complete!"