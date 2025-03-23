# 3Dearth - Globe Terrestre Interactif

## Description
3Dearth est une application web interactive permettant de visualiser la Terre en 3D avec des données d'élévation réalistes. Le projet utilise des données topographiques pour créer une représentation fidèle du relief terrestre, incluant les montagnes et les fosses océaniques.

## Fonctionnalités
- 🌍 Rendu 3D de la Terre avec données d'élévation réelles
- 🗺️ Système de couleurs procédurales basé sur l'altitude
- 🎮 Contrôles intuitifs (zoom, rotation, panoramique)
- ⏳ Timeline pour visualiser l'évolution des continents
- 📊 Données d'élévation générées procéduralement (-5000m à +11000m)
- 🌊 Représentation réaliste des océans et continents (30/70)

## Technologies
- Vue 3 avec TypeScript
- Three.js pour le rendu 3D
- Vite comme bundler
- Pinia pour la gestion d'état
- Vitest pour les tests

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/flobutbut/3Dearth.git
cd 3Dearth
```

2. Installer les dépendances :
```bash
yarn install
```

3. Lancer le serveur de développement :
```bash
yarn dev
```

## Structure du Projet
```
src/
├── components/          # Composants Vue
│   ├── Earth/          # Globe 3D
│   └── Timeline/       # Contrôle temporel
├── services/           # Services
│   ├── elevation/      # Gestion des élévations
│   ├── color/         # Système de couleurs
│   └── geological/    # Données géologiques
└── stores/            # Stores Pinia
    └── timeline/      # État de la timeline
```

## Scripts Disponibles
- `yarn dev` : Lance le serveur de développement
- `yarn build` : Compile le projet pour la production
- `yarn test` : Lance les tests unitaires
- `yarn lint` : Vérifie le code avec ESLint
- `yarn preview` : Prévisualise la version de production

## Données d'Élévation
Les données d'élévation sont générées procéduralement avec les caractéristiques suivantes :
- Plage d'altitude : -5000m à +11000m
- Distribution terre/mer : 30%/70%
- Résolution : grille 600×1200 points
- Variations selon la latitude

## Documentation
- [Documentation Technique](Documentation-technique.md)
- [État du Projet](Documentation-status.md)

## Tests
Le projet inclut des tests unitaires pour :
- Composants (Earth, Timeline)
- Services (Elevation, Color, Geological)
- Stores (Timeline)

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contact
Florian Butour - [@flobutbut](https://github.com/flobutbut)

Lien du projet : [https://github.com/flobutbut/3Dearth](https://github.com/flobutbut/3Dearth)
