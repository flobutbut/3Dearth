import { defineStore } from 'pinia'
import { GeologicalService } from '@/services/geological/GeologicalService'

interface PlateData {
  id: number
  name: string
  coordinates: number[][] // Liste de [latitude, longitude]
  elevation: number
}

interface GeologicalState {
  plates: PlateData[]
  isLoading: boolean
  selectedPlateId: number | null
  visibleLayers: string[]
  interpolationProgress: number // Entre 0 et 1
  currentEpoch: {
    time: number
    plates: PlateData[]
  } | null
  nextEpoch: {
    time: number
    plates: PlateData[]
  } | null
}

export const useGeologicalStore = defineStore('geological', {
  state: (): GeologicalState => ({
    plates: [],
    isLoading: false,
    selectedPlateId: null,
    visibleLayers: ['plates', 'boundaries'],
    interpolationProgress: 0,
    currentEpoch: null,
    nextEpoch: null
  }),

  getters: {
    selectedPlate: (state): PlateData | null => {
      if (state.selectedPlateId === null) return null
      return state.plates.find(plate => plate.id === state.selectedPlateId) || null
    },

    interpolatedPlates: (state): PlateData[] => {
      if (!state.currentEpoch || !state.nextEpoch) return state.plates

      return GeologicalService.getInstance().interpolateEpochs(
        state.currentEpoch.time,
        state.nextEpoch.time,
        state.interpolationProgress
      )
    },

    visiblePlateData: (state): PlateData[] => {
      if (!state.visibleLayers.includes('plates')) return []
      return state.plates
    }
  },

  actions: {
    async loadEpochData(time: number) {
      if (this.isLoading) return

      this.isLoading = true
      try {
        await GeologicalService.getInstance().loadEpochData(time)
        // Mise à jour des époques
        const service = GeologicalService.getInstance()
        this.currentEpoch = service['epochs'].find(e => e.time === time) || null
        
        // Trouve l'époque suivante la plus proche
        const nextEpochs = service['epochs']
          .filter(e => e.time > time)
          .sort((a, b) => a.time - b.time)
        this.nextEpoch = nextEpochs[0] || null

        // Mise à jour des plaques
        if (this.currentEpoch) {
          this.plates = this.currentEpoch.plates
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données géologiques:', error)
      } finally {
        this.isLoading = false
      }
    },

    selectPlate(plateId: number | null) {
      this.selectedPlateId = plateId
    },

    toggleLayer(layer: string) {
      const index = this.visibleLayers.indexOf(layer)
      if (index === -1) {
        this.visibleLayers.push(layer)
      } else {
        this.visibleLayers.splice(index, 1)
      }
    },

    setInterpolationProgress(progress: number) {
      this.interpolationProgress = Math.max(0, Math.min(1, progress))
    },

    resetSelection() {
      this.selectedPlateId = null
    }
  }
}) 