#!/bin/bash

# Development script for ForeverCore Admin Panel

echo "🚀 Starting ForeverCore Admin Panel development server..."

cd panelui

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if command -v bun >/dev/null 2>&1; then
        bun install
    else
        npm install
    fi
fi

# Set development environment variables
export NODE_ENV=development
export NEXT_PUBLIC_API_URL=http://localhost:3010
export GDPS_API_URL=http://localhost:3010

echo "🌐 Admin Panel will be available at: http://localhost:3001"
echo "🔗 Make sure ForeverCore API is running on: http://localhost:3010"

# Start development server
if command -v bun >/dev/null 2>&1; then
    echo "⚡ Using Bun runtime"
    bun run dev
else
    echo "📦 Using Node.js runtime"
    npm run dev
fi