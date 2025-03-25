# Documentation Technique - 3Dearth

## Règles de Mise à Jour du Document

Ce document décrit **l'implémentation technique actuelle** du projet. Il doit :
- Ne documenter que les fonctionnalités réellement implémentées
- Être mis à jour à chaque modification technique significative
- Refléter exactement l'état du code
- Inclure tous les détails techniques nécessaires à la compréhension
- Être synchronisé avec le code source
- Ne pas mentionner les fonctionnalités prévues mais non implémentées
- Distinguer clairement l'implémentation de simulation de l'implémentation production

## État Actuel : Mode Simulation

Le projet fonctionne actuellement en mode simulation, utilisant des données générées procéduralement.

### Génération des Données
- Script : `generate_elevation_data.py`
- Technologie : Python avec numpy, scipy et noise
- Méthode : Bruit de Perlin multi-octaves
- Paramètres :
  - Dimensions initiales : 4800×9600 points
  - Dimensions finales : 2400×4800 points (réduit par 2)
  - Distribution terre/mer : 30/70%
  - Élévations : -11034m à +8848m
  - Effet de latitude : Variation progressive des élévations
- Sortie : Fichier binaire `etopo1_simplified.bin` (44 MB)

### Traitement des Données
- Génération des continents (bruit de Perlin)
  - Échelle : 800.0
  - Octaves : 20
  - Persistence : 0.6
  - Lacunarity : 2.1
- Détails du terrain
  - Échelle : 400.0
  - Octaves : 16
  - Persistence : 0.7
  - Lacunarity : 2.2
- Micro-reliefs
  - Échelle : 200.0
  - Octaves : 12
  - Persistence : 0.5
  - Lacunarity : 2.5
- Réduction de résolution
  - Méthode : scipy.ndimage.zoom
  - Facteur : 0.5
  - Ordre : 3 (interpolation cubique)
  - Préservation des détails optimisée

## Architecture Technique

### Stack Technologique
- Vue.js 3 avec Composition API
- TypeScript
- Three.js pour le rendu 3D
- WebGL
- Vite comme bundler
- Pinia pour la gestion d'état
- Yarn comme gestionnaire de paquets

### Structure du Projet
```
src/
├── components/
│   ├── Earth/           # Composant principal du globe
│   ├── Timeline/        # Composant de timeline
│   └── Controls/        # Contrôles de navigation
├── services/
│   ├── elevation/       # Service de données d'élévation
│   ├── color/          # Service de gestion des couleurs
│   └── geological/      # Service de données géologiques
├── stores/
│   ├── timeline/        # Store Pinia pour la timeline
│   └── elevation/       # Store Pinia pour les données d'élévation
└── composables/         # Composables Vue pour la réutilisation de la logique
```

## Services Implémentés

### ElevationService
Service de gestion des données d'élévation.

#### Configuration
- Format : Float32Array (binaire)
- Dimensions : 1200×2400 points (réduit de 4800×9600)
- Plage : -11034m à +8848m
- Rayon terrestre : 6 371 000m

#### Méthodes Principales
- `loadElevationData(): Promise<void>`
  * Charge les données depuis `/data/elevation/etopo1_simplified.bin`
  * Calcule les statistiques (min/max)

- `getElevationAtPoint(lat: number, lon: number): number`
  * Interpolation bilinéaire des élévations
  * Normalisation des coordonnées (-180° à 180° pour la longitude, -90° à 90° pour la latitude)

- `applyElevationToGeometry(geometry: THREE.BufferGeometry): void`
  * Application des élévations à la géométrie sphérique
  * Calcul proportionnel au rayon terrestre
  * Mise à jour des normales
  * Statistiques détaillées (min/max/moyenne)

### ColorService
Service de gestion des couleurs pour la visualisation du globe.

