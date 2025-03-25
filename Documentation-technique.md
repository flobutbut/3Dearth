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
- Technologie : Python avec numpy et noise
- Méthode : Bruit de Perlin multi-octaves
- Paramètres :
  - Dimensions : 2400×4800 points (réduit à 1200×600)
  - Distribution terre/mer : 30/70%
  - Élévations : -11034m à +8848m
  - Effet de latitude : Variation progressive des élévations
- Sortie : Fichier binaire `etopo1_simplified.bin`

### Traitement des Données
- Génération des continents (bruit de Perlin)
  - Échelle : 200.0
  - Octaves : 12
  - Persistence : 0.55
  - Lacunarity : 2.2
- Détails du terrain
  - Échelle : 100.0
  - Octaves : 8
  - Persistence : 0.65
  - Lacunarity : 2.4
- Micro-reliefs
  - Échelle : 50.0
  - Octaves : 6
  - Persistence : 0.45
  - Lacunarity : 2.8

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
- Dimensions : 2400×1200 points
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