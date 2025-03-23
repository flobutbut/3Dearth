import * as THREE from 'three'

export class ColorService {
  private static instance: ColorService
  private readonly seaLevel: number = 0
  private readonly maxElevation: number = 8848 // Hauteur de l'Everest
  private readonly minElevation: number = -11034 // Fosse des Mariannes

  private constructor() {}

  public static getInstance(): ColorService {
    if (!ColorService.instance) {
      ColorService.instance = new ColorService()
    }
    return ColorService.instance
  }

  /**
   * Calcule la couleur en fonction de l'altitude et de la position
   * @param elevation Altitude en mètres
   * @param latitude Latitude en degrés (-90 à 90)
   * @param longitude Longitude en degrés (-180 à 180)
   * @returns Couleur THREE.js
   */
  public getColorForPosition(elevation: number, latitude: number, longitude: number): THREE.Color {
    // Normalisation de l'élévation entre -1 et 1 par rapport au rayon
    const normalizedElevation = elevation < 0 
      ? elevation / Math.abs(this.minElevation)
      : elevation / this.maxElevation

    if (elevation <= this.seaLevel) {
      // Océans : dégradé de bleus pour les profondeurs
      const depthFactor = Math.abs(normalizedElevation)
      return new THREE.Color().setHSL(
        0.6 + (0.1 * depthFactor), // teinte bleue qui varie avec la profondeur
        0.9, // saturation élevée pour des bleus plus profonds
        0.4 - (0.3 * depthFactor) // luminosité qui diminue avec la profondeur
      )
    } else {
      // Terres émergées
      const heightFactor = normalizedElevation
      
      if (heightFactor < 0.1) {
        // Plages et zones côtières : beige clair
        return new THREE.Color().setHSL(0.1, 0.3, 0.7)
      } else if (heightFactor < 0.3) {
        // Plaines basses : vert
        const t = (heightFactor - 0.1) / 0.2
        return new THREE.Color().setHSL(
          0.3, // teinte verte
          0.7, // saturation élevée pour un vert vif
          0.4 - (0.1 * t) // assombrissement progressif
        )
      } else if (heightFactor < 0.6) {
        // Collines et montagnes moyennes : vert foncé à marron
        const t = (heightFactor - 0.3) / 0.3
        return new THREE.Color().setHSL(
          0.3 - (0.25 * t), // transition de vert à marron
          0.7 - (0.2 * t),
          0.3 + (0.1 * t)
        )
      } else if (heightFactor < 0.8) {
        // Hautes montagnes : marron à gris
        const t = (heightFactor - 0.6) / 0.2
        return new THREE.Color().setHSL(
          0.05,
          0.5 - (0.3 * t),
          0.4 + (0.2 * t)
        )
      } else {
        // Sommets : gris à blanc (neiges éternelles)
        const t = (heightFactor - 0.8) / 0.2
        return new THREE.Color().setHSL(
          0.05,
          0.2 - (0.2 * t),
          0.6 + (0.4 * t)
        )
      }
    }
  }

  /**
   * Applique les couleurs à la géométrie en fonction de l'élévation
   * @param geometry Géométrie de la sphère
   * @param elevationData Données d'élévation
   */
  public applyColorsToGeometry(geometry: THREE.SphereGeometry, getElevation: (lat: number, lon: number) => number): void {
    const positions = geometry.attributes.position.array
    const colors = new Float32Array(positions.length)

    // Création de l'attribut de couleur s'il n'existe pas
    if (!geometry.attributes.color) {
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }

    // Statistiques pour cette application
    let minElevation = Infinity
    let maxElevation = -Infinity

    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      vertex.normalize()
      
      // Calcul de la latitude et longitude
      const latitude = Math.asin(vertex.y) * 180 / Math.PI
      const longitude = Math.atan2(vertex.x, vertex.z) * 180 / Math.PI
      
      // Obtention de l'élévation
      const elevation = getElevation(latitude, longitude)
      minElevation = Math.min(minElevation, elevation)
      maxElevation = Math.max(maxElevation, elevation)
      
      // Calcul de la couleur
      const color = this.getColorForPosition(elevation, latitude, longitude)
      
      // Application de la couleur
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
    }

    console.log('Statistiques des couleurs:')
    console.log(`Élévation min: ${minElevation}m`)
    console.log(`Élévation max: ${maxElevation}m`)

    geometry.attributes.color.needsUpdate = true
  }
}

export default ColorService.getInstance() 