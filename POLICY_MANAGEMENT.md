# Gestion des Policies Headscale

Ce document explique comment gérer les ACL policies dans Headscale via le dashboard ou en ligne de commande.

## ⚠️ Problème connu avec le dashboard

Si vous constatez que **la modification de la policy via le dashboard ne s'applique pas**, c'est un problème connu. Symptômes :
- Pas d'erreur affichée
- Message "Policy sauvegardée avec succès"
- Mais la policy n'est pas réellement appliquée sur Headscale

### Cause probable

Le dashboard envoie correctement la requête, mais il peut y avoir :
1. Un problème de validation JSON silencieux
2. Un formatage invisible (espaces, retours à la ligne)
3. Une erreur de conversion entre l'objet JS et la string JSON

## ✅ Solution recommandée : Script shell

Utilisez le script shell fourni qui utilise la méthode qui fonctionne à coup sûr.

### Installation

Le script est déjà installé sur votre serveur :
```bash
ssh root@192.168.1.25
cd /root
./update-headscale-policy.sh verify
```

### Utilisation

```bash
# Vérifier la policy actuelle
./update-headscale-policy.sh verify

# Appliquer la policy permissive (autorise tout)
./update-headscale-policy.sh permissive

# Appliquer la policy restrictive (isolation par tags)
./update-headscale-policy.sh restrictive
```

Documentation complète : `/root/UPDATE_POLICY_README.md` sur le serveur

## 📋 Méthode manuelle : curl

Si vous préférez curl directement :

### Vérifier la policy actuelle
```bash
curl -s -H "Authorization: Bearer VOTRE_API_KEY" \
  http://192.168.1.25:3280/api/v1/policy | jq -r '.policy' | jq '.'
```

### Appliquer une policy

**IMPORTANT** : La policy doit être envoyée en tant que **STRING JSON échappée** dans le champ `policy`.

```bash
# Exemple : Policy permissive
curl -X PUT http://192.168.1.25:3280/api/v1/policy \
  -H "Authorization: Bearer VOTRE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"policy":"{\"groups\":{\"group:admin\":[\"h@loyatho.fr\"]},\"tagOwners\":{\"tag:ovh\":[\"group:admin\"],\"tag:maison-parent\":[\"group:admin\"]},\"acls\":[{\"action\":\"accept\",\"src\":[\"group:admin\"],\"dst\":[\"*:*\"]},{\"action\":\"accept\",\"src\":[\"*\"],\"dst\":[\"*:*\"]}]}"}'
```

## 🔧 Debugging du dashboard

Si vous souhaitez débugger pourquoi le dashboard ne fonctionne pas :

### 1. Vérifier les logs du dashboard

```bash
# Sur le serveur du dashboard
docker logs headscale-ui -f
```

Recherchez des erreurs lors de la sauvegarde de la policy.

### 2. Vérifier la requête HTTP

Ouvrez les DevTools du navigateur (F12) → onglet Network, puis :
1. Cliquez sur "Sauvegarder" dans l'onglet Policy
2. Cherchez la requête `PUT /api/policy`
3. Vérifiez le payload envoyé dans l'onglet "Payload" ou "Request"

**Payload attendu** :
```json
{
  "policy": "{\"groups\":{...},\"acls\":[...]}"
}
```

**Note** : `policy` doit être une **string**, pas un objet JSON.

### 3. Vérifier la réponse de l'API

Dans l'onglet "Response" de la même requête, vérifiez :
- Code HTTP : doit être `200`
- Body : doit contenir `{"success": true, ...}`

Si le code est `400` ou `500`, il y a une erreur côté serveur.

### 4. Tester directement l'API du dashboard

```bash
# Depuis votre machine locale
curl -X PUT http://DASHBOARD_URL:3000/api/policy \
  -H "Content-Type: application/json" \
  -d '{"policy":"{\"groups\":{\"group:admin\":[\"h@loyatho.fr\"]},\"acls\":[{\"action\":\"accept\",\"src\":[\"*\"],\"dst\":[\"*:*\"]}]}"}'
```

## 📝 Format de policy attendu par Headscale

L'API Headscale v1 attend :

```json
{
  "policy": "<JSON_ESCAPÉ_EN_STRING>"
}
```

**Exemple concret** :

Si votre policy JSON est :
```json
{
  "groups": {
    "group:admin": ["h@loyatho.fr"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ]
}
```

Vous devez l'envoyer comme :
```json
{
  "policy": "{\"groups\":{\"group:admin\":[\"h@loyatho.fr\"]},\"acls\":[{\"action\":\"accept\",\"src\":[\"*\"],\"dst\":[\"*:*\"]}]}"
}
```

## Code du dashboard concerné

### Frontend
- [frontend/public/js/api.js:167-172](/Volumes/Crucial/developpement/headscale-ui/frontend/public/js/api.js#L167-L172) - Appel API setPolicy
- [frontend/public/js/main.js:1708-1759](/Volumes/Crucial/developpement/headscale-ui/frontend/public/js/main.js#L1708-L1759) - Handler de sauvegarde

### Backend
- [backend/src/api/policy.js:38-68](/Volumes/Crucial/developpement/headscale-ui/backend/src/api/policy.js#L38-L68) - Route PUT /api/policy
- [backend/src/services/headscale/providers/api.provider.js:166-169](/Volumes/Crucial/developpement/headscale-ui/backend/src/services/headscale/providers/api.provider.js#L166-L169) - Appel à l'API Headscale

Le code semble correct, le problème pourrait venir de :
- La validation JSON dans le frontend qui rejette silencieusement
- Un problème de sérialisation de la string
- Un timeout ou erreur réseau non catchée

## 🐛 Si le dashboard ne fonctionne toujours pas

En attendant un fix du dashboard, utilisez **uniquement** le script shell ou les commandes curl pour modifier les policies.

Le dashboard reste utile pour :
- ✅ Visualiser les noeuds, routes, users, API keys
- ✅ **Consulter** la policy actuelle (lecture)
- ✅ Gérer les tags (avec les limitations du bug Headscale v0.27)

Pour la **modification** de policy :
- ❌ Dashboard (problématique)
- ✅ Script shell `/root/update-headscale-policy.sh`
- ✅ Commandes curl directes

## 📚 Voir aussi

- [POLICY_CHANGES.md](POLICY_CHANGES.md) - Historique des changements de policy
- [HEADSCALE_TAGS_BUG.md](HEADSCALE_TAGS_BUG.md) - Bug des tags Headscale v0.27
- `/root/UPDATE_POLICY_README.md` (sur le serveur) - Documentation du script

---
*Dernière mise à jour : 12 décembre 2025*
