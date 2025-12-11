# Guide de dépannage - Headscale UI

## Problèmes courants et solutions

### 1. L'application ne démarre pas

#### Symptômes
```bash
docker-compose up -d
# Erreur ou container qui redémarre en boucle
```

#### Solutions

**Vérifier les logs**
```bash
docker logs headscale-ui
```

**Problème : Variable d'environnement manquante**

Erreur :
```
Missing required environment variable: HEADSCALE_URL
```

Solution :
```bash
# Vérifier que .env existe
ls -la .env

# Vérifier le contenu
cat .env

# Copier depuis l'exemple si nécessaire
cp .env.example .env
nano .env
```

**Problème : Port déjà utilisé**

Erreur :
```
Error starting userland proxy: listen tcp 0.0.0.0:3000: bind: address already in use
```

Solution :
```bash
# Trouver le processus qui utilise le port
sudo lsof -i :3000

# Changer le port dans .env
APP_PORT=3001

# Ou arrêter l'autre service
```

### 2. Connexion à Headscale échoue

#### Symptômes
- Health check : `status: "unhealthy"`
- Onglet Settings : "Connection failed"
- Logs : `Connection refused` ou `ECONNREFUSED`

#### Diagnostic

```bash
# 1. Vérifier que Headscale fonctionne
docker ps | grep headscale

# 2. Tester l'API Headscale directement
curl http://headscale:8080/health

# 3. Vérifier le réseau Docker
docker network inspect headscale-network

# 4. Vérifier que les deux containers sont sur le même réseau
docker inspect headscale-ui | grep NetworkMode
docker inspect headscale | grep NetworkMode
```

#### Solutions

**Si Headscale n'est pas accessible**

```bash
# Vérifier l'URL dans .env
HEADSCALE_URL=http://headscale:8080  # Nom du container
# OU
HEADSCALE_URL=http://192.168.1.100:8080  # IP directe
```

**Si les containers ne sont pas sur le même réseau**

Modifier `docker-compose.yml` :

```yaml
services:
  headscale-ui:
    networks:
      - headscale-network  # Doit correspondre au réseau de Headscale

networks:
  headscale-network:
    external: true  # Si le réseau existe déjà
```

Redémarrer :
```bash
docker-compose down
docker-compose up -d
```

### 3. Erreur "Unauthorized" ou "Invalid API key"

#### Symptômes
- Toutes les requêtes API retournent 401
- Message : "Unauthorized" ou "Invalid API key"

#### Solutions

**Vérifier la clé API**

```bash
# Lister les clés API existantes
docker exec headscale headscale apikeys list

# Créer une nouvelle clé
docker exec headscale headscale apikeys create

# Mettre à jour .env
nano .env
# HEADSCALE_API_KEY=nouvelle-clé-ici

# Redémarrer
docker-compose restart headscale-ui
```

**Ou utiliser l'onglet Settings**

1. Aller dans Settings
2. Entrer la nouvelle clé
3. Tester la connexion
4. Enregistrer

### 4. Interface blanche ou erreur JavaScript

#### Symptômes
- Page blanche
- Console navigateur : erreurs JavaScript
- Fichiers JS/CSS non chargés

#### Solutions

**Vérifier les logs du serveur**

```bash
docker logs headscale-ui | grep ERROR
```

**Vider le cache du navigateur**

1. Chrome/Firefox : `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)
2. Ou mode privé/incognito

**Reconstruire l'image**

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 5. Tableaux ne s'affichent pas

#### Symptômes
- Section Users/Nodes vide alors qu'il y a des données
- Message "Aucun utilisateur" alors qu'il y en a

#### Solutions

**Vérifier la structure des données API**

Ouvrir la console du navigateur (F12) et regarder les requêtes :

```javascript
// Dans l'onglet Network, regarder la réponse de /api/users
{
  "success": true,
  "data": {
    "users": [...]  // ou "data": [...] ?
  }
}
```

Si la structure ne correspond pas, il y a peut-être une incompatibilité de version Headscale.

**Workaround** : Utiliser les endpoints de debug

```bash
curl http://localhost:3000/api/debug/test-api \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"endpoint": "/api/v1/user", "method": "GET"}'
```

### 6. Drag & drop des colonnes ne fonctionne pas

#### Symptômes
- Impossible de réorganiser les colonnes du tableau

#### Solutions

**Vérifier localStorage**

Ouvrir la console (F12) :

```javascript
// Voir les clés sauvegardées
Object.keys(localStorage)

