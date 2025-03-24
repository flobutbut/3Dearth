import * as THREE from 'three'

export class ElevationService {
  private static instance: ElevationService | null = null
  private elevationData: Float32Array | null = null
  private width: number = 1200  // largeur (longitude)
  private height: number = 600   // hauteur (latitude) - divisé par 2 car le script réduit la résolution
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

  public getElevationAtPoint(lat: number, lon: number): number {
    if (!this.elevationData) {
      return 0
    }

    // Convertir les coordonnées en indices de tableau
    const x = Math.floor((lon + 180) / 360 * this.width)
    const y = Math.floor((lat + 90) / 180 * this.height)
    
    // Assurer que les indices sont dans les limites
    const safeX = Math.max(0, Math.min(x, this.width - 1))
    const safeY = Math.max(0, Math.min(y, this.height - 1))
    
    const index = safeY * this.width + safeX
    return this.elevationData[index] || 0
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
      
      const lat = Math.asin(direction.y) * 180 / Math.PI
      const lon = Math.atan2(direction.x, direction.z) * 180 / Math.PI
      
      const elevation = this.getElevationAtPoint(lat, lon)
      elevationSum += elevation
      totalPoints++

      // Calcul précis du facteur d'échelle
      const scaleFactor = baseRadius * (1.0 + (elevation / this.earthRadius))
      minAppliedElevation = Math.min(minAppliedElevation, scaleFactor)
      maxAppliedElevation = Math.max(maxAppliedElevation, scaleFactor)
      
      positions[i] = direction.x * scaleFactor
      positions[i + 1] = direction.y * scaleFactor
      positions[i + 2] = direction.z * scaleFactor
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals() // Recalculer les normales pour un meilleur rendu

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