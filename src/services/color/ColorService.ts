import * as THREE from 'three'

export class ColorService {
  private static instance: ColorService | null = null
  private readonly seaLevel: number = 0
  private readonly maxElevation: number = 8848 // Hauteur de l'Everest
  private readonly minElevation: number = -11034 // Fosse des Mariannes
  private readonly snowLineBase: number = 0.6 // Seuil de base pour la neige (60% de l'altitude max)
  private readonly snowLineLatitudeFactor: number = 0.4 // Influence de la latitude sur la ligne de neige

  private constructor() {}

  public static getInstance(): ColorService {
    if (!ColorService.instance) {
      ColorService.instance = new ColorService()
    }
    return ColorService.instance
  }

  /**
   * Fonction de lissage pour les transitions de couleurs
   */
  private smoothstep(edge0: number, edge1: number, x: number): number {
    // Limiter x entre 0 et 1
    x = Math.max(0, Math.min((x - edge0) / (edge1 - edge0), 1))
    // Fonction de lissage
    return x * x * (3 - 2 * x)
  }

  /**
   * Interpolation linéaire entre deux couleurs HSL
   */
  private lerpHSL(h1: number, s1: number, l1: number, h2: number, s2: number, l2: number, t: number): THREE.Color {
    // Gestion de la transition circulaire pour la teinte
    let h: number
    if (Math.abs(h2 - h1) > 0.5) {
      if (h2 > h1) h1 += 1
      else h2 += 1
    }
    h = h1 + (h2 - h1) * t
    h = ((h % 1) + 1) % 1 // Normaliser entre 0 et 1

    return new THREE.Color().setHSL(
      h,
      s1 + (s2 - s1) * t,
      l1 + (l2 - l1) * t
    )
  }

  /**
   * Calcule le seuil de neige en fonction de la latitude
   * Plus on s'éloigne de l'équateur, plus la neige apparaît bas
   */
  private getSnowLineThreshold(latitude: number): number {
    const latitudeEffect = Math.abs(latitude) / 90 // 0 à l'équateur, 1 aux pôles
    return this.snowLineBase - (this.snowLineLatitudeFactor * latitudeEffect)
  }

  /**
   * Calcule la couleur en fonction de l'altitude et de la position
   * @param elevation Altitude en mètres
   * @param latitude Latitude en degrés (-90 à 90)
   * @param longitude Longitude en degrés (-180 à 180)
   * @returns Couleur THREE.js
   */
  public getColorForPosition(elevation: number, latitude: number, longitude: number): THREE.Color {
    // Normalisation de l'élévation entre -1 et 1
    const normalizedElevation = elevation < 0 
      ? elevation / Math.abs(this.minElevation)
      : elevation / this.maxElevation

    if (elevation <= this.seaLevel) {
      // Océans : transitions plus douces pour les profondeurs
      const depthFactor = Math.abs(normalizedElevation)
      const t = this.smoothstep(0, 1, depthFactor)
      
      // Transition de bleu clair à bleu profond
      return this.lerpHSL(
        0.6, 0.65, 0.5,  // Bleu clair pour les eaux peu profondes
        0.63, 0.9, 0.2,  // Bleu foncé pour les abysses
        t
      )
    } else {
      // Terres émergées : transitions plus progressives
      const heightFactor = normalizedElevation
      const snowLine = this.getSnowLineThreshold(latitude)
      
      if (heightFactor < 0.05) {
        // Plages et zones côtières : transition rapide vers les plaines
        const t = this.smoothstep(0, 0.05, heightFactor)
        return this.lerpHSL(
          0.12, 0.4, 0.75,   // Beige plus prononcé pour les plages
          0.25, 0.65, 0.45,  // Vert plus marqué pour le début des terres
          t
        )
      } else if (heightFactor < 0.4) {
        // Plaines et collines basses
        const t = this.smoothstep(0.05, 0.4, heightFactor)
        return this.lerpHSL(
          0.25, 0.65, 0.45,  // Vert plus marqué
          0.35, 0.7, 0.35,   // Vert plus foncé
          t
        )
      } else if (heightFactor < snowLine) {
        // Collines et montagnes moyennes
        const t = this.smoothstep(0.4, snowLine, heightFactor)
        return this.lerpHSL(
          0.35, 0.7, 0.35, // Vert foncé
          0.1, 0.6, 0.4,   // Marron-vert
          t
        )
      } else if (heightFactor < snowLine + 0.1) {
        // Transition vers la neige
        const t = this.smoothstep(snowLine, snowLine + 0.1, heightFactor)
        return this.lerpHSL(
          0.1, 0.6, 0.4,   // Marron-vert
          0.0, 0.0, 0.95,  // Blanc pur
          t
        )
      } else {
        // Neiges éternelles
        const t = this.smoothstep(snowLine + 0.1, 1, heightFactor)
        return this.lerpHSL(
          0.0, 0.0, 0.95,  // Blanc pur
          0.0, 0.0, 1.0,   // Blanc brillant
          t
        )
      }
    }
  }

  /**
   * Applique les couleurs à la géométrie en fonction de l'élévation
   * @param geometry Géométrie de la sphère
   * @param getElevation Fonction pour obtenir l'élévation à une position donnée
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
      
      // Calcul de la couleur avec prise en compte de la latitude
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

const colorService = ColorService.getInstance()
export { colorService }
export default colorService 