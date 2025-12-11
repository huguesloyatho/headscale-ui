# Guide de sécurité - Headscale UI

## ⚠️ AVERTISSEMENT CRITIQUE

**Cette application donne un accès complet à votre infrastructure Headscale.**

**NE JAMAIS exposer cette application sur Internet sans protection appropriée !**

## 🔒 Authentification obligatoire

### État actuel

Par défaut, l'application **N'A PAS** d'authentification intégrée. C'est un choix délibéré car :

1. L'ajout d'une couche d'auth locale peut créer un faux sentiment de sécurité
2. Les solutions d'authentification professionnelles (Authelia, Keycloak, etc.) sont plus robustes
3. L'intégration SSO est préférable dans un environnement professionnel

### Solutions recommandées

#### Option 1 : Authelia (Recommandé)

Authelia est une solution d'authentification et d'autorisation open-source.

**Avantages** :
- 2FA intégré (TOTP)
- Gestion des sessions
- Support OIDC
- Intégration facile avec Traefik/Nginx

**Exemple de configuration** :

```yaml
# docker-compose.yml
services:
  authelia:
    image: authelia/authelia:latest
    container_name: authelia
    volumes:
      - ./authelia:/config
    networks:
      - headscale-network

  headscale-ui:
    # ... votre config ...
    labels:
      - "traefik.http.routers.headscale-ui.middlewares=authelia@docker"
```

**Configuration Authelia** (`authelia/configuration.yml`) :

```yaml
access_control:
  default_policy: deny
  rules:
    - domain: headscale-ui.votredomaine.com
      policy: two_factor
```

#### Option 2 : VPN uniquement

Accès uniquement via votre VPN Headscale/Tailscale.

**Configuration** :

```yaml
# docker-compose.yml
services:
  headscale-ui:
    # Ne pas exposer de port public
    # ports:
    #   - "3000:3000"  # NE PAS FAIRE ÇA
    networks:
      - headscale-network  # Réseau interne uniquement
```

Accédez via l'IP interne de votre réseau VPN.

#### Option 3 : Reverse proxy avec auth

**Nginx avec auth_basic** :

```nginx
server {
    listen 443 ssl;
    server_name headscale-ui.votredomaine.com;

    auth_basic "Accès restreint";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://headscale-ui:3000;
    }
}
```

**Traefik avec BasicAuth** :

```yaml
labels:
  - "traefik.http.routers.headscale-ui.middlewares=auth"
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$..."
```

## 🔐 Sécurisation des secrets

### API Key Headscale

**Stockage** :
- ❌ JAMAIS en clair dans le code
- ❌ JAMAIS dans git (utilisez .gitignore)
- ✅ Uniquement dans .env (avec permissions 600)
- ✅ Chiffrée dans storage/settings.json (chiffrement AES-256)

**Rotation** :

Changez régulièrement votre clé API :

```bash
# 1. Générer nouvelle clé
docker exec headscale headscale apikeys create

# 2. Mettre à jour via l'onglet Paramètres ou .env

# 3. Expirer l'ancienne clé
docker exec headscale headscale apikeys expire --prefix <ancien-prefix>
```

### SESSION_SECRET et JWT_SECRET

Pour la future authentification intégrée :

**Génération de secrets forts** :

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Ou
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Dans .env** :

```env
SESSION_SECRET=<généré-ci-dessus>
JWT_SECRET=<un-autre-secret-différent>
```

## 🛡️ Protection réseau

### Pare-feu

**UFW (Ubuntu/Debian)** :

```bash
# Autoriser seulement depuis votre IP
sudo ufw allow from 192.168.1.0/24 to any port 3000

# Ou depuis votre VPN
sudo ufw allow from 100.64.0.0/10 to any port 3000
```

**iptables** :

```bash
# Bloquer tout par défaut
iptables -A INPUT -p tcp --dport 3000 -j DROP

# Autoriser depuis VPN
iptables -I INPUT -s 100.64.0.0/10 -p tcp --dport 3000 -j ACCEPT
```

