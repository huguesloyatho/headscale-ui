# Changements de Policy Headscale

## Contexte

En raison du bug Headscale v0.27.x où la suppression des tags n'est pas persistante (voir [HEADSCALE_TAGS_BUG.md](HEADSCALE_TAGS_BUG.md)), nous avons décidé de simplifier la policy ACL pour **autoriser tout le trafic entre tous les noeuds** en attendant la v0.28.0.

## Policy actuelle (Permissive)

```json
{
  "groups": {
    "group:admin": [
      "h@loyatho.fr"
    ]
  },
  "tagOwners": {
    "tag:ovh": [
      "group:admin"
    ],
    "tag:maison-parent": [
      "group:admin"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:admin"
      ],
      "dst": [
        "*:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "*"
      ],
      "dst": [
        "*:*"
      ]
    }
  ]
}
```

### Explications

- **Règle 1** : `group:admin` → `*:*` - Les utilisateurs du groupe admin ont accès complet
- **Règle 2** : `*` → `*:*` - **Tous les noeuds peuvent communiquer entre eux**

Cette seconde règle rend les tags **sans effet** sur les ACL. Les noeuds peuvent toujours avoir des tags (tag:ovh, tag:maison-parent), mais ceux-ci ne limitent plus la communication.

## Policy précédente (Restrictive avec isolation)

Pour référence, voici la policy précédente qui bloquait le trafic entre les groupes :

```json
{
  "groups": {
    "group:admin": [
      "h@loyatho.fr"
    ]
  },
  "tagOwners": {
    "tag:ovh": [
      "group:admin"
    ],
    "tag:maison-parent": [
      "group:admin"
    ]
  },
  "acls": [
    {
      "action": "accept",
      "src": [
        "group:admin"
      ],
      "dst": [
        "*:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "tag:ovh"
      ],
      "dst": [
        "tag:ovh:*"
      ]
    },
    {
      "action": "accept",
      "src": [
        "tag:maison-parent"
      ],
      "dst": [
        "tag:maison-parent:*"
      ]
    }
  ]
}
```

Cette policy isolait les noeuds avec `tag:ovh` (docker - 100.64.0.12) et `tag:maison-parent` (shakas - 100.64.0.14), empêchant toute communication entre ces deux groupes.

## Migration vers Headscale v0.28.0

Lorsque Headscale v0.28.0 sortira avec le fix du bug des tags (#2417), vous pourrez :

1. **Mettre à jour Headscale** :
   ```bash
   cd /root/projet/headscale
   docker compose down
   # Modifier docker-compose.yml : image: headscale/headscale:0.28
   docker compose pull
   docker compose up -d
   ```

2. **Restaurer la policy restrictive** (si souhaité) :
   - Utilisez le dashboard Headscale-UI → onglet Policy
   - Copiez la policy restrictive ci-dessus
   - Sauvegardez

3. **Gérer les tags via le dashboard** :
   - La suppression des tags fonctionnera correctement
   - Les modifications seront persistantes après redémarrage

## Commande d'application de la policy

### ✅ Méthode recommandée : Script shell

Un script shell interactif est disponible pour gérer les policies facilement :

```bash
# Vérifier la policy actuelle
./update-headscale-policy.sh verify

# Appliquer la policy permissive (autorise tout)
./update-headscale-policy.sh permissive

# Appliquer la policy restrictive (isolation par tags)
./update-headscale-policy.sh restrictive
```

Le script est disponible dans `/tmp/update-headscale-policy.sh` et peut être copié sur le serveur.

### 📋 Méthode manuelle : Commandes curl

**IMPORTANT** : La policy doit être envoyée en tant que **STRING JSON échappée**, pas en tant qu'objet JSON.

#### Policy permissive (autorise tout) :

```bash
curl -X PUT http://192.168.1.25:3280/api/v1/policy \
  -H "Authorization: Bearer VOTRE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"policy":"{\"groups\":{\"group:admin\":[\"h@loyatho.fr\"]},\"tagOwners\":{\"tag:ovh\":[\"group:admin\"],\"tag:maison-parent\":[\"group:admin\"]},\"acls\":[{\"action\":\"accept\",\"src\":[\"group:admin\"],\"dst\":[\"*:*\"]},{\"action\":\"accept\",\"src\":[\"*\"],\"dst\":[\"*:*\"]}]}"}'
```

#### Policy restrictive (isolation par tags) :

```bash
curl -X PUT http://192.168.1.25:3280/api/v1/policy \
  -H "Authorization: Bearer VOTRE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"policy":"{\"groups\":{\"group:admin\":[\"h@loyatho.fr\"]},\"tagOwners\":{\"tag:ovh\":[\"group:admin\"],\"tag:maison-parent\":[\"group:admin\"]},\"acls\":[{\"action\":\"accept\",\"src\":[\"group:admin\"],\"dst\":[\"*:*\"]},{\"action\":\"accept\",\"src\":[\"tag:ovh\"],\"dst\":[\"tag:ovh:*\"]},{\"action\":\"accept\",\"src\":[\"tag:maison-parent\"],\"dst\":[\"tag:maison-parent:*\"]}]}"}'
```

### 🌐 Via le dashboard Headscale-UI

**Note** : Si le dashboard ne semble pas appliquer la policy, utilisez la méthode du script shell ci-dessus.

1. Connectez-vous au dashboard
2. Onglet "Policy"
3. Cliquez sur "Charger la policy actuelle"
4. Modifiez le JSON
5. Cliquez sur "Sauvegarder"

Si cela ne fonctionne pas, le problème peut venir de :
- La validation JSON côté frontend
- Un problème de formatage invisible (espaces, retours à la ligne)
- Une erreur silencieuse dans l'API

Dans ce cas, utilisez **impérativement** le script shell ou la commande curl directe.

## Impact sur la sécurité

### ⚠️ Risques de la policy permissive

- **Tous les noeuds peuvent communiquer entre eux** sans restriction
- Pas d'isolation réseau entre les différents groupes de machines
- Si un noeud est compromis, il peut potentiellement accéder à tous les autres

### ✅ Avantages temporaires

- Simplifie la gestion en attendant le fix du bug
- Élimine les problèmes de connectivité liés aux tags
- Facilite le debug et les tests réseau

### 📋 Recommandations

1. **Court terme** : Acceptable si tous les noeuds sont de confiance
2. **Moyen terme** : Planifier la migration vers v0.28.0 dès sa sortie
3. **Long terme** : Restaurer la policy restrictive avec isolation des groupes

## Vérification de la policy active

Via l'API :
```bash
curl -s -H "Authorization: Bearer VOTRE_API_KEY" \
  http://192.168.1.25:3280/api/v1/policy | jq -r '.policy' | jq '.acls'
```

Via le dashboard :
- Connectez-vous au dashboard Headscale-UI
- Onglet "Policy"
- La policy actuelle est affichée avec coloration syntaxique

---
*Document créé le 12 décembre 2025*
*Dernière mise à jour : 12 décembre 2025*
