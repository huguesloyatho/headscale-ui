# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-12-11

### 🎉 Version initiale

#### Ajouté
- **Backend API complet** avec Express.js
  - Architecture provider pattern (API/Docker fallback)
  - Tous les endpoints pour Users, Nodes, API Keys, Preauth Keys, Routes, Policy
  - Onglet Settings pour configuration dynamique de l'API Headscale
  - Endpoints de debug pour développement
  - Health check pour monitoring
  - Système de storage chiffré pour les settings
  - Rate limiting et sécurité (Helmet, CORS)
  - Logging structuré avec Winston

- **Frontend moderne** en Vanilla JavaScript
  - Interface dark mode futuriste (bleu/cyan sur fond noir)
  - Navigation par onglets
  - Section Users avec création et liste
  - Section Nodes avec enregistrement et renommage
  - Section Settings avec test de connexion API
  - Tableaux avec colonnes réorganisables (drag & drop)
  - Sauvegarde de l'ordre des colonnes en localStorage
  - Design responsive (desktop/mobile)

- **Docker**
  - Dockerfile multi-stage optimisé
  - docker-compose.yml pour déploiement facile
  - docker-compose.dev.yml pour développement
  - Healthcheck intégré
  - User non-root pour sécurité

- **Documentation complète**
  - README avec quick start
  - Guide d'installation (INSTALL.md)
  - Guide de sécurité (SECURITY.md)
  - Guide de dépannage (TROUBLESHOOTING.md)
  - Cahier des charges technique
  - Description du style
  - Restrictions et bonnes pratiques
  - Script d'installation automatique (setup.sh)

#### Fonctionnalités principales

✅ **Gestion des utilisateurs**
- Créer un utilisateur
- Lister tous les utilisateurs
- Supprimer un utilisateur (backend prêt, UI à compléter)

✅ **Gestion des noeuds**
- Lister tous les noeuds avec détails complets
- Enregistrer un nouveau noeud
- Renommer un noeud
- Formatage des données (timestamps, IPs, statuts)

✅ **Gestion des API Keys**
- Lister les API keys
- Créer une API key avec expiration optionnelle
- Expirer une API key (UI à compléter)

✅ **Gestion des Preauth Keys**
- Lister les preauth keys par utilisateur
- Créer une preauth key (reusable, ephemeral)
- Expirer une preauth key (UI à compléter)

✅ **Gestion des Routes**
- Lister toutes les routes
- Approuver/désapprouver des routes (UI à compléter)

✅ **Policy**
- Visualiser la policy ACL actuelle
- Modification via CLI recommandée

✅ **Configuration dynamique**
- Onglet Settings pour configurer URL et API Key
- Test de connexion avant sauvegarde
- Stockage chiffré des credentials
- Rechargement à chaud sans redémarrage

✅ **Monitoring**
- Health check endpoint
- Endpoints de debug (dev uniquement)
- Logs structurés

#### Sécurité

⚠️ **Pas d'authentification intégrée par défaut**
- Par design : à protéger avec Authelia, VPN, ou reverse proxy
- Architecture prête pour future implémentation 2FA
- Rate limiting actif
- Headers de sécurité (Helmet)
- Chiffrement AES-256 des secrets en storage
- Validation stricte des inputs

#### Architecture technique

**Backend**
- Node.js 20 + Express.js
- Axios pour communication API Headscale
- Winston pour logging
- Crypto-JS pour chiffrement
- Structure modulaire et testable

**Frontend**
- Vanilla JavaScript (ES6 modules)
- Architecture MVC-like
- Pas de framework (léger et rapide)
- CSS pur avec design system cohérent

**Déploiement**
- Docker Alpine (image légère)
- Multi-stage build
- Healthcheck intégré
- Volumes pour persistance
- Réseau Docker isolé

#### Limitations connues

- ⚠️ Sections API Keys, Preauth, Routes, Policy : UI basique (à compléter)
- ⚠️ Pas de suppression/modification depuis l'UI pour certaines entités
- ⚠️ Fallback Docker non implémenté (architecture prête)
- ⚠️ Authentification 2FA non implémentée (architecture prête)
- ⚠️ Tests unitaires à écrire

### 📋 TODO pour v1.1.0

- [ ] Compléter les UIs des sections restantes (API Keys actions, Preauth actions, etc.)
- [ ] Ajouter actions de suppression dans les tableaux
- [ ] Implémenter les tests unitaires (backend + frontend)
- [ ] Ajouter un système de notifications/toasts
- [ ] Améliorer la gestion d'erreurs frontend
- [ ] Ajouter un loader global
- [ ] Implémenter la recherche/filtrage dans les tableaux
- [ ] Ajouter la pagination pour grandes listes
- [ ] Endpoint /metrics pour Prometheus
- [ ] Mode offline/cache pour meilleure UX

### 📋 Roadmap future

#### v1.1.0 - Complétude des fonctionnalités
- Compléter toutes les actions CRUD dans l'UI
- Tests unitaires complets
- Amélioration UX (notifications, loaders, etc.)

#### v1.2.0 - Authentification
- Implémentation de l'authentification intégrée optionnelle
- Support TOTP/2FA
- Gestion des sessions
- Système de backup codes

#### v2.0.0 - Fonctionnalités avancées
- Temps réel avec WebSocket/SSE
- Dashboard avec graphiques
- Historique des actions
- Système d'alertes
- Multi-utilisateurs avec rôles
- Mode fallback Docker (si demandé)

## Notes de migration

### v0.x (PHP) vers v1.0.0

**Changements majeurs** :
- ❌ Plus de commandes Docker exec (utilise API REST)
- ❌ Plus de parsing de sortie CLI
- ✅ Communication directe avec API Headscale
- ✅ Configuration via onglet Settings
- ✅ Meilleure gestion d'erreurs
- ✅ Performance améliorée

**Migration** :
1. Arrêter l'ancienne version
2. Générer une clé API Headscale
3. Installer la nouvelle version
4. Configurer via Settings

Aucune perte de données (Headscale stocke tout).

---

## Légende des types de changements

- **Ajouté** : nouvelles fonctionnalités
- **Modifié** : changements dans les fonctionnalités existantes
- **Déprécié** : fonctionnalités qui seront supprimées
- **Supprimé** : fonctionnalités supprimées
- **Corrigé** : corrections de bugs
- **Sécurité** : corrections de vulnérabilités
