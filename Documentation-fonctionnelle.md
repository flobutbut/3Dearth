# Spécifications Fonctionnelles - 3Dearth

## Règles de Mise à Jour du Document

Ce document représente les **objectifs et spécifications à atteindre** pour le projet. Il doit :
- Décrire toutes les fonctionnalités prévues, qu'elles soient implémentées ou non
- Indiquer le statut de chaque fonctionnalité [✅, 🔄, ❌]
- Être mis à jour quand de nouvelles fonctionnalités sont planifiées
- Servir de référence pour le développement futur
- Ne jamais supprimer une fonctionnalité prévue, même si elle n'est pas encore implémentée
- Distinguer clairement les fonctionnalités de simulation des données réelles

## Modes de Fonctionnement

### Mode Simulation [100% ✅]
- Génération procédurale des données via Python
  - Relief terrestre via bruit de Perlin
  - Distribution terre/mer réaliste (30/70%)
  - Élévations proportionnelles
  - Micro-reliefs et détails
- Données générées localement
  - Fichier binaire simplifié
  - Résolution 1200×600
  - Mise à jour à la demande

### Mode Données Réelles [0% ❌]
- Intégration des sources de données externes
  - ETOPO1 pour l'élévation globale
  - GPlates pour la tectonique
  - OpenWeatherMap pour la météo
  - Sources archéologiques
- Mises à jour en temps réel
  - API REST et WebSocket
  - Cache distribué
  - Synchronisation des données

## Objectifs du Projet

### Objectif Principal
Créer une visualisation 3D interactive de la Terre permettant d'explorer son évolution géologique à travers le temps, avec une représentation réaliste et proportionnelle des reliefs et des océans.

### Objectifs Spécifiques
1. **Visualisation 3D** [100% ✅]
   - Rendu réaliste du globe terrestre
   - Représentation proportionnelle des reliefs
   - Système de couleurs basé sur l'élévation réelle
   - Navigation fluide et intuitive

2. **Données Géologiques** [40% 🔄]
   - Intégration des données d'élévation
   - Visualisation des plaques tectoniques
   - Évolution temporelle des continents
   - Données climatiques historiques

3. **Interface Utilisateur** [80% ✅]
   - Contrôles orbitaux avancés
   - Frise chronologique interactive
   - Système de recherche géocodée
   - Affichage des informations contextuelles

## Cas d'Utilisation

### 1. Navigation sur le Globe
- **UC1.1** : Explorer le globe [100% ✅]
  - Zoom et rotation
  - Visualisation des reliefs
  - Observation des océans
  - Navigation intuitive

- **UC1.2** : Rechercher un lieu [0% ❌]
  - Saisir une adresse
  - Entrer des coordonnées
  - Visualiser le marqueur
  - Obtenir les informations

### 2. Exploration Temporelle
- **UC2.1** : Naviguer dans le temps [40% 🔄]
  - Utiliser la frise chronologique
  - Observer l'évolution
  - Voir les événements majeurs
  - Comprendre les changements

- **UC2.2** : Étudier une période [0% ❌]
  - Sélectionner une époque
  - Analyser les changements
  - Comparer les états
  - Obtenir des informations

### 3. Analyse des Données
- **UC3.1** : Visualiser les reliefs [100% ✅]
  - Observer les montagnes
  - Explorer les océans
  - Analyser les plaines
  - Comprendre la topographie

- **UC3.2** : Étudier le climat [0% ❌]
  - Observer les zones climatiques
  - Analyser les variations
  - Comprendre les influences
  - Visualiser les changements

## Interface Utilisateur

### 1. Vue Globe [100% ✅]
- Rendu 3D du globe
- Contrôles de navigation
- Système de couleurs
- Affichage des reliefs

### 2. Frise Chronologique [80% ✅]
- **Interface Interactive** [100% ✅]
  - Navigation temporelle libre
  - Points d'événements avec tooltips
  - Curseur de progression fluide
  - Support tactile et souris
  - Mode sombre/clair
  - Échelle de temps logarithmique

- **Synchronisation** [40% 🔄]
  - Mise à jour du globe
  - Transitions fluides
  - Événements majeurs
  - Informations contextuelles

### 3. Panneau de Recherche [0% ❌]
- Champ de recherche
- Résultats en temps réel
- Marqueur sur le globe
- Informations détaillées

