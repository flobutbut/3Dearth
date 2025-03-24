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
└── stores/
    └── timeline/        # Store Pinia pour la timeline
```

## Services Techniques

### ElevationService
- Pattern Singleton
- Gestion des données d'élévation
  - Format : float32 (binaire)
  - Dimensions : 600×1200 points
  - Plage : -5000m à +11000m
- Méthodes techniques
  - `getElevationAtPoint(lat, long)`
  - `applyElevationToGeometry(geometry)`
  - `normalizeCoordinates(lat, long)`

### ColorService
- Pattern Singleton
- Système de couleurs procédurales
  - Format : HSL
  - Calcul par vertex
  - Optimisation des buffers
- Méthodes techniques
  - `getColorForPosition(elevation, lat, long)`
  - `applyColorsToGeometry(geometry)`
  - `calculateClimateZones(lat)`

### GeologicalService
- Pattern Singleton
- Gestion des données temporelles
  - Format : GeoJSON
  - Interpolation temporelle
  - Synchronisation avec le globe

## Composants Techniques

### Earth.vue
- Géométrie sphérique
  - Résolution : 128×128 segments
  - Rayon de base : 5 unités
  - Facteurs d'échelle : ±8%
- Contrôles orbitaux
  - Zoom : 7-30 unités
  - Rotation : avec amortissement
  - Pan : désactivé

### Timeline.vue
- Gestion des époques
  - Échelle logarithmique
  - Synchronisation avec le globe
  - Transitions fluides

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

### GPlates
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

### Données Météorologiques
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

### Données Archéologiques
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

### Système de Gestion des Données
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

### Services d'Intégration
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