#### Configuration
- Niveau de la mer : 0m
- Élévation maximale : 8848m (Everest)
- Élévation minimale : -11034m (Fosse des Mariannes)
- Ligne de neige de base : 60% de l'altitude maximale
- Facteur d'influence latitudinal : 0.4

#### Méthodes Principales
- `getColorForPosition(elevation: number, latitude: number, longitude: number): THREE.Color`
  * Calcule la couleur en fonction de l'élévation et de la position
  * Gère les transitions entre les différentes zones
  * Prend en compte l'influence de la latitude

- `applyColorsToGeometry(geometry: THREE.SphereGeometry, getElevation: (lat: number, lon: number) => number): void`
  * Applique les couleurs à la géométrie du globe
  * Utilise les attributs de couleur de Three.js
  * Calcule et affiche les statistiques d'élévation

### GeologicalService
Service de gestion des données géologiques et de la dérive des continents.

#### Structure de Données
```typescript
interface PlateData {
  id: number
  name: string
  coordinates: number[][] // [latitude, longitude]
  elevation: number
}

interface GeologicalEpoch {
  time: number // millions d'années
  plates: PlateData[]
}
```

#### Méthodes Principales
- `loadEpochData(time: number): Promise<void>`
  * Charge les données pour une époque donnée
  * Gestion des erreurs et état de chargement

- `applyToGeometry(geometry: THREE.SphereGeometry, time: number): void`
  * Applique les données géologiques à la géométrie
  * TODO: Implémentation de la déformation de la géométrie

- `interpolateEpochs(time1: number, time2: number, progress: number): PlateData[]`
  * Interpole les positions des plaques entre deux époques
  * Gestion des coordonnées et élévations
  * Calcul des positions intermédiaires

## Stores Pinia

### TimelineStore
Store de gestion de la timeline géologique.

#### État
```typescript
{
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  timeRange: {
    min: -250, // Début du Permien
    max: 0     // Présent
  }
}
```

#### Fonctionnalités Implémentées
- Gestion du temps actuel
- Contrôles de lecture (play/pause)
- Ajustement de la vitesse
- Limites temporelles
- Formatage du temps

### SearchStore
Store de gestion de la recherche.

#### État
```typescript
{
  query: '',
  results: [],
  isSearching: false,
  selectedResultId: null,
  recentSearches: [],
  filters: {
    types: ['location', 'event', 'plate'],
    timeRange: {
      min: null,
      max: null
    }
  }
}
```

#### Fonctionnalités Implémentées
- Structure de base
- Système de filtrage
- Gestion de l'historique
- Interface de recherche
- Données de test

### GeologicalStore
Store de gestion des données géologiques.

#### État
```typescript
{
  plates: [],
  isLoading: false,
  selectedPlateId: null,
  visibleLayers: ['plates', 'boundaries'],
  interpolationProgress: 0,
  currentEpoch: null,
  nextEpoch: null
}
```

#### Fonctionnalités Implémentées
- Structure de base
- Système d'interpolation
- Gestion des couches
- Sélection des plaques

### SettingsStore
Store de gestion des paramètres.

#### État
```typescript
{
  visualization: {
    quality: 'medium',
    resolution: 1,
    showGrid: true,
    showLabels: true,
    showCoordinates: false
  },
  colors: {
    scheme: 'default',
    oceanOpacity: 1,
    landOpacity: 1,
    customColors: {
      ocean: '#1e4d6b',
      land: '#2d5016',
      mountains: '#4a4a4a',
      ice: '#ffffff'
    }
  },
  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    defaultPosition: { x: 0, y: 0, z: 10 },
    defaultTarget: { x: 0, y: 0, z: 0 },
    rotationSpeed: 1,
    zoomSpeed: 1,
    minDistance: 5,
    maxDistance: 20
  },
  performance: {
    enableShadows: true,
    enablePostProcessing: true,
    maxFPS: 60,
    autoQuality: true
  },
  interface: {
    language: 'fr',
    theme: 'auto',
    showTooltips: true,
    showTutorial: true
  }
}
```

