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

### 2. Frise Chronologique [40% 🔄]
- Navigation temporelle
- Affichage des ères
- Curseur de temps
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
  - Données générées via bruit de Perlin (1200×600)
  - Distribution terre/mer réaliste (30/70%)
  - Élévations proportionnelles (-11034m à +8848m)
  - Variations selon la latitude

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
  - Adaptation climatique [0% ❌] :
    * Variation des teintes selon la latitude
    * Ajustement des couleurs selon le climat
    * Transitions naturelles entre zones climatiques
    * Influence des saisons sur la végétation
    * Représentation des zones de glace polaires

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