import * as THREE from 'three'

export class ElevationService {
  private static instance: ElevationService | null = null
  private elevationData: Float32Array | null = null
  private width: number = 2400  // largeur (longitude) - mise à jour pour la nouvelle résolution
  private height: number = 1200  // hauteur (latitude) - mise à jour pour la nouvelle résolution
  private maxElevation: number = -Infinity
  private minElevation: number = Infinity
  private readonly earthRadius: number = 6371000 // Rayon moyen de la Terre en mètres

  private constructor() {}

  public static getInstance(): ElevationService {
    if (!ElevationService.instance) {
      ElevationService.instance = new ElevationService()
    }
    return ElevationService.instance
  }

  public async loadElevationData(): Promise<void> {
    try {
      const response = await fetch('/data/elevation/etopo1_simplified.bin')
      const arrayBuffer = await response.arrayBuffer()
      this.elevationData = new Float32Array(arrayBuffer)
      
      // Calculer les statistiques
      this.maxElevation = -Infinity
      this.minElevation = Infinity
      for (let i = 0; i < this.elevationData.length; i++) {
        this.maxElevation = Math.max(this.maxElevation, this.elevationData[i])
        this.minElevation = Math.min(this.minElevation, this.elevationData[i])
      }
      
      console.log('Données d\'élévation chargées:')
      console.log(`Minimum: ${this.minElevation}m`)
      console.log(`Maximum: ${this.maxElevation}m`)
      console.log(`Dimensions: ${this.width}×${this.height}`)
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'élévation:', error)
      this.elevationData = null
    }
  }

  private bilinearInterpolation(x: number, y: number, x1: number, x2: number, y1: number, y2: number, q11: number, q12: number, q21: number, q22: number): number {
    const x2x1 = x2 - x1
    const y2y1 = y2 - y1
    const x2x = x2 - x
    const y2y = y2 - y
    const yy1 = y - y1
    const xx1 = x - x1
    
    return 1 / (x2x1 * y2y1) * (
      q11 * x2x * y2y +
      q21 * xx1 * y2y +
      q12 * x2x * yy1 +
      q22 * xx1 * yy1
    )
  }

  public getElevationAtPoint(lat: number, lon: number): number {
    if (!this.elevationData) {
      return 0
    }

    // Normaliser les coordonnées
    lon = ((lon + 180) % 360 + 360) % 360 - 180  // Assure que lon est entre -180 et 180
    lat = Math.max(-90, Math.min(90, lat))       // Assure que lat est entre -90 et 90

    // Convertir en coordonnées de grille
    const x = (lon + 180) / 360 * (this.width - 1)
    const y = (lat + 90) / 180 * (this.height - 1)

    // Obtenir les indices des quatre points les plus proches
    const x1 = Math.floor(x)
    const x2 = Math.min(x1 + 1, this.width - 1)
    const y1 = Math.floor(y)
    const y2 = Math.min(y1 + 1, this.height - 1)

    // Obtenir les valeurs aux quatre coins
    const q11 = this.elevationData[y1 * this.width + x1] || 0
    const q12 = this.elevationData[y2 * this.width + x1] || 0
    const q21 = this.elevationData[y1 * this.width + x2] || 0
    const q22 = this.elevationData[y2 * this.width + x2] || 0

    // Interpolation bilinéaire
    return this.bilinearInterpolation(x, y, x1, x2, y1, y2, q11, q12, q21, q22)
  }

  public applyElevationToGeometry(geometry: THREE.BufferGeometry): void {
    if (!this.elevationData) {
      return
    }

    const positions = geometry.attributes.position.array as Float32Array
    const baseRadius = 10 // Rayon de base en unités Three.js

    let minAppliedElevation = Infinity
    let maxAppliedElevation = -Infinity
    let totalPoints = 0
    let elevationSum = 0

    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      const direction = vertex.clone().normalize()
      
      // Convertir les coordonnées cartésiennes en coordonnées sphériques
      const lat = Math.asin(direction.y) * 180 / Math.PI
      const lon = Math.atan2(direction.x, direction.z) * 180 / Math.PI
      
      // Obtenir l'élévation avec interpolation
      const elevation = this.getElevationAtPoint(lat, lon)
      elevationSum += elevation
      totalPoints++

      // Appliquer l'élévation de manière proportionnelle
      const scaleFactor = baseRadius * (1.0 + (elevation / this.earthRadius))
      minAppliedElevation = Math.min(minAppliedElevation, scaleFactor)
      maxAppliedElevation = Math.max(maxAppliedElevation, scaleFactor)
      
      positions[i] = direction.x * scaleFactor
      positions[i + 1] = direction.y * scaleFactor
      positions[i + 2] = direction.z * scaleFactor
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()

    // Logs détaillés
    console.log('Statistiques d\'application des élévations:')
    console.log(`Nombre total de points: ${totalPoints}`)
    console.log(`Élévation moyenne: ${elevationSum / totalPoints}m`)
    console.log(`Rayon de base: ${baseRadius} unités`)
    console.log(`Rayon minimum appliqué: ${minAppliedElevation} unités (différence: ${minAppliedElevation - baseRadius})`)
    console.log(`Rayon maximum appliqué: ${maxAppliedElevation} unités (différence: ${maxAppliedElevation - baseRadius})`)
    console.log(`Données d'élévation min/max: ${this.minElevation}m / ${this.maxElevation}m`)
    console.log(`Ratio min/max par rapport au rayon terrestre: ${this.minElevation/this.earthRadius} / ${this.maxElevation/this.earthRadius}`)
  }
}

const elevationService = ElevationService.getInstance()
export { elevationService }
export default elevationService 