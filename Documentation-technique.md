# Documentation Technique - Projet Terre 3D Interactive

## Vue d'ensemble
Ce projet vise à créer une représentation 3D interactive de la Terre avec des données d'élévation réelles et une timeline permettant de visualiser l'évolution des continents au fil du temps géologique.

## Technologies utilisées
- Vue 3
- TypeScript
- Three.js pour le rendu 3D
- WebGL
- Vite comme bundler
- Pinia pour la gestion d'état

## Architecture du projet
### Phase 1 - Modèle 3D de base et données d'élévation
- Implémentation du globe 3D avec Three.js
  - Utilisation d'une géométrie sphérique haute résolution (128x128 segments)
  - Système de contrôles orbitaux pour la navigation
    - Zoom in/out avec limites (distance 7-30)
    - Rotation fluide avec amortissement
    - Désactivation du déplacement latéral
    - Support tactile et souris
  - Gestion du redimensionnement dynamique
- Intégration des données d'élévation ETOPO1
  - Service singleton pour la gestion des données d'élévation
  - Chargement asynchrone des données binaires
  - Conversion des coordonnées géographiques en indices de tableau
- Système de rendu des reliefs
  - Couleurs procédurales basées sur :
    - Altitude (du bleu profond au blanc)
    - Latitude (zones climatiques)
    - Type de terrain
  - Calcul dynamique des normales pour l'éclairage
  - Mise à jour en temps réel des couleurs

### Phase 2 - Intégration des océans
- Rendu des océans par couleurs procédurales
  - Dégradé de bleus selon la profondeur
  - Effets d'éclairage adaptés
- Animation des transitions de profondeur

### Phase 3 - Timeline interactive
- Intégration des données géologiques
- Système de timeline avec vue-slider-component
- Animation des transitions entre les époques
- Mise à jour dynamique des couleurs selon l'époque

## Sources de données
- Données d'élévation : NASA SRTM, ETOPO1
- Données géologiques : GPlates

## Structure des composants
```
src/
├── components/
│   ├── Earth/           # Composants liés au globe
│   ├── Timeline/        # Composants de la timeline
│   └── Controls/        # Contrôles de navigation
├── services/
│   ├── elevation/       # Service de gestion des données d'élévation
│   ├── color/          # Service de gestion des couleurs
│   └── geological/      # Service de gestion des données géologiques
└── stores/
    └── timeline/        # Store Pinia pour la gestion de la timeline
```

