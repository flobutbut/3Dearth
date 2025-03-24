# Documentation Technique - 3Dearth

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

## Pattern Singleton

Le projet utilise le pattern Singleton pour la gestion des services. Chaque service implémente son propre pattern Singleton de manière indépendante, ce qui permet une meilleure gestion des types et une meilleure isolation des services.

Exemple d'implémentation :
```typescript
export class ServiceExample {
  private static instance: ServiceExample | null = null;

  private constructor() {
    // Initialisation du service
  }

  public static getInstance(): ServiceExample {
    if (!ServiceExample.instance) {
      ServiceExample.instance = new ServiceExample();
    }
    return ServiceExample.instance;
  }
}

// Export de l'instance unique
export const serviceExample = ServiceExample.getInstance();
export default serviceExample;
```

Les services suivants utilisent ce pattern :
- `ElevationService` : Gestion des données d'élévation
- `ColorService` : Gestion des couleurs et textures
- `GeologicalService` : Gestion des données géologiques
- `DataService` : Gestion des sources de données
- `APIService` : Gestion des requêtes externes
- `CacheService` : Gestion du cache local

### Services Utilisant le Pattern
- ElevationService
- ColorService
- GeologicalService
- DataService
- APIService
- CacheService

## Services Techniques

### ElevationService
- Pattern Singleton
- Gestion des données d'élévation
  - Format : Float32Array (binaire)
  - Dimensions : 1200×600 points
  - Plage : -4087m à +5853m
  - Rayon terrestre : 6 371 000m
- Méthodes techniques
  - `loadElevationData(): Promise<void>`
    - Charge les données depuis `/data/elevation/etopo1_simplified.bin`
    - Calcule les statistiques (min/max)
  - `getElevationAtPoint(lat: number, lon: number): number`
    - Convertit les coordonnées en indices
    - Gestion des limites de la grille
  - `applyElevationToGeometry(geometry: THREE.BufferGeometry): void`
    - Calcul précis des élévations proportionnelles
    - Application directe sans facteur d'échelle arbitraire
    - Déformation basée sur le ratio élévation/rayon terrestre
    - Mise à jour des positions des vertices

### ColorService
- Pattern Singleton
- Système de couleurs basé sur l'élévation réelle
  - Format : HSL
  - Calcul par vertex
  - Optimisation des buffers
  - Gestion des zones climatiques
- Méthodes techniques
  - `getColorForPosition(elevation: number, lat: number, lon: number): THREE.Color`
    - Océans : dégradé de bleus (-4087m à 0m)
    - Terres : vert à blanc (0m à 5853m)
  - `applyColorsToGeometry(geometry: THREE.BufferGeometry): void`
    - Application des couleurs par vertex
    - Gestion des statistiques

### GeologicalService
- Pattern Singleton
- Gestion des données temporelles
  - Format : GeoJSON
  - Interpolation temporelle
  - Synchronisation avec le globe
- Interfaces
  ```typescript
  interface PlateData {
    id: number
    name: string
    coordinates: number[][] // [latitude, longitude]
    elevation: number
  }

  interface GeologicalEpoch {
    time: number // En millions d'années
    plates: PlateData[]
  }
  ```
- Méthodes techniques
  - `loadEpochData(time: number): Promise<void>`
    - Charge les données pour une époque spécifique
    - Gestion du chargement asynchrone
    - Prévention des chargements multiples
  - `applyToGeometry(geometry: THREE.SphereGeometry, time: number): void`
    - Applique les déformations à la géométrie
    - Synchronisation avec la timeline
  - `interpolateEpochs(time1: number, time2: number, progress: number): PlateData[]`
    - Calcule l'interpolation entre deux époques
    - Interpolation linéaire des coordonnées et élévations
    - Retourne les données interpolées

## Stores Pinia

### TimelineStore
- Gestion de l'état temporel
- Synchronisation avec le globe
- Gestion des événements géologiques

### ElevationStore
- Gestion des données d'élévation
- Cache des calculs
- Mise à jour des visualisations

### GeologicalStore
- Store responsable de la gestion des données géologiques.
- État :
  - `plates` : Liste des plaques tectoniques
  - `selectedPlateId` : ID de la plaque sélectionnée
  - `visibleLayers` : Couches visibles
  - `interpolationProgress` : Progression de l'interpolation
  - `currentEpoch` et `nextEpoch` : Époques pour l'interpolation
- Actions principales :
  - `loadEpochData(time: number)`
  - `selectPlate(plateId: number)`
  - `toggleLayer(layer: string)`
  - `setInterpolationProgress(progress: number)`

### SearchStore
- Store responsable de la gestion de la recherche.
- État :
  - `query` : Requête de recherche
  - `results` : Résultats de recherche
  - `filters` : Filtres de recherche (type, période)
  - `recentSearches` : Historique des recherches
- Actions principales :
  - `search(query: string)`
  - `selectResult(resultId: string)`
  - `clearSearch()`
  - `setTimeRange(min: number, max: number)`
  - `toggleTypeFilter(type: string)`

### SettingsStore
- Store responsable de la gestion des paramètres de l'application.
- État :
  - `visualization` : Paramètres de visualisation (qualité, résolution)
  - `colors` : Paramètres de couleurs et thèmes
  - `camera` : Configuration de la caméra
  - `performance` : Paramètres de performance
  - `interface` : Paramètres d'interface (langue, thème)
