# Images VITRINE

Ce dossier contient toutes les images utilisées par l'application VITRINE.

## Images disponibles

### 🎨 **Vitrine.png**
- **Taille** : 1,038 KB
- **Usage** : Logo principal de l'application VITRINE
- **Affichage** : Header de l'application, favicon
- **Style** : Hauteur 80px, largeur max 300px, object-fit contain

### 🎫 **SEA2.png**
- **Taille** : 1,561 KB
- **Usage** : Logo du Service Expert Audiovisuel (SEA)
- **Affichage** : Bannières d'escalade SEA, tickets
- **Style** : Largeur max 200px, border-radius 8px, ombre portée

### 💻 **SI.png**
- **Taille** : 1,921 KB
- **Usage** : Logo des Services Informatiques (SI)
- **Affichage** : Bannières de redirection pour problèmes réseau
- **Style** : Largeur max 200px, border-radius 8px, ombre portée

### 🏢 **SIM.png**
- **Taille** : 2,271 KB
- **Usage** : Logo du Service des Immeubles (SIM)
- **Affichage** : Bannières de redirection pour problèmes d'infrastructure
- **Style** : Largeur max 200px, border-radius 8px, ombre portée

## Utilisation dans le code

### HTML
```html
<!-- Logo principal -->
<img src="images/Vitrine.png" alt="Vitrine">

<!-- Logo SEA -->
<img src="images/SEA2.png" alt="Service Expert Audiovisuel UQAM">

<!-- Logo SI -->
<img src="images/SI.png" alt="Services Informatiques UQAM">

<!-- Logo SIM -->
<img src="images/SIM.png" alt="Service des Immeubles UQAM">
```

### Favicon
```html
<link rel="icon" href="images/Vitrine.png" type="image/png">
```

## Gestion des erreurs

Les images incluent une gestion d'erreur pour afficher un contenu de fallback si l'image ne peut pas être chargée :

```html
<img src="images/SEA2.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
<div class="sea-fallback-content" style="display: none;">
    <h3>ASSISTANCE TECHNIQUE</h3>
    <p>COMPOSER LE POSTE</p>
    <p>6135</p>
</div>
```

## Optimisation

- Toutes les images sont au format PNG pour une qualité optimale
- Les tailles sont optimisées pour l'affichage web
- Les styles CSS incluent des ombres et des bordures arrondies pour un rendu moderne

## Structure des fichiers

```
Annexe/VITRINE/
├── images/
│   ├── README.md
│   ├── Vitrine.png
│   ├── SEA2.png
│   ├── SI.png
│   └── SIM.png
├── css/
├── js/
└── index.html
```

## Migration depuis l'original

Ces images ont été copiées depuis `src/assets/` vers `Annexe/VITRINE/images/` pour rendre l'application VITRINE autonome et portable.

Les chemins dans le code HTML ont été mis à jour pour utiliser les chemins relatifs locaux :
- `../src/assets/` → `images/` 