// Réinitialiser l'ordre des colonnes
localStorage.removeItem('hs_column_order_users')
localStorage.removeItem('hs_column_order_nodes')
```

**Vider tout le localStorage**

```javascript
localStorage.clear()
// Puis recharger la page
```

### 7. Rate limiting : "Too many requests"

#### Symptômes
- Message : "Too many requests"
- Blocage temporaire après plusieurs actions

#### Solutions

**Attendre la fin de la fenêtre**

Par défaut : 100 requêtes par 15 minutes

**Augmenter les limites**

Dans `.env` :

```env
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW=15
```

Redémarrer :
```bash
docker-compose restart headscale-ui
```

### 8. Problèmes de performance

#### Symptômes
- Application lente
- Timeouts
- Délais importants pour charger les données

#### Solutions

**Vérifier les ressources Docker**

```bash
docker stats headscale-ui
```

**Augmenter les ressources**

Dans `docker-compose.yml` :

```yaml
services:
  headscale-ui:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**Activer la compression**

La compression est déjà activée, mais vérifier les logs :

```bash
docker logs headscale-ui | grep compression
```

### 9. Erreurs SSL/TLS

#### Symptômes
- `UNABLE_TO_VERIFY_LEAF_SIGNATURE`
- `CERT_HAS_EXPIRED`
- `SELF_SIGNED_CERT_IN_CHAIN`

#### Solutions

**Si Headscale utilise un certificat auto-signé**

⚠️ **Non recommandé en production**, mais pour le dev :

Dans `backend/src/services/headscale/client.js`, vous pouvez temporairement :

```javascript
// À UTILISER UNIQUEMENT EN DEV
const axios = require('axios');
const https = require('https');

this.client = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false  // ⚠️ DEV ONLY
  })
});
```

**Meilleure solution** : Utiliser un certificat valide (Let's Encrypt).

### 10. Docker healthcheck échoue

#### Symptômes
```bash
docker ps
# Status: unhealthy
```

#### Solutions

**Tester manuellement**

```bash
docker exec headscale-ui curl -f http://localhost:3000/api/health
```

**Vérifier les logs**

```bash
docker logs headscale-ui | tail -50
```

**Désactiver temporairement**

Dans `docker-compose.yml` :

```yaml
services:
  headscale-ui:
    healthcheck:
      disable: true
```

## Commandes de diagnostic utiles

### Logs détaillés

```bash
# Tous les logs
docker logs headscale-ui

# Dernières 100 lignes
docker logs --tail 100 headscale-ui

# Suivi en temps réel
docker logs -f headscale-ui

# Avec timestamps
docker logs -t headscale-ui
```

### Inspection du container

```bash
# Configuration complète
docker inspect headscale-ui

# Variables d'environnement
docker exec headscale-ui env

# Fichiers dans le container
docker exec headscale-ui ls -la /app

# Tester depuis le container
docker exec headscale-ui curl http://headscale:8080/health
```

### Réseau Docker

```bash
# Lister les réseaux
docker network ls

# Inspecter un réseau
docker network inspect headscale-network

# Voir quels containers sont connectés
docker network inspect headscale-network | grep Name
```

### Tests API

```bash
# Health check
curl http://localhost:3000/api/health

# Liste des users
curl http://localhost:3000/api/users

# Settings
curl http://localhost:3000/api/settings

# Debug config (dev uniquement)
curl http://localhost:3000/api/debug/config
```

## Mode debug

### Activer le mode debug

Dans `.env` :

```env
NODE_ENV=development
LOG_LEVEL=debug
```

Redémarrer :

```bash
docker-compose restart headscale-ui
```

### Endpoints de debug

Accessibles uniquement en `NODE_ENV=development` :

```bash
# Configuration actuelle (secrets masqués)
curl http://localhost:3000/api/debug/config

# Health check détaillé
curl http://localhost:3000/api/debug/health-full

# Tester un endpoint Headscale
curl -X POST http://localhost:3000/api/debug/test-api \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/v1/user",
    "method": "GET"
  }'
```

## Réinitialisation complète

En dernier recours :

```bash
# 1. Arrêter tout
docker-compose down

# 2. Supprimer les volumes (⚠️ perte des settings)
rm -rf storage/

# 3. Nettoyer Docker
docker system prune

# 4. Reconstruire
docker-compose build --no-cache

# 5. Redémarrer
docker-compose up -d

# 6. Reconfigurer via l'onglet Settings
```

## Obtenir de l'aide

Si le problème persiste :

1. **Collecter les informations**
   ```bash
   # Logs
   docker logs headscale-ui > logs.txt

   # Configuration (masquer les secrets!)
   docker inspect headscale-ui > inspect.txt

   # Version
   docker exec headscale-ui node --version
   ```

2. **Ouvrir une issue GitHub**
   - [Créer une issue](https://github.com/huguesloyatho/headscale-ui/issues/new)
   - Joindre les logs (sans secrets!)
   - Décrire les étapes pour reproduire

3. **Forum/Discord**
   - Communauté Headscale
   - Discussions du projet

---

**Astuce** : La plupart des problèmes sont liés à la configuration réseau ou aux variables d'environnement. Vérifiez toujours ces éléments en premier !