### 4. Panneau d'Informations [0% ❌]
- Données contextuelles
- Statistiques
- Historique
- Aide et documentation

## Fonctionnalités Principales

### 1. Globe 3D
- **Rendu de Base** [100% ✅]
  - Géométrie sphérique haute résolution (512×512)
  - Système de couleurs basé sur l'élévation
  - Éclairage réaliste avec contre-jour
  - Gestion précise des océans

- **Contrôles de Navigation** [100% ✅]
  - Zoom in/out optimisé (5-50 unités)
  - Rotation fluide avec amortissement
  - Support tactile et souris
  - Désactivation du pan pour stabilité

- **Système de Recherche** [0% ❌]
  - Recherche par adresse
  - Recherche par coordonnées
  - Affichage du marqueur
  - Animation de caméra

### 2. Données d'Élévation 
- **Génération des Données (Mode Simulation)** [100% ✅]
  - Données générées via bruit de Perlin (4800×9600)
  - Réduction à 2400×4800 points avec interpolation cubique
  - Distribution terre/mer réaliste (30/70%)
  - Élévations proportionnelles (-11034m à +8848m)
  - Variations selon la latitude
  - Taille optimisée (44 MB)
  - Haute qualité de préservation des détails

- **Données Réelles (Mode Production)** [0% ❌]
  - Intégration ETOPO1
  - Résolution native (1 arc-minute)
  - Mises à jour périodiques
  - Validation des données

- **Application des Reliefs** [100% ✅]
  - Conversion précise des coordonnées
  - Calcul proportionnel des élévations
  - Application directe sans facteur d'échelle
  - Intégration avec le système de couleurs
  - Performance optimisée pour la haute résolution

### 3. Frise Chronologique
- **Interface Interactive** [40% 🔄]
  - Affichage des ères géologiques
  - Navigation intuitive
  - Curseur de temps
  - Échelle de temps logarithmique

- **Synchronisation** [40% 🔄]
  - Mise à jour du globe
  - Transitions fluides
  - Événements majeurs
  - Informations contextuelles

### 4. Système de Couleurs
- **Coloration Procédurale** [100% ✅]
  - Transitions douces via smoothstep
  - Interpolation HSL optimisée
  - Gestion avancée des teintes
  - Seuils d'élévation adaptés
  - Optimisation des performances
  - Zones de transition progressives :
    * Océans : bleu clair à profond
    * Plages : beige à vert clair (0-15%)
    * Plaines : vert clair à foncé (15-40%)
    * Collines : vert foncé à marron (40-70%)
    * Montagnes : marron à gris (70-85%)
    * Sommets : gris à blanc neigeux (85-100%)

- **Adaptation Environnementale** [0% ❌]
  - Influences climatiques :
    * Température par latitude (neige, glace)
    * Précipitations (végétation, déserts)
    * Biomes (variations de couleurs)
  - Influences océaniques :
    * Température des eaux
    * Circulation et productivité
    * Chimie (pH, oxygène)
  - Influences biologiques :
    * Distribution de la biomasse
    * Types d'écosystèmes
    * Production primaire
  - Influences atmosphériques :
    * Aérosols et particules
    * Albédo et luminosité
    * Protection UV (végétation)
  - Influences géochimiques :
    * Altération des roches
    * Composition des sédiments
    * Minéralogie exposée
  - Influences des événements :
    * Éruptions volcaniques
    * Périodes glaciaires
    * Anoxies océaniques

- **Adaptation Temporelle** [0% ❌]
  - Évolution des couleurs
  - Changements climatiques
  - Transitions entre époques
  - Effets visuels

## Fonctionnalités de Données Externes

### 1. Intégration GPlates [40% 🔄]
- **Visualisation des Plaques**
  - Affichage des plaques tectoniques
  - Animation des mouvements
  - Évolution temporelle
  - Interactions utilisateur

- **Données Temporelles**
  - Navigation dans le temps
  - Événements géologiques
  - Changements climatiques
  - Évolution des continents

### 2. Données Météorologiques [0% ❌]
- **Conditions Actuelles**
  - Température
  - Précipitations
  - Pression atmosphérique
  - Vents

- **Données Historiques**
  - Évolution climatique
  - Tendances
  - Records
  - Analyses

