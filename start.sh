#!/bin/bash

echo "🚑 Starting Rapid Care..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    brew services start mongodb-community
    sleep 2
fi

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "Now run these commands in separate terminals:"
echo "Terminal 1: cd server && npm run dev"
echo "Terminal 2: cd client && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
