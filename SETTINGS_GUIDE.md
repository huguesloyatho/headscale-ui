# Guide des Paramètres - Headscale UI

Ce guide explique comment utiliser l'onglet Paramètres du dashboard Headscale UI pour personnaliser votre expérience.

## 📋 Vue d'ensemble

L'onglet Paramètres est divisé en deux sections principales :

1. **Configuration Headscale** - Paramètres de connexion à votre serveur Headscale
2. **Préférences** - Personnalisation de l'interface (langue, thème, logo)

## 🔧 Configuration Headscale

### Paramètres disponibles

- **URL de Headscale** : L'adresse de votre serveur Headscale (exemple : `http://192.168.1.25:3280`)
- **Clé API** : Votre clé d'API Headscale pour l'authentification

### Actions disponibles

#### Tester la connexion

Cliquez sur **"Tester la connexion"** pour vérifier que :
- L'URL est accessible
- La clé API est valide
- Le serveur Headscale répond correctement

Le test affiche :
- ✅ État de la connexion (succès/échec)
- 📊 Nombre d'utilisateurs détectés
- ⏱️ Temps de réponse du serveur

#### Enregistrer

Cliquez sur **"Enregistrer"** pour :
- Sauvegarder les nouveaux paramètres
- Tester la connexion automatiquement
- Recharger l'application avec la nouvelle configuration

**Important** : L'application se rechargera automatiquement après 2 secondes.

## 🎨 Préférences utilisateur

### Langue

Choisissez votre langue préférée parmi :

| Langue | Code |
|--------|------|
| 🇫🇷 Français | `fr` |
| 🇬🇧 English | `en` |
| 🇪🇸 Español | `es` |
| 🇯🇵 日本語 | `ja` |
| 🇨🇳 中文 | `zh` |

**Notes** :
- La langue est appliquée à toute l'interface
- Le changement prend effet après rechargement de la page
- La langue est sauvegardée dans votre navigateur (localStorage)

### Thème

Choisissez votre thème préféré :

#### 🌑 Sombre (Dark)
- **Fond** : Noir/bleu foncé
- **Texte** : Blanc cassé
- **Utilisation** : Idéal pour travailler la nuit, moins fatiguant pour les yeux
- **Style** : Moderne, professionnel

#### ☀️ Clair (Light)
- **Fond** : Blanc/gris très clair
- **Texte** : Noir/gris foncé
- **Utilisation** : Idéal en journée, dans des environnements lumineux
- **Style** : Classique, professionnel

#### 🌿 Écolo (Green)
- **Fond** : Vert foncé/terre
- **Texte** : Blanc cassé naturel
- **Accents** : Vert vif écologique
- **Utilisation** : Pour les amoureux de la nature
- **Style** : Original, apaisant

**Notes** :
- Le thème est appliqué immédiatement après sauvegarde
- Tous les composants de l'interface s'adaptent automatiquement
- Le thème est persistant (sauvegardé dans localStorage)

### Logo personnalisé

Personnalisez le logo affiché en haut de la page.

#### Télécharger un logo

1. Cliquez sur **"Télécharger un logo"**
2. Sélectionnez une image depuis votre ordinateur
3. Le logo s'affiche immédiatement dans la zone de prévisualisation
4. Cliquez sur **"Enregistrer"** pour sauvegarder

**Formats acceptés** :
- PNG, JPG, JPEG, GIF, SVG, WebP
- Tous les formats d'image standards

**Limitations** :
- Taille maximale : **1 MB**
- Dimensions recommandées : 120x40 pixels (ratio 3:1)
- L'image sera redimensionnée automatiquement pour s'adapter

#### Supprimer le logo

1. Cliquez sur **"Supprimer le logo"** (bouton rouge)
2. Le logo est supprimé de la prévisualisation
3. Cliquez sur **"Enregistrer"** pour confirmer

#### Exemple de logo personnalisé

```
┌─────────────────────────────────┐
│  🏢 Mon Entreprise              │  ← Votre logo ici
│  Dashboard Headscale            │
└─────────────────────────────────┘
```