### 3. Données Archéologiques [0% ❌]
- **Sites Archéologiques**
  - Localisation
  - Période
  - Découvertes
  - Métadonnées

- **Relations**
  - Connexions entre sites
  - Chronologie
  - Cultures
  - Artéfacts

## Nouveaux Cas d'Utilisation

### 4. Analyse Géologique
- **UC4.1** : Étudier l'évolution des plaques [40% 🔄]
  - Visualiser les mouvements
  - Analyser les collisions
  - Comprendre la formation
  - Explorer les conséquences

- **UC4.2** : Explorer les événements majeurs [0% ❌]
  - Sélectionner une période
  - Voir les changements
  - Analyser les impacts
  - Comparer les époques

### 5. Étude Climatique
- **UC5.1** : Observer le climat actuel [0% ❌]
  - Voir les conditions
  - Analyser les tendances
  - Prévoir les changements
  - Comparer les régions

- **UC5.2** : Explorer l'historique climatique [0% ❌]
  - Naviguer dans le temps
  - Voir les variations
  - Analyser les cycles
  - Étudier les impacts

### 6. Recherche Archéologique
- **UC6.1** : Explorer les sites [0% ❌]
  - Localiser les sites
  - Voir les découvertes
  - Analyser les relations
  - Étudier les cultures

- **UC6.2** : Étudier les chronologies [0% ❌]
  - Naviguer dans le temps
  - Voir les évolutions
  - Analyser les influences
  - Comprendre les civilisations

## Nouveaux Panneaux d'Interface

### 5. Panneau Géologique [40% 🔄]
- Visualisation des plaques
- Contrôles temporels
- Informations détaillées
- Analyses

### 6. Panneau Climatique [0% ❌]
- Données météorologiques
- Graphiques et statistiques
- Prévisions
- Historique

### 7. Panneau Archéologique [0% ❌]
- Carte des sites
- Chronologie
- Détails des découvertes
- Relations

## Critères d'Acceptation

### Données Externes
- Temps de chargement < 3s
- Mise à jour en temps réel
- Précision des données
- Cohérence des sources

### Performance
- Temps de chargement < 2s
- 60+ FPS en navigation
- Réactivité immédiate aux contrôles
- Transitions fluides
- Gestion efficace des données d'élévation
- Calculs de relief optimisés
- Rendu haute résolution fluide

### Qualité
- Rendu réaliste et proportionnel des reliefs
- Représentation précise des élévations terrestres
- Couleurs naturelles basées sur l'élévation
- Navigation fluide et intuitive
- Interface responsive
- Précision des données géographiques
- Cohérence des visualisations

### Fonctionnalités
- Recherche précise des lieux
- Navigation temporelle fluide
- Informations contextuelles claires
- Support multi-plateformes

## Scénarios Utilisateur

### 1. Exploration de Base
1. Charger l'application
2. Naviguer sur le globe
3. Observer les reliefs
4. Explorer les océans

### 2. Recherche de Lieu
1. Ouvrir le panneau de recherche
2. Saisir une adresse
3. Sélectionner le résultat
4. Observer le marqueur

### 3. Exploration Temporelle
1. Ouvrir la frise chronologique
2. Sélectionner une époque
3. Observer les changements
4. Analyser les données

### 4. Analyse Géologique
1. Sélectionner une période
2. Visualiser les plaques
3. Analyser les mouvements
4. Étudier les impacts

### 5. Étude Climatique
1. Choisir une région
2. Voir les conditions
3. Analyser les tendances
4. Explorer l'historique

### 6. Recherche Archéologique
1. Sélectionner une période
2. Explorer les sites
3. Analyser les relations
4. Étudier les cultures

## Besoins Utilisateur

### 1. Navigation
- Contrôles intuitifs
- Performance fluide
- Support tactile
- Responsive design

### 2. Visualisation
- Reliefs réalistes
- Couleurs naturelles
- Transitions fluides
- Informations claires

### 3. Recherche
- Interface simple
- Résultats rapides
- Précision
- Informations détaillées

### 4. Timeline
- Navigation intuitive
- Échelle adaptée
- Événements majeurs
- Transitions fluides

### 5. Données Externes
- Accès rapide aux données
- Visualisation claire
- Analyses détaillées
- Export des données

