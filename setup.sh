#!/bin/bash

# Headscale UI - Installation Script
# This script helps you set up Headscale UI quickly

set -e

echo "========================================="
echo "  Headscale UI - Installation Script"
echo "========================================="
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Check for Docker Compose and determine which command to use
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose détectés ($DOCKER_COMPOSE_CMD)"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  Le fichier .env existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation annulée."
        exit 0
    fi
fi

# Copy .env.example to .env
echo "📋 Création du fichier .env..."
cp .env.example .env

# Prompt for Headscale URL
echo ""
echo "Configuration de Headscale UI"
echo "-----------------------------"
echo ""
read -p "URL de Headscale (ex: http://headscale:8080): " HEADSCALE_URL
sed -i.bak "s|HEADSCALE_URL=.*|HEADSCALE_URL=$HEADSCALE_URL|" .env

# Prompt for API Key
echo ""
read -p "Clé API Headscale: " HEADSCALE_API_KEY
sed -i.bak "s|HEADSCALE_API_KEY=.*|HEADSCALE_API_KEY=$HEADSCALE_API_KEY|" .env

# Prompt for port
echo ""
read -p "Port de l'application (défaut: 3000): " APP_PORT
APP_PORT=${APP_PORT:-3000}
sed -i.bak "s|APP_PORT=.*|APP_PORT=$APP_PORT|" .env

# Clean up backup files
rm -f .env.bak

echo ""
echo "✅ Configuration terminée !"
echo ""

# Create storage directory
echo "📁 Création du répertoire de stockage..."
mkdir -p storage

echo ""
echo "🚀 Lancement de l'application..."
echo ""

# Build and start
$DOCKER_COMPOSE_CMD build
$DOCKER_COMPOSE_CMD up -d

echo ""
echo "⏳ Attente du démarrage de l'application..."
sleep 5

# Check if container is running
if docker ps | grep -q headscale-ui; then
    echo ""
    echo "========================================="
    echo "  ✅ Installation réussie !"
    echo "========================================="
    echo ""
    echo "🌐 L'application est accessible à l'adresse :"
    echo "   http://localhost:$APP_PORT"
    echo ""
    echo "📊 Pour voir les logs :"
    echo "   docker logs -f headscale-ui"
    echo ""
    echo "🔧 Pour tester la connexion Headscale :"
    echo "   Ouvrez l'onglet 'Paramètres' dans l'interface"
    echo ""
    echo "⚠️  IMPORTANT: Protégez cette application avec Authelia/VPN !"
    echo "   Voir docs/SECURITY.md pour plus d'informations"
    echo ""
else
    echo ""
    echo "❌ Erreur lors du démarrage"
    echo ""
    echo "Vérifiez les logs :"
    echo "   docker logs headscale-ui"
    echo ""
    exit 1
fi
