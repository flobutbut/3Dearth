import * as THREE from 'three'

interface Rotation {
  time: number
  lat: number
  lon: number
  angle: number
  plateId1: number
  plateId2: number
  comment?: string
}

interface RotationGroup {
  plateId: number
  rotations: Rotation[]
}

export class PlateRotationService {
  private static instance: PlateRotationService | null = null
  private rotationGroups: Map<number, RotationGroup> = new Map()
  private currentTime: number = 0
  private timeRange: { min: number; max: number } = { min: 0, max: 0 }

  private constructor() {}

  public static getInstance(): PlateRotationService {
    if (!PlateRotationService.instance) {
      PlateRotationService.instance = new PlateRotationService()
    }
    return PlateRotationService.instance
  }

  public async loadRotations(rotations: Rotation[]): Promise<void> {
    // Réinitialiser les groupes
    this.rotationGroups.clear()

    // Trouver la plage de temps
    this.timeRange.min = Math.min(...rotations.map(r => r.time))
    this.timeRange.max = Math.max(...rotations.map(r => r.time))
    this.currentTime = this.timeRange.max // Commencer au présent

    // Grouper les rotations par plateId1
    rotations.forEach(rotation => {
      const plateId = rotation.plateId1
      if (!this.rotationGroups.has(plateId)) {
        this.rotationGroups.set(plateId, {
          plateId,
          rotations: []
        })
      }
      this.rotationGroups.get(plateId)?.rotations.push(rotation)
    })

    // Trier les rotations par temps pour chaque groupe
    this.rotationGroups.forEach(group => {
      group.rotations.sort((a, b) => a.time - b.time)
    })
  }

  public getTimeRange(): { min: number; max: number } {
    return { ...this.timeRange }
  }

  public setCurrentTime(time: number): void {
    this.currentTime = Math.max(this.timeRange.min, Math.min(this.timeRange.max, time))
  }

  public getCurrentTime(): number {
    return this.currentTime
  }

  public getRotationMatrixForPlate(plateId: number): THREE.Matrix4 {
    const group = this.rotationGroups.get(plateId)
    if (!group) return new THREE.Matrix4()

    // Trouver les rotations avant et après le temps actuel
    const rotations = group.rotations
    let beforeIndex = -1
    for (let i = 0; i < rotations.length; i++) {
      if (rotations[i].time <= this.currentTime) {
        beforeIndex = i
      } else {
        break
      }
    }

    // Si pas de rotation avant, retourner l'identité
    if (beforeIndex === -1) return new THREE.Matrix4()

    // Si c'est la dernière rotation, l'utiliser directement
    if (beforeIndex === rotations.length - 1) {
      return this.createRotationMatrix(rotations[beforeIndex])
    }

    // Interpoler entre les deux rotations
    const r1 = rotations[beforeIndex]
    const r2 = rotations[beforeIndex + 1]
    const t = (this.currentTime - r1.time) / (r2.time - r1.time)

    // Interpolation sphérique des paramètres de rotation
    const lat = r1.lat + t * (r2.lat - r1.lat)
    const lon = r1.lon + t * (r2.lon - r1.lon)
    const angle = r1.angle + t * (r2.angle - r1.angle)

    return this.createRotationMatrix({ ...r1, lat, lon, angle })
  }

  private createRotationMatrix(rotation: Rotation): THREE.Matrix4 {
    // Convertir les angles en radians
    const latRad = rotation.lat * Math.PI / 180
    const lonRad = rotation.lon * Math.PI / 180
    const angleRad = rotation.angle * Math.PI / 180

    // Créer la matrice de rotation
    const matrix = new THREE.Matrix4()

    // 1. Rotation autour de l'axe Z pour la longitude
    const rotZ = new THREE.Matrix4().makeRotationZ(lonRad)
    
    // 2. Rotation autour de l'axe Y pour la latitude
    const rotY = new THREE.Matrix4().makeRotationY(latRad)
    
    // 3. Rotation autour de l'axe Z pour l'angle de rotation
    const rotAngle = new THREE.Matrix4().makeRotationZ(angleRad)

    // Combiner les rotations
    matrix
      .multiply(rotZ)
      .multiply(rotY)
      .multiply(rotAngle)
      .multiply(new THREE.Matrix4().makeRotationY(-latRad))
      .multiply(new THREE.Matrix4().makeRotationZ(-lonRad))

    return matrix
  }
} 