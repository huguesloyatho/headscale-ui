# Headscale UI - Modern Dashboard

> Interface d'administration moderne pour Headscale utilisant son API REST

[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📋 Description

Headscale UI est un dashboard web moderne qui permet de gérer facilement votre instance Headscale via son API REST. Contrairement à l'ancienne version qui utilisait des commandes Docker exec, cette version communique directement avec l'API Headscale, offrant ainsi de meilleures performances, une meilleure sécurité et une expérience utilisateur améliorée.

## ✨ Fonctionnalités

- **Gestion des utilisateurs** : Créer, lister et supprimer des utilisateurs
- **Gestion des noeuds** : Enregistrer, renommer et visualiser les noeuds
- **API Keys** : Créer et gérer les clés d'API Headscale
- **Preauth Keys** : Générer des clés de pré-authentification
- **Routes** : Approuver et gérer les routes subnet
- **Policy** : Visualiser la policy ACL actuelle
- **Configuration** : Onglet Settings pour configurer la connexion API
- **Infos système** : Health check et informations de version

### 🎨 Interface

- Design dark mode moderne et futuriste
- Tableaux avec colonnes réorganisables (drag & drop)
- Responsive (desktop, tablet, mobile)
- Messages de statut en temps réel

## 🚀 Installation rapide

### Prérequis

- Docker et Docker Compose installés
- Une instance Headscale fonctionnelle
- Une clé API Headscale (générez-en une avec `headscale apikeys create`)

### Installation

1. **Cloner le projet**

```bash
git clone https://github.com/votre-repo/headscale-ui.git
cd headscale-ui
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
nano .env
```

Modifiez les valeurs suivantes:

```env
HEADSCALE_URL=http://headscale:8080
HEADSCALE_API_KEY=votre-clé-api-ici
APP_PORT=3000
```

3. **Démarrer l'application**

```bash
docker-compose up -d
```

4. **Accéder à l'interface**

Ouvrez votre navigateur à l'adresse : `http://localhost:3000`

## 📖 Documentation complète

- [Guide d'installation](docs/INSTALL.md) - Installation détaillée
- [Configuration](docs/CONFIGURATION.md) - Toutes les options de configuration
- [Développement](docs/DEVELOPMENT.md) - Guide pour les développeurs
- [API](docs/API.md) - Documentation de l'API backend
- [Sécurité](docs/SECURITY.md) - Recommandations de sécurité
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Résolution des problèmes

## 🔒 Sécurité

**⚠️ IMPORTANT : Cette application doit OBLIGATOIREMENT être protégée !**

L'application ne possède pas d'authentification intégrée par défaut. Vous **DEVEZ** la protéger avec :

- **Authelia** (recommandé)
- **VPN** (Wireguard, OpenVPN, etc.)
- **Reverse proxy avec authentification** (Traefik, Nginx, etc.)
- **Réseau privé** uniquement

**Ne JAMAIS exposer cette application sur Internet sans protection !**

## 🛠️ Architecture

```
headscale-ui/
├── backend/          # API Express.js
│   ├── src/
│   │   ├── api/      # Routes API
│   │   ├── services/ # Logique métier
│   │   ├── config/   # Configuration
│   │   └── utils/    # Utilitaires
│   └── tests/
├── frontend/         # Interface Vanilla JS
│   └── public/
│       ├── js/       # JavaScript modulaire
│       └── styles/   # CSS
├── docs/             # Documentation
└── docker-compose.yml
```

## 🐛 Debugging

### Mode développement

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Endpoints de debug (dev uniquement)

- `GET /api/debug/config` - Configuration actuelle
- `GET /api/debug/health-full` - Health check détaillé
- `POST /api/debug/test-api` - Tester un endpoint Headscale

### Logs

```bash
docker logs headscale-ui
docker logs -f headscale-ui  # Suivre en temps réel
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/api/health
```

Réponse:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-11T10:30:00.000Z",
  "version": "1.0.0",
  "headscale": {
    "connected": true,
    "url": "http://headscale:8080"
  }
}
```

## 🔄 Mise à jour

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de lire [CONTRIBUTING.md](CONTRIBUTING.md) avant de soumettre une pull request.

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Headscale](https://github.com/juanfont/headscale) - Le projet Headscale
- Tous les contributeurs

## 📧 Support

- 🐛 [Issues](https://github.com/votre-repo/headscale-ui/issues)
- 💬 [Discussions](https://github.com/votre-repo/headscale-ui/discussions)

---

Made with ❤️ for the Headscale community