## Installation et configuration
1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   yarn install
   ```
3. Lancer le serveur de développement :
   ```bash
   yarn dev
   ```

## Ressources nécessaires
1. Données d'élévation :
   - etopo1_simplified.bin (données ETOPO1 prétraitées)

## Points techniques importants
- Système de couleurs procédurales
  - Calcul en temps réel des couleurs
  - Transitions fluides entre les états
  - Performance optimisée
- Optimisation des performances de rendu 3D
  - Utilisation de géométries optimisées
  - Gestion efficace de la mémoire pour les données d'élévation
- Système de chargement progressif des données
  - Chargement asynchrone des ressources
  - Gestion des états de chargement
- Interpolation des données géologiques pour les transitions fluides
  - À implémenter dans la phase 3
- Contrôles utilisateur
  - Zoom avec limites configurables
  - Rotation avec amortissement pour fluidité
  - Support multi-plateformes (tactile/souris)

## Prochaines étapes
1. Optimisation du système de couleurs
   - Ajout de shaders personnalisés
   - Amélioration des transitions
2. Développement de la timeline
   - Interface utilisateur
   - Gestion des données temporelles
3. Optimisations
   - Amélioration des performances
   - Réduction de la consommation mémoire 

## Génération des données d'élévation (Temporaire)
Le script `generate_elevation_data.py` utilise plusieurs couches de bruit de Perlin pour créer des données d'élévation réalistes :

1. Génération des continents
   - Échelle large (150.0) avec 8 octaves pour des formes continentales détaillées
   - Fonction sigmoïde pour accentuer la séparation terre/mer
   - Seuil ajusté pour obtenir 30% de terres émergées

2. Génération des reliefs terrestres
   - Échelle moyenne (75.0) avec 6 octaves
   - Élévation de base : 500m
   - Variation maximale : jusqu'à 5949m
   - Effet de latitude : -30% aux pôles

3. Génération des reliefs océaniques
   - Grande échelle (100.0) avec 4 octaves
   - Profondeur moyenne : -3500m
   - Variations de profondeur : jusqu'à -9385m
   - Effet de latitude : -10% aux pôles

Le fichier résultant (`etopo1_simplified.bin`) est une grille de 600x1200 points en format float32, optimisée pour le chargement et le rendu dans Three.js. 

## Calcul des élévations
Le système de calcul et d'application des élévations se fait en deux étapes principales :

### 1. Génération des données d'élévation
Les données sont générées par le script `generate_elevation_data.py` :
- Plage d'élévation réaliste : -5000m à +11000m
- Distribution terre/mer : ~30%/70%
- Résolution : grille 600×1200 points
- Format : float32 (binaire)
- Variations selon la latitude :
  - Terres : -40% aux pôles
  - Océans : -20% aux pôles

### 2. Application à la géométrie 3D
La méthode `applyElevationToGeometry` du service d'élévation :
- Rayon de base : 5 unités (niveau de la mer, élévation 0m)
- Facteurs d'échelle :
  - Montagnes : jusqu'à +8% du rayon pour +11000m
  - Océans : jusqu'à -4% du rayon pour -5000m
- Pour chaque vertex :
  1. Calcul latitude/longitude depuis les coordonnées 3D
  2. Obtention de l'élévation
  3. Calcul du facteur d'échelle :
     ```
     Si élévation > 0 (terres) :
       scale = 1.0 + (elevation / 11000) * 0.08
     Si élévation < 0 (océans) :
       scale = 1.0 - (|elevation| / 5000) * 0.04
     ```
  4. Application au rayon : vertex *= (rayon * scale)

Cette approche assure :
- Une représentation réaliste des reliefs terrestres
- Une cohérence avec les standards géographiques
- Une transition fluide au niveau de la mer (scale = 1.0)
- Des déformations proportionnelles aux élévations réelles

### Exemples de calcul
1. Pour une montagne de 5500m :
   - scale = 1.0 + (5500/11000) * 0.08 = 1.04
   - rayon effectif = 5 * 1.04 = 5.2 unités

2. Pour un océan de -2500m :
   - scale = 1.0 - (2500/5000) * 0.04 = 0.98
   - rayon effectif = 5 * 0.98 = 4.9 unités

## Système de Couleurs
Le système de coloration procédurale se fait en deux étapes principales :

### 1. Calcul des couleurs selon la position
La méthode `getColorForPosition` du service de couleurs :
- Entrées : 
  - Élévation en mètres
  - Latitude (-90° à 90°)
  - Longitude (-180° à 180°)
- Normalisation de l'élévation entre -1 et 1
- Calcul des couleurs selon l'altitude :
  - Océans (élévation ≤ 0) :
    - Dégradé de bleus selon la profondeur
    - Teinte : 0.6-0.7 (bleu)
    - Saturation : 0.9 (profond)
    - Luminosité : 0.1-0.4 (plus sombre avec la profondeur)
  - Terres émergées :
    - Plages (0-10%) : beige clair
    - Plaines (10-30%) : vert vif
    - Collines (30-60%) : vert foncé à marron
    - Montagnes (60-80%) : marron à gris
    - Sommets (80-100%) : gris à blanc

### 2. Application à la géométrie 3D
La méthode `applyColorsToGeometry` :
- Pour chaque vertex :
  1. Calcul latitude/longitude depuis les coordonnées 3D
  2. Obtention de l'élévation via callback
  3. Calcul de la couleur selon la position
  4. Application à l'attribut de couleur du vertex
- Mise à jour des statistiques min/max
- Actualisation des buffers de couleur

Cette approche permet :
- Une représentation intuitive des différents types de terrain
- Des transitions fluides entre les zones d'élévation
- Une adaptation aux variations de latitude
- Une optimisation des performances via les attributs de géométrie 