- Actions principales :
  - `setQuality(quality: string)`
  - `setColorScheme(scheme: string)`
  - `setCameraDefaults()`
  - `toggleShadows(enabled: boolean)`
  - `setLanguage(language: string)`
  - `setTheme(theme: string)`

## Composants Techniques

### Earth.vue
- Géométrie sphérique
  - Résolution : 512×512 segments
  - Rayon de base : 10 unités
  - Élévations proportionnelles au rayon terrestre (6 371 000m)
  - Variations d'élévation réalistes :
    - Minimum : 9.9936 unités (-4087m)
    - Maximum : 10.0092 unités (+5853m)
- Configuration de la caméra
  - FOV : 45°
  - Near plane : 1
  - Far plane : 2000
  - Position initiale : (0, 5, 15)
- Contrôles orbitaux
  - Zoom : 5-50 unités
  - Rotation : avec amortissement (dampingFactor: 0.05)
  - Pan : désactivé
  - Vitesse de rotation : 0.5
  - Vitesse de zoom : 0.5
- Éclairage
  - Lumière ambiante : 0x666666
  - Lumière directionnelle principale : 0xffffff (intensité: 1.0)
  - Lumière de contre-jour : 0xffffff (intensité: 0.3)
- Intégration avec les services
  - ElevationService : déformation proportionnelle du terrain
  - ColorService : coloration basée sur l'élévation réelle
  - GeologicalService : déformation temporelle

### Timeline.vue
- Gestion des époques
  - Échelle logarithmique
  - Synchronisation avec le globe
  - Transitions fluides
- Intégration avec TimelineStore

## Tests Techniques

### Configuration des Tests
- Vitest pour les tests unitaires
- Vue Test Utils pour les composants
- Coverage reporting
- Tests automatisés

### Tests Unitaires
```typescript
// Exemple de test pour ElevationService
describe('ElevationService', () => {
  it('should calculate elevation correctly', () => {
    const elevation = elevationService.getElevationAtPoint(0, 0)
    expect(elevation).toBeDefined()
  })
})

// Exemple de test pour ColorService
describe('ColorService', () => {
  it('should apply colors correctly', () => {
    const color = colorService.getColorForPosition(1000, 0, 0)
    expect(color).toBeDefined()
  })
})

// Exemple de test pour GeologicalService
describe('GeologicalService', () => {
  it('should load geological data', () => {
    const data = geologicalService.loadGeologicalData()
    expect(data).toBeDefined()
  })
})
```

## Optimisations Techniques

### Performance
- Utilisation de WebGL
- Optimisation des buffers
- Chargement progressif
- Gestion de la mémoire

### Rendu 3D
- Shaders personnalisés
- LOD (Level of Detail)
- Culling des faces
- Optimisation des textures

### Données
- Format binaire optimisé
- Compression des données
- Cache des calculs
- Chargement asynchrone

## Configuration Technique

### Installation
```bash
# Installation des dépendances
yarn install

# Démarrage du serveur de développement
yarn dev

# Build de production
yarn build

# Lancement des tests
yarn test
```

### Configuration Vite
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### Configuration TypeScript
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Sécurité Technique

### Protection des Données
- Validation des entrées
- Sanitization des données
- Gestion des erreurs
- Logs techniques

### Performance
- Monitoring des FPS
- Profiling mémoire
- Optimisation des assets
- Cache management

## Intégrations de Données Externes

### GPlates (En cours de développement)
- **Format de Données**
  - GeoJSON pour les plaques tectoniques
  - CSV pour les données temporelles
  - Binaire pour les modèles 3D
- **Intégration Technique**
  - API REST pour les requêtes
  - WebSocket pour les mises à jour en temps réel
  - Cache local des données fréquentes
- **Métadonnées**
  - Version des données
  - Source et date d'acquisition
  - Précision et résolution

### Données Météorologiques (Planifié)
- **Sources**
  - OpenWeatherMap API
  - NOAA Climate Data
  - ECMWF (European Centre for Medium-Range Weather Forecasts)
- **Format**
  - JSON pour les données actuelles
  - NetCDF pour les données historiques
  - GeoTIFF pour les cartes
- **Intégration**
  - Mise à jour en temps réel
  - Historique des données
  - Projection sur le globe

### Données Archéologiques (Planifié)
- **Sources**
  - OpenContext
  - tDAR (the Digital Archaeological Record)
  - ARIADNE
- **Format**
  - GeoJSON pour les sites
  - XML pour les métadonnées
  - RDF pour les relations
- **Intégration**
  - Visualisation des sites
  - Chronologie des découvertes
  - Relations entre sites

### Système de Gestion des Données (Planifié)
- **Architecture**
  - Base de données PostgreSQL avec PostGIS
  - Cache Redis pour les données fréquentes
  - Système de versioning des données
- **APIs**
  - REST pour les requêtes standard
  - GraphQL pour les requêtes complexes
  - WebSocket pour les mises à jour
- **Sécurité**
  - Authentification OAuth2
  - Rate limiting
  - Validation des données

### Services d'Intégration (En cours de développement)
- **DataService**
  - Pattern Singleton
  - Gestion des sources de données
  - Cache et mise à jour
  - Validation des données
- **APIService**
  - Gestion des requêtes externes
  - Gestion des erreurs
  - Retry et fallback
- **CacheService**
  - Gestion du cache local
  - Invalidation intelligente
  - Compression des données 