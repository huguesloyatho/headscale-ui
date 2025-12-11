# 🚀 Quick Start - Headscale UI

## Installation en 5 minutes

### Prérequis

- Docker + Docker Compose installés
- Headscale fonctionnel
- Clé API Headscale (commande ci-dessous)

### Étape 1 : Générer une clé API

```bash
docker exec headscale headscale apikeys create
```

**Copiez la clé affichée !**

### Étape 2 : Installation automatique

```bash
# Cloner le projet
git clone https://github.com/huguesloyatho/headscale-ui.git
cd headscale-ui

# Lancer l'installation automatique
./setup.sh
```

Le script vous demandera :
- URL de Headscale (ex: `http://headscale:8080`)
- Votre clé API
- Port de l'application (défaut: `3000`)

### Étape 3 : Accéder à l'interface

Ouvrez votre navigateur : **http://localhost:3000**

### Étape 4 : Vérifier la connexion

1. Cliquez sur l'onglet **Paramètres**
2. Cliquez sur **Tester la connexion**
3. Si ça fonctionne, vous êtes prêt !

---

## Installation manuelle (alternative)

```bash
# 1. Cloner
git clone https://github.com/votre-repo/headscale-ui.git
cd headscale-ui

# 2. Configurer
cp .env.example .env
nano .env

# 3. Éditer .env
HEADSCALE_URL=http://headscale:8080
HEADSCALE_API_KEY=votre-clé-api

# 4. Démarrer
docker-compose up -d

# 5. Vérifier
docker logs headscale-ui
```

---

## ⚠️ IMPORTANT - Sécurité

**Cette application n'a pas d'authentification !**

Vous **DEVEZ** la protéger avec :
- **Authelia** (recommandé)
- **VPN** (Headscale/Tailscale)
- **Reverse proxy avec auth**

**Ne JAMAIS exposer sur Internet sans protection !**

Voir [docs/SECURITY.md](docs/SECURITY.md) pour les détails.

---

## 🔧 Commandes utiles

### Logs
```bash
docker logs -f headscale-ui
```

### Redémarrer
```bash
docker-compose restart headscale-ui
```

### Arrêter
```bash
docker-compose down
```

### Mettre à jour
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 Problèmes ?

### L'application ne démarre pas

```bash
# Vérifier les logs
docker logs headscale-ui

# Vérifier .env
cat .env
```

### Connexion à Headscale échoue

```bash
# Tester depuis le container
docker exec headscale-ui curl http://headscale:8080/health

# Vérifier le réseau
docker network inspect headscale-network
```

### Interface blanche

```bash
# Reconstruire
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Vider le cache navigateur
Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
```

Plus de solutions : [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 📚 Documentation complète

- [Installation détaillée](docs/INSTALL.md)
- [Configuration](docs/CONFIGURATION.md)
- [Sécurité](docs/SECURITY.md)
- [Dépannage](docs/TROUBLESHOOTING.md)
- [Développement](docs/DEVELOPMENT.md)

---

## 🎯 Fonctionnalités disponibles

### ✅ Implémenté
- ✅ Gestion des utilisateurs (créer, lister)
- ✅ Gestion des noeuds (enregistrer, renommer, lister)
- ✅ Visualisation API Keys
- ✅ Visualisation Preauth Keys
- ✅ Visualisation Routes
- ✅ Visualisation Policy
- ✅ Configuration dynamique (onglet Settings)
- ✅ Health check / monitoring
- ✅ Tableaux avec colonnes réorganisables

### 🚧 À compléter (v1.1)
- 🚧 Actions de suppression dans l'UI
- 🚧 Création/expiration API/Preauth keys depuis l'UI
- 🚧 Approbation de routes depuis l'UI
- 🚧 Recherche et filtres
- 🚧 Pagination

---

## 🤝 Besoin d'aide ?

- 📖 Lire la [documentation complète](README.md)
- 🐛 Ouvrir une [issue GitHub](https://github.com/huguesloyatho/headscale-ui/issues)
- 💬 Rejoindre les [discussions](https://github.com/huguesloyatho/headscale-ui/discussions)

---

**Temps total d'installation : ~5 minutes ⚡**

Enjoy! 🎉
