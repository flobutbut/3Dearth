#!/usr/bin/env python3
import numpy as np
import requests
from scipy.ndimage import zoom
from noise import pnoise2  # Pour le bruit de Perlin
import os

def generate_perlin_noise_2d(shape, scale=100.0, octaves=6, persistence=0.5, lacunarity=2.0, seed=None):
    """Génère une carte de bruit de Perlin 2D."""
    if seed is not None:
        np.random.seed(seed)
        
    height, width = shape
    
    # Normaliser les coordonnées
    y_idx = np.linspace(0, scale, height)
    x_idx = np.linspace(0, scale, width)
    x_grid, y_grid = np.meshgrid(x_idx, y_idx)
    
    # Générer le bruit de Perlin
    world = np.zeros((height, width))
    for i in range(height):
        for j in range(width):
            world[i][j] = pnoise2(x_grid[i][j]/scale,
                                y_grid[i][j]/scale,
                                octaves=octaves,
                                persistence=persistence,
                                lacunarity=lacunarity,
                                repeatx=width,
                                repeaty=height,
                                base=seed if seed is not None else 0)
    
    return world

def download_etopo1():
    """Télécharge les données ETOPO1 depuis le serveur de la NOAA."""
    url = "https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO1/data/bedrock/grid_registered/netcdf/ETOPO1_Bed_g_gmt4.grd.gz"
    print("Téléchargement des données ETOPO1...")
    
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open("ETOPO1_Bed_g_gmt4.grd.gz", "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
    else:
        raise Exception("Échec du téléchargement des données ETOPO1")

def process_elevation_data():
    """Traite les données d'élévation et crée un fichier binaire simplifié."""
    print("Traitement des données d'élévation...")
    
    # Dimensions de la grille augmentées
    height, width = 2400, 4800  # Doublé pour plus de détails
    
    # Générer le bruit de Perlin de base pour les continents
    print("Génération des continents...")
    continents = generate_perlin_noise_2d(
        (height, width),
        scale=200.0,  # Échelle augmentée pour des formations plus larges
        octaves=12,   # Plus d'octaves pour plus de détails
        persistence=0.55,  # Légèrement augmenté pour plus de variation
        lacunarity=2.2,   # Augmenté pour plus de détails fins
        seed=42
    )
    
    # Normaliser entre -1 et 1
    continents = 2.0 * (continents - continents.min()) / (continents.max() - continents.min()) - 1.0
    
    # Appliquer une fonction sigmoïde pour accentuer la séparation terre/mer
    continents = 1 / (1 + np.exp(-3 * continents))  # Augmenté à -3 pour une transition plus nette
    
    # Créer un masque pour séparer les océans des terres
    land_threshold = np.percentile(continents, 70)  # 30% de terres
    land_mask = continents > land_threshold
    
    print(f"Proportion de terres: {np.sum(land_mask) / land_mask.size * 100:.1f}%")
    
    # Normaliser les continents par rapport au seuil
    continents = (continents - continents.min()) / (continents.max() - continents.min())
    
    # Générer des détails de relief pour les continents
    print("Génération des reliefs terrestres...")
    terrain_detail = generate_perlin_noise_2d(
        (height, width),
        scale=100.0,  # Échelle réduite pour plus de détails
        octaves=8,    # Plus d'octaves
        persistence=0.65,  # Augmenté pour plus de variation
        lacunarity=2.4,   # Augmenté pour plus de détails fins
        seed=43
    )
    
    # Générer des micro-reliefs pour plus de détails
    print("Génération des micro-reliefs...")
    micro_detail = generate_perlin_noise_2d(
        (height, width),
        scale=50.0,   # Petite échelle pour les micro-reliefs
        octaves=6,
        persistence=0.45,
        lacunarity=2.8,
        seed=45
    )
    
    # Générer des détails pour le fond océanique
    print("Génération des reliefs océaniques...")
    ocean_detail = generate_perlin_noise_2d(
        (height, width),
        scale=150.0,  # Grande échelle pour les reliefs océaniques
        octaves=6,
        persistence=0.45,
        lacunarity=2.2,
        seed=44
    )
    
    # Créer la carte d'élévation finale
    elevation = np.zeros((height, width), dtype=np.float32)
    
    # Normaliser les continents pour avoir une base de calcul entre 0 et 1
    continents_normalized = (continents - land_threshold) / (1 - land_threshold)
    continents_normalized = np.clip(continents_normalized, 0, 1)
    
    # Appliquer les élévations avec micro-reliefs
    # Terres émergées : de 0m à 8848m (hauteur de l'Everest)
    elevation[land_mask] = (
        continents_normalized[land_mask] * 7000 +    # Élévation de base (0 à 7000m)
        terrain_detail[land_mask] * 1500 +          # Variation du terrain (±1500m)
        micro_detail[land_mask] * 348              # Micro-relief (±348m)
    ).astype(np.float32)
    
    # Océans : de 0m à -11034m (fosse des Mariannes)
    ocean_depth = (
        -200 +  # Profondeur minimale des plateaux continentaux
        -10334 * (land_threshold - continents[~land_mask]) / land_threshold +  # Variation de profondeur
        300 * ocean_detail[~land_mask] +  # Détails du fond océanique (±300m)
        200 * micro_detail[~land_mask]    # Micro-relief océanique (±200m)
    ).astype(np.float32)
    elevation[~land_mask] = ocean_depth
    
    # Assurer que les valeurs restent dans des limites réalistes
    elevation = np.clip(elevation, -11034, 8848)  # Limites réelles min/max de la Terre
    
    # Ajouter un effet de latitude plus nuancé
    lat = np.linspace(-90, 90, height)
    lat_factor = np.ones((height, width))
    for i in range(height):
        # Effet plus complexe basé sur la latitude
        lat_abs = abs(lat[i])
        if lat_abs < 23.5:  # Zone équatoriale
            lat_effect = 1.0
        elif lat_abs < 45:  # Zones tempérées
            lat_effect = 1.0 - 0.3 * (lat_abs - 23.5) / 21.5
        else:  # Zones polaires
            lat_effect = 0.7 - 0.2 * (lat_abs - 45) / 45
        
        lat_factor[i, :][land_mask[i, :]] = lat_effect
        lat_factor[i, :][~land_mask[i, :]] = 0.8 + 0.2 * lat_effect  # Effet atténué pour les océans
    
    elevation *= lat_factor
    
    # Réduire la résolution avec une méthode plus précise
    print("Réduction de la résolution...")
    # Utiliser une fenêtre glissante pour la réduction
    reduced_height = height // 2
    reduced_width = width // 2
    elevation_reduced = np.zeros((reduced_height, reduced_width), dtype=np.float32)
    
    for i in range(reduced_height):
        for j in range(reduced_width):
            # Moyenne pondérée des 4 points
            i2, j2 = i * 2, j * 2
            window = elevation[i2:i2+2, j2:j2+2]
            weights = np.array([[0.25, 0.25], [0.25, 0.25]])  # Poids égaux pour éviter les artefacts
            elevation_reduced[i, j] = np.sum(window * weights)
    
    # Convertir en float32
    elevation_reduced = elevation_reduced.astype(np.float32)
    
    # Sauvegarder en format binaire
    output_path = "../public/data/elevation/etopo1_simplified.bin"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    elevation_reduced.tofile(output_path)
    
    # Statistiques détaillées
    print(f"\nStatistiques des données d'élévation:")
    print(f"Dimensions originales : {height}×{width}")
    print(f"Dimensions finales : {elevation_reduced.shape}")
    print(f"Minimum: {elevation_reduced.min():.2f}m (objectif: -11034m)")
    print(f"Maximum: {elevation_reduced.max():.2f}m (objectif: 8848m)")
    print(f"Moyenne: {elevation_reduced.mean():.2f}m")
    print(f"Écart-type: {elevation_reduced.std():.2f}m")
    print(f"Points sous le niveau de la mer: {np.sum(elevation_reduced < 0)} ({np.sum(elevation_reduced < 0) / elevation_reduced.size * 100:.1f}%)")
    print(f"Points au-dessus du niveau de la mer: {np.sum(elevation_reduced > 0)} ({np.sum(elevation_reduced > 0) / elevation_reduced.size * 100:.1f}%)")
    print(f"Points > 1000m: {np.sum(elevation_reduced > 1000)} ({np.sum(elevation_reduced > 1000) / elevation_reduced.size * 100:.2f}%)")
    print(f"Points < -1000m: {np.sum(elevation_reduced < -1000)} ({np.sum(elevation_reduced < -1000) / elevation_reduced.size * 100:.2f}%)")
    
    print(f"\nFichier créé : {output_path}")
    print(f"Taille du fichier : {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    # Pour l'instant, on génère uniquement des données de test
    # TODO: Implémenter le téléchargement et le traitement des vraies données ETOPO1
    process_elevation_data()
    print("Données d'élévation générées avec succès !") 