#### Fonctionnalités Implémentées
- Gestion des paramètres de visualisation
- Schémas de couleurs
- Configuration de la caméra
- Options de performance
- Préférences d'interface
- Persistance locale

## Composants

### Earth.vue
Composant principal de visualisation de la Terre en 3D.

#### Configuration Three.js
- Scene : Fond noir
- Camera : Perspective (FOV 45°)
- Renderer : WebGL avec antialiasing
- Géométrie : Sphère (rayon 10, 512 segments)

#### Éclairage
- Lumière ambiante : 0x666666
- Lumière directionnelle principale : (5, 3, 5), intensité 1
- Lumière directionnelle secondaire : (-5, -3, -5), intensité 0.3

#### Contrôles
- Rotation fluide (dampingFactor 0.05)
- Zoom (vitesse 0.5, distance 5-50)
- Pan désactivé
- Rotation automatique désactivée

#### Intégration
- ElevationService pour le relief
- ColorService pour la coloration
- GeologicalService pour la dérive
- TimelineStore pour la synchronisation

### Timeline.vue
Composant de navigation temporelle.

#### Structure
- Affichage de la date (format "X Ga")
- Description de l'époque
- Barre de progression
- Points d'événements

#### Événements Majeurs
1. Formation de la Terre (4.5 Ga)
2. Premiers océans (4.0 Ga)
3. Première vie (3.5 Ga)
4. Grande oxydation (2.5 Ga)
5. Supercontinent Rodinia (1.0 Ga)
6. Explosion cambrienne (0.5 Ga)
7. Dinosaures (0.2 Ga)
8. Extinction K-T (0.065 Ga)
9. Époque moderne (0.002 Ga)

#### Fonctionnalités
- Navigation par glisser-déposer
- Support tactile
- Calcul de position temporelle
- Détection d'événements
- Transitions fluides

## Design System

### Tokens de Base
- **Couleurs**
  - Primary : #0087FF
  - Gray : #495057
  - Success : #2E7D32
  - Warning : #ED6C02
  - Error : #D32F2F
  - Info : #0288D1

- **Typographie**
  - Sans-serif : Inter, system-ui
  - Monospace : JetBrains Mono
  - Tailles : xs (12px) à 4xl (30px)

- **Espacement**
  - Base : 4px
  - Échelle : 0.5x à 8x

- **Layout**
  - Border radius : none, sm, md, lg, full
  - Box shadow : none, sm, md, lg
  - Z-index : base (0) à tooltip (80)

# Documentation Technique - GPlates Data

## Structure des Données

Les données GPlates sont organisées en deux types principaux :

### 1. Données de Rotation (Zahirovic2022)

Les données de rotation décrivent le mouvement des plaques tectoniques au fil du temps. Chaque rotation contient :

```typescript
interface Rotation {
  time: number;        // Temps en millions d'années (0 = présent)
  lat: number;         // Latitude du pôle de rotation
  lon: number;         // Longitude du pôle de rotation
  angle: number;       // Angle de rotation en degrés
  plateId1: number;    // ID de la plaque en mouvement
  plateId2: number;    // ID de la plaque de référence
  comment: string;     // Commentaire ou métadonnées
}
```

### 2. Données Géométriques (GPMLZ)

Les données géométriques sont divisées en plusieurs catégories :

#### Côtes (Coastlines)
- Types : `gpml:Basin`, `gpml:ClosedContinentalBoundary`, `gpml:IslandArc`
- 296 géométries
- Définit les contours des masses terrestres actuelles

#### Polygones Continentaux (ContinentalPolygons)
- Types : `gpml:ClosedContinentalBoundary`, `gpml:IslandArc`
- 47 géométries
- Représente les masses continentales principales

#### Zones de Fracture (FractureZones)
- Type : `gpml:UnclassifiedFeature`
- 5282 géométries
- Représente les zones de fracture océanique