### 6. Performance
- Temps de réponse rapide
- Données à jour
- Interface réactive
- Chargement optimisé

### 7. Intégration
- Cohérence des données
- Navigation fluide
- Transitions naturelles
- Interface unifiée

### Design System [40% 🔄]

#### Tokens de Design [100% ✅]
- **Couleurs**
  - Palette primaire (50-900)
  - Palette de gris (50-900)
  - Couleurs sémantiques (success, warning, error, info)
  - Support du mode sombre

- **Typographie**
  - Familles de polices (sans-serif, monospace)
  - Tailles de police (xs à 2xl)
  - Poids de police (light à bold)
  - Hauteurs de ligne

- **Espacement**
  - Échelle cohérente (0-32)
  - Unités en rem
  - Marges et paddings

- **Layout**
  - Border radius (none à full)
  - Box shadows (none à lg)
  - Z-index standardisés

#### Composants [20% 🔄]
- **Timeline** [100% ✅]
  - Navigation temporelle
  - Points d'événements
  - Tooltips
  - Support tactile
  - Mode sombre/clair

- **À Implémenter** [0% ❌]
  - Boutons et contrôles
  - Inputs et formulaires
  - Navigation
  - Cartes et panneaux
  - Modales et popovers
  - Indicateurs de chargement
  - Messages et notifications

#### Documentation [0% ❌]
- Guide de style
- Storybook
- Tests
- Exemples d'utilisation
- Guide d'implémentation

# Documentation Fonctionnelle

## Reconstruction des Plaques Tectoniques

### Vue d'ensemble

L'application permet de visualiser la reconstruction des plaques tectoniques sur les derniers 230 millions d'années. Cette fonctionnalité utilise les données de GPlates, un logiciel open-source de reconstruction tectonique.

### Sources de données

Nous utilisons deux ensembles de données principaux :

1. **SETON2012**
   - Données de rotation des plaques tectoniques
   - Période couverte : 230-0 Ma
   - Source : Seton et al. 2012
   - Qualité : Données de référence largement utilisées

2. **PLATES2013**
   - Données de rotation globales
   - Période couverte : 230-0 Ma
   - Source : PLATES Project 2013
   - Qualité : Mise à jour des données SETON2012

### Fonctionnalités actuelles

1. **Gestion des données**
   - Vérification de l'intégrité des fichiers
   - Parsing des fichiers de rotation
   - Conversion au format JSON pour l'application

2. **Visualisation** (en développement)
   - Globe 3D interactif
   - Timeline pour la sélection des époques
   - Affichage des rotations de plaques

### Utilisation prévue

1. **Navigation temporelle**
   - Sélection d'une époque via la timeline
   - Visualisation instantanée de la configuration des plaques
   - Animation possible entre différentes époques

2. **Interaction avec le globe**
   - Rotation libre de la vue
   - Zoom sur des régions spécifiques
   - Identification des plaques au clic

3. **Informations complémentaires**
   - Légende des plaques tectoniques
   - Données sur les mouvements relatifs
   - Statistiques par époque

### Limitations actuelles

1. **Données**
   - Pas de support des frontières de plaques
   - Pas de lignes de côte
   - Résolution temporelle limitée à certaines époques

2. **Visualisation**
   - Pas d'interpolation entre les époques
   - Pas de textures détaillées
   - Performances à optimiser pour les animations

### Évolutions futures

1. **Données supplémentaires**
   - Intégration des frontières de plaques
   - Ajout des lignes de côte
   - Support de données paléogéographiques

2. **Améliorations visuelles**
   - Textures géologiques
   - Effets visuels pour les zones de subduction
   - Marqueurs pour les événements géologiques majeurs

3. **Fonctionnalités avancées**
   - Export de données
   - Comparaison d'époques
   - Calculs de vitesse de déplacement

### Guide d'utilisation

1. **Démarrage**
   - Chargement initial du globe
   - Sélection de l'époque de départ
   - Orientation de la vue

2. **Navigation**
   - Utilisation de la souris pour la rotation
   - Zoom avec la molette
   - Déplacement avec le clic droit

3. **Analyse**
   - Sélection des plaques
   - Affichage des informations
   - Utilisation de la timeline

### Support

Pour toute question ou problème :
1. Consulter la documentation technique
2. Vérifier les problèmes connus
3. Contacter l'équipe de développement 