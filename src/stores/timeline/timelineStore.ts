import { defineStore } from 'pinia'

interface TimelineState {
  currentTime: number // En millions d'années (Ma)
  isPlaying: boolean
  playbackSpeed: number // Vitesse de lecture (Ma/seconde)
  timeRange: {
    min: number // Temps minimum (Ma)
    max: number // Temps maximum (Ma)
  }
}

export const useTimelineStore = defineStore('timeline', {
  state: (): TimelineState => ({
    currentTime: 0,
    isPlaying: false,
    playbackSpeed: 1,
    timeRange: {
      min: -250, // Début du Permien
      max: 0     // Présent
    }
  }),

  getters: {
    currentTimeFormatted: (state): string => {
      const absTime = Math.abs(state.currentTime)
      return `${absTime} Ma ${state.currentTime < 0 ? 'passés' : ''}`
    },
    
    timeProgress: (state): number => {
      const range = state.timeRange.max - state.timeRange.min
      return ((state.currentTime - state.timeRange.min) / range) * 100
    }
  },

  actions: {
    setCurrentTime(time: number) {
      // Assure que le temps reste dans les limites
      this.currentTime = Math.max(
        this.timeRange.min,
        Math.min(this.timeRange.max, time)
      )
    },

    togglePlayback() {
      this.isPlaying = !this.isPlaying
    },

    setPlaybackSpeed(speed: number) {
      this.playbackSpeed = speed
    },

    updateTimeRange(min: number, max: number) {
      this.timeRange.min = min
      this.timeRange.max = max
      // Ajuste le temps actuel si nécessaire
      this.setCurrentTime(this.currentTime)
    }
  }
}) 