#### Dorsales Éteintes (ExtinctRidges)
- Type : `gpml:UnclassifiedFeature`
- 233 géométries
- Représente les anciennes dorsales océaniques

#### Zones de Déformation (DeformationZones)
- Type : `gpml:UnclassifiedFeature`
- 852 géométries
- Représente les zones de déformation tectonique

Chaque géométrie est structurée comme suit :

```typescript
interface Geometry {
  type: string;              // Type de feature GPlates
  coordinates: number[][];   // Liste de points [longitude, latitude]
  plateId?: number;         // ID de la plaque principale
  conjugatePlateId?: number; // ID de la plaque conjuguée
  name?: string;            // Nom de la feature
}
```

## Services

### PlateRotationService

Service singleton qui gère les rotations des plaques tectoniques :

```typescript
class PlateRotationService {
  // Obtenir l'instance unique
  static getInstance(): PlateRotationService

  // Charger les données de rotation
  async loadRotations(rotations: Rotation[]): Promise<void>

  // Obtenir la plage de temps disponible
  getTimeRange(): { min: number; max: number }

  // Définir le temps actuel
  setCurrentTime(time: number): void

  // Obtenir le temps actuel
  getCurrentTime(): number

  // Obtenir la matrice de rotation pour une plaque
  getRotationMatrixForPlate(plateId: number): THREE.Matrix4
}
```

Le service effectue :
1. Le regroupement des rotations par plaque
2. Le tri des rotations par temps
3. L'interpolation entre les rotations
4. Le calcul des matrices de transformation

## Composants

### Earth.vue

Composant principal qui :
1. Affiche le globe terrestre
2. Gère les groupes de géométries :
   - `continents` : Polygones des masses continentales
   - `boundaries` : Lignes des frontières de plaques
3. Applique les rotations aux géométries via le `PlateRotationService`

Événements gérés :
- `timerange-updated` : Émis lors du chargement des données
- `time-changed` : Reçu pour mettre à jour les rotations

## Organisation des Fichiers

Les données sont organisées dans le dossier `data/gplates/` :

```
data/gplates/
├── rotations/
│   └── Zahirovic_etal_2022_OptimisedMantleRef_and_NNRMantleRef.rot
├── coastlines/
│   └── Global_EarthByte_GPlates_PresentDay_Coastlines.gpmlz
├── continents/
│   └── Global_EarthByte_GPlates_PresentDay_ContinentalPolygons.gpmlz
├── seafloor/
│   ├── FZ_cookiecut.gpmlz
│   ├── ExtinctRidges_cookiecut.gpmlz
│   └── DZ_cookiecut.gpmlz
└── parsed_data.json
```

Le fichier `parsed_data.json` contient toutes les données parsées et structurées, prêtes à être utilisées par l'application.

## Utilisation des Données

Pour utiliser ces données dans l'application :

1. Charger le fichier `parsed_data.json`
2. Les rotations peuvent être utilisées pour calculer la position des plaques à un moment donné
3. Les géométries peuvent être utilisées pour :
   - Afficher les contours des continents
   - Visualiser les zones de fracture
   - Représenter les dorsales éteintes
   - Montrer les zones de déformation

## Mise à Jour des Données

Pour mettre à jour les données :

1. Installer GPlates 2.5.0 ou supérieur
2. Copier les nouveaux fichiers dans les dossiers appropriés
3. Exécuter le script de parsing :
   ```bash
   yarn download:gplates
   ```

## Notes Importantes

- Les coordonnées sont en degrés (longitude, latitude)
- Le temps est en millions d'années, 0 représente le présent
- Les angles de rotation sont en degrés
- Les IDs de plaques sont uniques et correspondent au modèle de plaques de GPlates
- Les matrices de rotation sont calculées en utilisant THREE.js
- L'interpolation est linéaire pour la latitude, longitude et l'angle