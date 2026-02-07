#!/bin/bash
# SOVEH - Quick Setup Script
# Run this script on a fresh Ubuntu/Debian server

set -e

echo "🚀 SOVEH Quick Setup Script"
echo "=========================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (sudo ./setup.sh)"
    exit 1
fi

# Update system
echo "📦 Updating system..."
apt-get update && apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create environment file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cat > .env << EOF
# SOVEH Environment Configuration

# Backend
MONGO_URL=mongodb://mongodb:27017
DB_NAME=soveh_production
EMERGENT_LLM_KEY=your_emergent_key_here

# Frontend
REACT_APP_BACKEND_URL=http://your-domain.com
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key_here
EOF
    echo "⚠️  Please edit .env file with your actual API keys!"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose build
docker-compose up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
sleep 10

# Restore database (if exports exist)
if [ -d "exports/database" ]; then
    echo "📥 Restoring database..."
    docker exec soveh-backend python restore_database.py --backup-dir /app/exports/database
fi

echo ""
echo "✅ SOVEH Setup Complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env file with your API keys"
echo "   2. Run 'docker-compose restart' after editing .env"
echo "   3. Configure your domain and SSL certificate"
echo ""
