import * as THREE from 'three'

interface PlateData {
  id: number
  name: string
  coordinates: number[][] // Liste de [latitude, longitude]
  elevation: number
}

interface GeologicalEpoch {
  time: number // En millions d'années
  plates: PlateData[]
}

export class GeologicalService {
  private static instance: GeologicalService | null = null
  private epochs: GeologicalEpoch[] = []
  private isLoading: boolean = false

  private constructor() {}

  public static getInstance(): GeologicalService {
    if (!GeologicalService.instance) {
      GeologicalService.instance = new GeologicalService()
    }
    return GeologicalService.instance
  }

  public async loadEpochData(time: number): Promise<void> {
    if (this.isLoading) return

    this.isLoading = true
    try {
      // TODO: Implémenter le chargement des données depuis un fichier ou une API
      // Pour l'instant, on utilise des données de test
      const testData: GeologicalEpoch = {
        time,
        plates: [
          {
            id: 1,
            name: "Test Plate",
            coordinates: [[0, 0], [10, 10], [10, 0]],
            elevation: 1000
          }
        ]
      }
      
      this.epochs.push(testData)
    } catch (error) {
      console.error('Erreur lors du chargement des données géologiques:', error)
    } finally {
      this.isLoading = false
    }
  }

  public applyToGeometry(geometry: THREE.SphereGeometry, time: number): void {
    // TODO: Implémenter la déformation de la géométrie selon les données géologiques
    // Pour l'instant, on ne fait rien
    console.log('Application des données géologiques pour le temps:', time)
  }

  public interpolateEpochs(time1: number, time2: number, progress: number): PlateData[] {
    const epoch1 = this.epochs.find(e => e.time === time1)
    const epoch2 = this.epochs.find(e => e.time === time2)

    if (!epoch1 || !epoch2) return []

    return epoch1.plates.map((plate1, index) => {
      const plate2 = epoch2.plates[index]
      return {
        id: plate1.id,
        name: plate1.name,
        coordinates: plate1.coordinates.map((coord1, i) => {
          const coord2 = plate2.coordinates[i]
          return [
            coord1[0] + (coord2[0] - coord1[0]) * progress,
            coord1[1] + (coord2[1] - coord1[1]) * progress
          ]
        }),
        elevation: plate1.elevation + (plate2.elevation - plate1.elevation) * progress
      }
    })
  }
}

const geologicalService = GeologicalService.getInstance()
export { geologicalService }
export default geologicalService 