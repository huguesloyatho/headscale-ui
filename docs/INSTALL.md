# Guide d'installation - Headscale UI

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation avec Docker](#installation-avec-docker)
3. [Installation manuelle](#installation-manuelle)
4. [Configuration initiale](#configuration-initiale)
5. [Vérification](#vérification)
6. [Intégration avec Headscale](#intégration-avec-headscale)

## Prérequis

### Obligatoires

- **Docker** version 20.10 ou supérieure
- **Docker Compose** version 2.0 ou supérieure
- **Headscale** déjà installé et fonctionnel
- **Clé API Headscale** (voir ci-dessous)

### Recommandés

- **Reverse proxy** (Traefik, Nginx, Caddy)
- **Authelia** ou système d'authentification similaire
- **Réseau Docker** partagé avec Headscale

## Génération de la clé API Headscale

Si vous n'avez pas encore de clé API :

```bash
# Si Headscale tourne dans Docker
docker exec headscale headscale apikeys create

# Si Headscale est installé localement
headscale apikeys create
```

**Copiez immédiatement la clé générée**, vous ne pourrez plus la voir !

## Installation avec Docker

### Méthode 1 : Réseau Docker existant (recommandé)

Si Headscale tourne déjà dans Docker :

1. **Vérifier le réseau de Headscale**

```bash
docker network ls
docker inspect headscale | grep NetworkMode
```

2. **Cloner le projet**

```bash
git clone https://github.com/votre-repo/headscale-ui.git
cd headscale-ui
```

3. **Configurer .env**

```bash
cp .env.example .env
nano .env
```

Modifier les valeurs :

```env
HEADSCALE_URL=http://headscale:8080
HEADSCALE_API_KEY=votre-clé-générée
APP_PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

4. **Adapter docker-compose.yml**

Vérifier que le réseau correspond :

```yaml
networks:
  headscale-network:
    external: true
    # Remplacez par le nom de votre réseau Headscale
```

5. **Démarrer**

```bash
docker-compose up -d
```

### Méthode 2 : URL externe

Si Headscale est accessible via une URL :

1. **Configurer .env**

```env
HEADSCALE_URL=http://192.168.1.100:8080
# ou
HEADSCALE_URL=https://headscale.votredomaine.com
HEADSCALE_API_KEY=votre-clé
```

2. **Adapter docker-compose.yml**

Commentez ou retirez la section networks :

```yaml
# networks:
#   headscale-network:
#     external: true
```

3. **Démarrer**

```bash
docker-compose up -d
```

## Installation manuelle

Pour développement ou tests locaux :

### Backend

```bash
cd backend
npm install
cp ../.env.example ../.env
# Éditer .env avec vos valeurs
npm start
```

Le backend démarre sur `http://localhost:3000`

### Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

Le frontend dev server démarre sur `http://localhost:5173`

## Configuration initiale

### 1. Premier accès

Ouvrez `http://localhost:3000` (ou votre URL configurée)

### 2. Onglet Paramètres

Cliquez sur l'onglet **Paramètres** et :

1. Vérifiez l'URL Headscale
2. Entrez votre clé API
3. Cliquez sur **Tester la connexion**
4. Si le test réussit, cliquez sur **Enregistrer**

### 3. Vérification

L'onglet **Infos** devrait afficher :
- Status: healthy
- Headscale connected: true

## Intégration avec Headscale

### Exemple : Headscale + Headscale UI

Fichier `docker-compose.yml` complet :

```yaml
version: '3.8'

services:
  headscale:
    image: headscale/headscale:latest
    container_name: headscale
    volumes:
      - ./headscale/config:/etc/headscale
      - ./headscale/data:/var/lib/headscale
    ports:
      - "8080:8080"
      - "9090:9090"
    command: headscale serve
    restart: unless-stopped
    networks:
      - headscale-network

  headscale-ui:
    build: ./headscale-ui
    container_name: headscale-ui
    ports:
      - "3000:3000"
    environment:
      - HEADSCALE_URL=http://headscale:8080
      - HEADSCALE_API_KEY=${HEADSCALE_API_KEY}
    env_file:
      - .env
    depends_on:
      - headscale
    restart: unless-stopped
    networks:
      - headscale-network

networks:
  headscale-network:
    driver: bridge
```

## Protection avec Authelia

### Exemple de configuration Traefik + Authelia

`docker-compose.yml` avec Authelia :

```yaml
services:
  headscale-ui:
    # ... votre config ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.headscale-ui.rule=Host(`headscale-ui.votredomaine.com`)"
      - "traefik.http.routers.headscale-ui.entrypoints=https"
      - "traefik.http.routers.headscale-ui.tls=true"
      - "traefik.http.routers.headscale-ui.middlewares=authelia@docker"
```

## Vérification

### Health Check

```bash
curl http://localhost:3000/api/health
```

Réponse attendue :

```json
{
  "status": "healthy",
  "headscale": {
    "connected": true
  }
}
```

### Logs

```bash
docker logs headscale-ui
```

Vous devriez voir :

```
Server started { port: 3000, env: 'production', headscaleUrl: 'http://headscale:8080' }
```

### Accès web

Ouvrez `http://localhost:3000` et vérifiez que :
- L'interface se charge
- Les onglets sont cliquables
- L'onglet Users affiche vos utilisateurs

## Problèmes courants

### "Connection failed"

**Cause** : L'UI ne peut pas joindre Headscale

**Solutions** :
1. Vérifier que Headscale fonctionne : `curl http://headscale:8080/health`
2. Vérifier le réseau Docker : `docker network inspect headscale-network`
3. Vérifier l'URL dans .env
4. Regarder les logs : `docker logs headscale-ui`

### "Unauthorized" / "Invalid API key"

**Cause** : Clé API incorrecte ou expirée

**Solutions** :
1. Générer une nouvelle clé : `headscale apikeys create`
2. Mettre à jour .env
3. Redémarrer : `docker-compose restart headscale-ui`
4. Ou utiliser l'onglet Paramètres pour tester la nouvelle clé

### "Cannot connect to Docker daemon"

**Cause** : Vous avez activé DOCKER_FALLBACK_ENABLED (non recommandé)

**Solution** :
1. Désactivez le fallback : `DOCKER_FALLBACK_ENABLED=false`
2. Utilisez l'API REST uniquement

## Prochaines étapes

- [Configuration avancée](CONFIGURATION.md)
- [Sécurisation](SECURITY.md)
- [Guide de développement](DEVELOPMENT.md)
