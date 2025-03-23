import * as THREE from 'three'

export class ElevationService {
  private static instance: ElevationService
  private elevationData: Float32Array | null = null
  private readonly width: number = 1200  // largeur (longitude)
  private readonly height: number = 600   // hauteur (latitude)
  private maxElevation: number = -Infinity
  private minElevation: number = Infinity

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
      const buffer = await response.arrayBuffer()
      
      console.log('=== ANALYSE DU BUFFER ===')
      console.log(`Taille du buffer: ${buffer.byteLength} octets`)
      console.log(`Nombre de float32: ${buffer.byteLength / 4}`)
      console.log(`Dimensions attendues: ${this.height}×${this.width} = ${this.height * this.width} points`)
      
      this.elevationData = new Float32Array(buffer)
      console.log(`Taille du tableau: ${this.elevationData.length} points`)

      // Analyse détaillée des données d'élévation
      if (this.elevationData) {
        let minElevation = Infinity
        let maxElevation = -Infinity
        let sumElevation = 0
        let negativeCount = 0
        let positiveCount = 0
        
        // Stats par hémisphère
        let northMin = Infinity
        let northMax = -Infinity
        let northSum = 0
        let northCount = 0
        let southMin = Infinity
        let southMax = -Infinity
        let southSum = 0
        let southCount = 0

        for (let y = 0; y < this.height; y++) {
          // Convertir l'index y en latitude (-90 à 90)
          const latitude = 90 - (y * 180 / this.height)
          
          for (let x = 0; x < this.width; x++) {
            const index = y * this.width + x
            const elevation = this.elevationData[index]
            
            // Stats globales
            if (!isNaN(elevation)) {
              minElevation = Math.min(minElevation, elevation)
              maxElevation = Math.max(maxElevation, elevation)
              sumElevation += elevation
              if (elevation < 0) negativeCount++
              if (elevation > 0) positiveCount++
              
              // Stats par hémisphère
              if (latitude >= 0) {
                // Hémisphère Nord
                northMin = Math.min(northMin, elevation)
                northMax = Math.max(northMax, elevation)
                northSum += elevation
                northCount++
              } else {
                // Hémisphère Sud
                southMin = Math.min(southMin, elevation)
                southMax = Math.max(southMax, elevation)
                southSum += elevation
                southCount++
              }
            }
          }
        }

        console.log('=== ANALYSE DES DONNÉES D\'ÉLÉVATION ===')
        console.log('\nSTATISTIQUES GLOBALES:')
        console.log(`Élévation minimale: ${minElevation.toFixed(2)}m`)
        console.log(`Élévation maximale: ${maxElevation.toFixed(2)}m`)
        console.log(`Élévation moyenne: ${(sumElevation / (negativeCount + positiveCount)).toFixed(2)}m`)
        console.log(`Points négatifs: ${negativeCount} (${(negativeCount / this.elevationData.length * 100).toFixed(2)}%)`)
        console.log(`Points positifs: ${positiveCount} (${(positiveCount / this.elevationData.length * 100).toFixed(2)}%)`)
        
        console.log('\nHÉMISPHÈRE NORD:')
        console.log(`Élévation minimale: ${northMin.toFixed(2)}m`)
        console.log(`Élévation maximale: ${northMax.toFixed(2)}m`)
        console.log(`Élévation moyenne: ${(northSum / northCount).toFixed(2)}m`)
        
        console.log('\nHÉMISPHÈRE SUD:')
        console.log(`Élévation minimale: ${southMin.toFixed(2)}m`)
        console.log(`Élévation maximale: ${southMax.toFixed(2)}m`)
        console.log(`Élévation moyenne: ${(southSum / southCount).toFixed(2)}m`)
        
        // Sauvegarder les valeurs extrêmes pour le calcul des couleurs
        this.minElevation = minElevation
        this.maxElevation = maxElevation
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'élévation:', error)
    }
  }

  public getElevationAtPoint(latitude: number, longitude: number): number {
    if (!this.elevationData) return 0

    // Normalisation des coordonnées
    let lat = latitude
    let lon = longitude
    
    // Assure que la longitude est dans [-180, 180]
    lon = ((lon + 180) % 360) - 180
    
    // Assure que la latitude est dans [-90, 90]
    lat = Math.max(-90, Math.min(90, lat))
    
    // Conversion des coordonnées en indices de tableau
    const x = Math.floor((lon + 180) * (this.width / 360))
    const y = Math.floor((90 - lat) * (this.height / 180))
    
    // Assure que les indices sont dans les limites
    const safeX = Math.max(0, Math.min(this.width - 1, x))
    const safeY = Math.max(0, Math.min(this.height - 1, y))
    
    // Calcul de l'index dans le tableau 1D
    const index = safeY * this.width + safeX
    
    // Log occasionnel pour vérifier les valeurs
    if (Math.random() < 0.001) {
      console.log(`Élévation à [${lat}, ${lon}]: ${this.elevationData[index]}m`)
    }
    
    return this.elevationData[index] || 0
  }

  public applyElevationToGeometry(geometry: THREE.SphereGeometry): void {
    if (!this.elevationData) return

    const positions = geometry.attributes.position.array
    const radius = 5 // rayon de base de la sphère (niveau des océans)
    
    // Facteurs d'échelle pour les altitudes (en % du rayon)
    const MAX_MOUNTAIN_SCALE = 0.08  // +8% pour les plus hautes montagnes (11000m)
    const MAX_DEPTH_SCALE = 0.04     // -4% pour les fosses océaniques (-5000m)

    // Valeurs limites pour la normalisation
    const MAX_ELEVATION = 11000  // altitude maximale en mètres
    const MIN_ELEVATION = -5000  // profondeur maximale en mètres

    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      vertex.normalize()
      
      // Calcul de la latitude et longitude
      const latitude = Math.asin(vertex.y) * 180 / Math.PI
      const longitude = Math.atan2(vertex.x, vertex.z) * 180 / Math.PI
      
      // Obtention de l'élévation
      const elevation = this.getElevationAtPoint(latitude, longitude)
      
      // Calcul du facteur d'échelle en pourcentage du rayon
      let scale = 1.0 // 100% = niveau des océans
      if (elevation > 0) {
        // Pour les terres (élévation positive)
        // Plus l'élévation est haute, plus on s'éloigne du centre
        scale = 1.0 + (elevation / MAX_ELEVATION) * MAX_MOUNTAIN_SCALE
      } else {
        // Pour les océans (élévation négative)
        // Plus la profondeur est grande (elevation plus négative), plus on se rapproche du centre
        scale = 1.0 - (Math.abs(elevation) / Math.abs(MIN_ELEVATION)) * MAX_DEPTH_SCALE
      }
      
      // Log occasionnel pour vérifier les échelles
      if (Math.random() < 0.001) {
        const scalePercent = (scale - 1.0) * 100
        console.log(`Altitude ${elevation}m -> échelle ${scalePercent.toFixed(2)}% du rayon (scale: ${scale})`)
      }
      
      // Application de l'élévation
      vertex.multiplyScalar(radius * scale)
      
      positions[i] = vertex.x
      positions[i + 1] = vertex.y
      positions[i + 2] = vertex.z
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  }
}

export default ElevationService.getInstance() 