### Docker network isolation

```yaml
services:
  headscale-ui:
    # Pas de ports exposés sur l'hôte si accès VPN uniquement
    expose:
      - "3000"  # Expose DANS le réseau Docker uniquement
    # ports:
    #   - "3000:3000"  # N'expose PAS sur l'hôte
```

## 🔒 HTTPS obligatoire

### Avec Traefik

```yaml
services:
  headscale-ui:
    labels:
      - "traefik.http.routers.headscale-ui.tls=true"
      - "traefik.http.routers.headscale-ui.tls.certresolver=letsencrypt"
```

### Avec Nginx

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.3;
    ssl_prefer_server_ciphers off;
}
```

### Avec Caddy (le plus simple)

```
headscale-ui.votredomaine.com {
    reverse_proxy headscale-ui:3000
}
```

Caddy gère automatiquement Let's Encrypt !

## 📊 Monitoring et alertes

### Logging

**Activer les logs structurés** :

```env
LOG_LEVEL=info
NODE_ENV=production
```

**Surveiller les logs** :

```bash
# Logs en temps réel
docker logs -f headscale-ui | grep ERROR

# Filtrer les accès non autorisés
docker logs headscale-ui | grep "401\|403"
```

### Alerting

Configurer des alertes pour :
- Tentatives d'accès échouées répétées
- Modifications de la configuration
- Erreurs API
- Health check failed

Exemple avec Prometheus + Grafana (à implémenter) :
- Endpoint `/metrics` (à ajouter)
- Alertmanager pour notifications

## 🚨 Incident Response

### En cas de compromission

1. **Isoler immédiatement**

```bash
docker stop headscale-ui
```

2. **Révoquer les accès**

```bash
# Expirer TOUTES les clés API
docker exec headscale headscale apikeys list
docker exec headscale headscale apikeys expire --prefix <chaque-prefix>
```

3. **Analyser les logs**

```bash
docker logs headscale-ui > incident-$(date +%Y%m%d).log
```

4. **Changer tous les secrets**

```bash
# Nouveau SESSION_SECRET
openssl rand -base64 32

# Nouvelle API key
docker exec headscale headscale apikeys create
```

5. **Redémarrer proprement**

```bash
docker-compose down
docker-compose up -d
```

## ✅ Checklist de sécurité

Avant la mise en production :

- [ ] Authentification externe configurée (Authelia/VPN/etc.)
- [ ] HTTPS activé avec certificat valide
- [ ] Secrets changés (SESSION_SECRET, JWT_SECRET)
- [ ] .env non commité (vérifier .gitignore)
- [ ] API Key Headscale unique et sécurisée
- [ ] Pare-feu configuré
- [ ] Logs activés et surveillés
- [ ] Backups configurés
- [ ] Health checks en place
- [ ] Rate limiting activé
- [ ] Headers de sécurité (Helmet.js actif)
- [ ] CORS configuré strictement
- [ ] Accès Docker socket désactivé (DOCKER_FALLBACK_ENABLED=false)
- [ ] Documentation de sécurité lue par l'équipe
- [ ] Plan de réponse aux incidents défini

## 🔄 Maintenance de sécurité

### Mises à jour régulières

```bash
# Mettre à jour l'application
git pull
docker-compose build --no-cache
docker-compose up -d

# Mettre à jour les dépendances
cd backend && npm audit fix
cd frontend && npm audit fix
```

### Rotation des secrets

- **API Key** : tous les 90 jours
- **SESSION_SECRET** : lors de changements d'équipe
- **Certificats SSL** : automatique avec Let's Encrypt

### Audits

- **Mensuel** : Vérifier les logs d'accès
- **Trimestriel** : Audit de sécurité complet
- **Annuel** : Pentest si environnement critique

## 📚 Références

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Headscale Security](https://headscale.net/security/)

---

**La sécurité n'est jamais optionnelle. Prenez le temps de bien configurer votre installation.**
