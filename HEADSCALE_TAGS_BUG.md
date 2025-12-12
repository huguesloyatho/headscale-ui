# Bug Headscale v0.27 : Suppression des tags non persistante

## Symptômes

Lorsque vous supprimez tous les tags d'un noeud via le dashboard ou l'API Headscale :
- ✅ L'API répond avec `"forcedTags": []` (succès apparent)
- ✅ Le dashboard affiche que les tags sont supprimés
- ❌ **Après redémarrage de Headscale, les tags reviennent**

## Cause

Il s'agit d'un **bug confirmé de Headscale v0.27.x** :
- L'endpoint API `/api/v1/node/{id}/tags` avec `{"tags": []}` ne met **pas à jour la base de données SQLite**
- La suppression fonctionne uniquement en mémoire
- Au redémarrage, Headscale recharge les tags depuis la base de données

**Issues GitHub liés** :
- https://github.com/juanfont/headscale/issues/2417 - Tags tracking bug (v0.28.0 milestone)
- https://github.com/juanfont/headscale/issues/1849 - Cannot set forcedTags to empty array (résolu dans v0.23.0 mais régressé)

## Vérification du problème

```bash
# 1. Suppression via API
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags":[]}' \
  http://HEADSCALE_URL/api/v1/node/12/tags

# 2. Vérification dans la base de données
# Les tags sont TOUJOURS présents dans la DB malgré la suppression
sqlite3 /root/projet/headscale/lib/db.sqlite \
  "SELECT id, given_name, forced_tags FROM nodes WHERE id=12;"
# Output: 12|docker|["tag:ovh"]  ← Toujours présent !

# 3. Après redémarrage de Headscale
docker compose restart headscale

# 4. Les tags sont de retour
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://HEADSCALE_URL/api/v1/node/12 | jq '.node.forcedTags'
# Output: ["tag:ovh"]  ← Revenu depuis la DB
```

## Solutions de contournement

### Solution 1 : Modification directe de la base de données ⚠️

**ATTENTION** : Cette méthode modifie directement la base de données. À utiliser en dernier recours.

```bash
# 1. Arrêter Headscale
cd /root/projet/headscale
docker compose stop headscale

# 2. Sauvegarder la base de données
cp lib/db.sqlite lib/db.sqlite.backup

# 3. Modifier la base de données
sqlite3 lib/db.sqlite "UPDATE nodes SET forced_tags = '[]' WHERE id = 12;"

# Vérification
sqlite3 lib/db.sqlite "SELECT id, given_name, forced_tags FROM nodes WHERE id=12;"
# Devrait afficher: 12|docker|[]

# 4. Redémarrer Headscale
docker compose start headscale

# 5. Vérifier via l'API
curl -s -H "Authorization: Bearer YOUR_API_KEY" \
  http://192.168.1.25:3280/api/v1/node/12 | jq '.node.forcedTags'
# Devrait retourner: []
```

### Solution 2 : Modification des tags au lieu de suppression

Au lieu de supprimer tous les tags, remplacez-les par un tag "neutre" qui n'a pas de règles ACL :

```bash
# Créer un tag neutre dans votre policy
{
  "tagOwners": {
    "tag:untagged": ["group:admin"]
  },
  "acls": [
    // Aucune règle pour tag:untagged
  ]
}

# Puis assigner ce tag au noeud
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags":["tag:untagged"]}' \
  http://HEADSCALE_URL/api/v1/node/12/tags
```

Cette méthode persiste correctement car on ne supprime pas, on remplace.

### Solution 3 : Attendre la v0.28.0

Le système de tags sera refondu dans Headscale v0.28.0. Ce bug devrait être résolu.

Suivre l'avancement : https://github.com/juanfont/headscale/issues/2417

## Impact sur le dashboard

Le dashboard Headscale-UI affiche maintenant un **avertissement** lors de la suppression des tags :

```
⚠️ BUG CONNU HEADSCALE v0.27:
Les tags seront supprimés TEMPORAIREMENT mais reviendront
après le redémarrage de Headscale.
```

Cet avertissement informe l'utilisateur que la suppression n'est pas permanente.

## Recommandations

1. **Court terme** : Utilisez la Solution 2 (tag neutre) pour éviter la modification directe de la DB
2. **Moyen terme** : Planifier la migration vers Headscale v0.28.0 dès sa sortie
3. **Si urgence** : Utilisez la Solution 1 avec précaution (backup de la DB obligatoire)

## Nodes affectés dans votre installation

D'après l'analyse du 12/12/2025 :

- **Node ID 12** (`docker`, IP: 100.64.0.12) : Tag `tag:ovh` ne peut pas être supprimé de façon permanente
- **Node ID 14** (`shakas`, IP: 100.64.0.14) : Tag `tag:maison-parent` ne peut pas être supprimé de façon permanente

## Scripts utiles

### Script de suppression permanente (à exécuter sur le serveur Headscale)

```bash
#!/bin/bash
# remove-node-tags.sh
# Usage: ./remove-node-tags.sh <node_id>

NODE_ID=$1
DB_PATH="/root/projet/headscale/lib/db.sqlite"

if [ -z "$NODE_ID" ]; then
  echo "Usage: $0 <node_id>"
  exit 1
fi

echo "🛑 Arrêt de Headscale..."
cd /root/projet/headscale
docker compose stop headscale

echo "💾 Sauvegarde de la base de données..."
cp "$DB_PATH" "${DB_PATH}.backup-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Suppression des tags du noeud $NODE_ID..."
sqlite3 "$DB_PATH" "UPDATE nodes SET forced_tags = '[]' WHERE id = $NODE_ID;"

echo "✅ Vérification..."
RESULT=$(sqlite3 "$DB_PATH" "SELECT forced_tags FROM nodes WHERE id = $NODE_ID;")
echo "Tags actuels : $RESULT"

echo "🚀 Redémarrage de Headscale..."
docker compose start headscale

echo "✅ Terminé ! Vérifiez via l'API."
```

Rendez-le exécutable :
```bash
chmod +x remove-node-tags.sh
```

## Support

Pour toute question ou problème lié à ce bug :
- Dashboard Headscale-UI : https://github.com/gurucomputing/headscale-ui
- Headscale upstream : https://github.com/juanfont/headscale

---
*Document mis à jour le 12 décembre 2025*