Le logo est affiché :
- En haut à gauche de la page
- Avec le texte "Headscale UI" à côté
- De manière responsiv e (s'adapte aux petits écrans)

## 💾 Sauvegarde des préférences

### Où sont stockées les préférences ?

Les préférences sont stockées à **deux endroits** :

1. **Serveur (backend)** : Fichier `/storage/settings.json`
   - Configuration Headscale (URL, API Key cryptée)
   - Préférences utilisateur (langue, thème, logo en base64)
   - Persistant entre les redémarrages du serveur

2. **Navigateur (localStorage)** :
   - Langue courante
   - Thème courant
   - Logo personnalisé (copie)
   - Pour application immédiate sans rechargement

### Sécurité

- ✅ La clé API est **cryptée** avec AES-256 avant sauvegarde
- ✅ Le logo est stocké en base64 (pas de fichier uploadé sur le serveur)
- ✅ Les préférences sont validées côté backend
- ⚠️ Le fichier `storage/settings.json` contient des données sensibles (API Key cryptée)

## 🔄 Appliquer les changements

Après avoir modifié vos préférences :

1. Cliquez sur **"Enregistrer"**
2. Les changements sont sauvegardés sur le serveur
3. Le thème et le logo sont appliqués **immédiatement**
4. La page se recharge automatiquement après 1.5 secondes
5. Tous les textes sont traduits dans la nouvelle langue

**Note** : Le rechargement est nécessaire pour appliquer la langue à tous les éléments de l'interface.

## 🐛 Dépannage

### Le thème ne s'applique pas

**Problème** : Le thème reste sur "Sombre" même après avoir sélectionné "Clair"

**Solution** :
1. Vérifiez que vous avez cliqué sur "Enregistrer"
2. Attendez le rechargement automatique de la page
3. Si le problème persiste, videz le cache du navigateur (Ctrl+Shift+R)

### Le logo ne s'affiche pas

**Problème** : Le logo personnalisé n'apparaît pas après sauvegarde

**Solutions** :
1. Vérifiez que l'image fait moins de 1 MB
2. Vérifiez le format de l'image (PNG, JPG recommandés)
3. Rechargez la page (F5)
4. Vérifiez les logs du backend :
   ```bash
   docker logs headscale-ui -f
   ```

### La langue ne change pas

**Problème** : L'interface reste en français après avoir sélectionné une autre langue

**Solution** :
1. Attendez le rechargement automatique de la page
2. Videz le cache si nécessaire
3. Vérifiez que la langue est bien sélectionnée dans le menu déroulant

### Erreur "Logo too large"

**Problème** : Message d'erreur lors de l'upload du logo

**Solution** :
1. Réduisez la taille du fichier image
2. Utilisez un outil de compression d'image en ligne
3. Recommandé : Utilisez un format optimisé comme WebP ou PNG optimisé

## 📊 Détails techniques

### API Backend

Les préférences utilisent l'endpoint :

```http
PUT /api/settings/preferences
Content-Type: application/json

{
  "language": "fr|en|es|ja|zh",
  "theme": "dark|light|green",
  "customLogo": "data:image/png;base64,..." ou null
}
```

**Validation** :
- Langue : doit être dans la liste `['fr', 'en', 'es', 'ja', 'zh']`
- Thème : doit être dans la liste `['dark', 'light', 'green']`
- Logo : doit commencer par `data:image/` et faire moins de 1 MB

### Fichiers impliqués

| Fichier | Description |
|---------|-------------|
| `frontend/public/js/i18n.js` | Système de traduction multilingue |
| `frontend/public/js/themes.js` | Gestion des thèmes et du logo |
| `frontend/public/styles/themes.css` | Définition des thèmes CSS |
| `backend/src/storage/index.js` | Stockage des préférences |
| `backend/src/api/settings.js` | Route API des préférences |

### Variables CSS des thèmes

Chaque thème définit des variables CSS pour une cohérence visuelle :

```css
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  --accent-primary: #3b82f6;
  ...
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  --accent-primary: #3b82f6;
  ...
}

[data-theme="green"] {
  --bg-primary: #1a2e1a;
  --text-primary: #f0f7f0;
  --accent-primary: #22c55e;
  ...
}
```

## 🎯 Cas d'usage

### Scénario 1 : Configuration initiale

1. Accédez à l'onglet **Paramètres**
2. Entrez l'URL de votre serveur Headscale
3. Entrez votre clé API
4. Cliquez sur **"Tester la connexion"**
5. Si le test réussit, cliquez sur **"Enregistrer"**

### Scénario 2 : Personnalisation complète

1. Choisissez votre langue préférée
2. Choisissez votre thème (par exemple : Clair pour le jour)
3. Uploadez le logo de votre entreprise
4. Cliquez sur **"Enregistrer"**
5. L'interface se recharge avec vos préférences

### Scénario 3 : Changement de thème selon l'heure

**Matin/Après-midi** :
- Thème : ☀️ Clair
- Meilleur confort visuel en environnement lumineux

**Soirée/Nuit** :
- Thème : 🌑 Sombre
- Moins de fatigue oculaire

**Changement rapide** :
1. Onglet Paramètres
2. Sélectionnez le nouveau thème
3. Enregistrer
4. Le thème change immédiatement !

## 📚 Voir aussi

- [README.md](README.md) - Documentation générale du projet
- [POLICY_MANAGEMENT.md](POLICY_MANAGEMENT.md) - Gestion des policies
- [HEADSCALE_TAGS_BUG.md](HEADSCALE_TAGS_BUG.md) - Bug des tags Headscale v0.27

---

*Dernière mise à jour : 12 décembre 2025*
*Version : 1.0.0*
