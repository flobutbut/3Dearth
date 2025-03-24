import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

interface VisualizationSettings {
  quality: 'low' | 'medium' | 'high'
  resolution: number
  showGrid: boolean
  showLabels: boolean
  showCoordinates: boolean
}

interface ColorSettings {
  scheme: 'default' | 'satellite' | 'elevation' | 'geological'
  oceanOpacity: number
  landOpacity: number
  customColors: {
    ocean: string
    land: string
    mountains: string
    ice: string
  }
}

interface CameraSettings {
  fov: number
  near: number
  far: number
  defaultPosition: {
    x: number
    y: number
    z: number
  }
  defaultTarget: {
    x: number
    y: number
    z: number
  }
  rotationSpeed: number
  zoomSpeed: number
  minDistance: number
  maxDistance: number
}

interface SettingsState {
  visualization: VisualizationSettings
  colors: ColorSettings
  camera: CameraSettings
  performance: {
    enableShadows: boolean
    enablePostProcessing: boolean
    maxFPS: number
    autoQuality: boolean
  }
  interface: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    showTooltips: boolean
    showTutorial: boolean
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => {
    const storedSettings = useStorage('earth-settings', {
      visualization: {
        quality: 'medium',
        resolution: 1,
        showGrid: true,
        showLabels: true,
        showCoordinates: false
      },
      colors: {
        scheme: 'default',
        oceanOpacity: 1,
        landOpacity: 1,
        customColors: {
          ocean: '#1e4d6b',
          land: '#2d5016',
          mountains: '#4a4a4a',
          ice: '#ffffff'
        }
      },
      camera: {
        fov: 45,
        near: 0.1,
        far: 1000,
        defaultPosition: {
          x: 0,
          y: 0,
          z: 10
        },
        defaultTarget: {
          x: 0,
          y: 0,
          z: 0
        },
        rotationSpeed: 1,
        zoomSpeed: 1,
        minDistance: 5,
        maxDistance: 20
      },
      performance: {
        enableShadows: true,
        enablePostProcessing: true,
        maxFPS: 60,
        autoQuality: true
      },
      interface: {
        language: 'fr',
        theme: 'auto',
        showTooltips: true,
        showTutorial: true
      }
    })

    return storedSettings.value as SettingsState
  },

  getters: {
    effectiveTheme: (state): 'light' | 'dark' => {
      if (state.interface.theme !== 'auto') return state.interface.theme
      
      // Détecte le thème du système
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
      return 'light'
    },

    effectiveQuality: (state) => {
      if (!state.performance.autoQuality) return state.visualization.quality

      // Ajuste automatiquement la qualité en fonction des performances
      const fps = state.performance.maxFPS
      if (fps < 30) return 'low'
      if (fps < 45) return 'medium'
      return 'high'
    }
  },

  actions: {
    setQuality(quality: 'low' | 'medium' | 'high') {
      this.visualization.quality = quality
      this.updateResolution()
    },

    setColorScheme(scheme: 'default' | 'satellite' | 'elevation' | 'geological') {
      this.colors.scheme = scheme
    },

    updateCustomColor(key: keyof ColorSettings['customColors'], color: string) {
      this.colors.customColors[key] = color
    },

    setCameraDefaults() {
      this.camera = {
        fov: 45,
        near: 0.1,
        far: 1000,
        defaultPosition: {
          x: 0,
          y: 0,
          z: 10
        },
        defaultTarget: {
          x: 0,
          y: 0,
          z: 0
        },
        rotationSpeed: 1,
        zoomSpeed: 1,
        minDistance: 5,
        maxDistance: 20
      }
    },

    toggleShadows(enabled: boolean) {
      this.performance.enableShadows = enabled
    },

    setLanguage(language: string) {
      this.interface.language = language
    },

    setTheme(theme: 'light' | 'dark' | 'auto') {
      this.interface.theme = theme
    },

    updateResolution() {
      switch (this.visualization.quality) {
        case 'low':
          this.visualization.resolution = 0.5
          break
        case 'medium':
          this.visualization.resolution = 1
          break
        case 'high':
          this.visualization.resolution = 2
          break
      }
    },

    resetToDefaults() {
      // Réinitialise tous les paramètres à leurs valeurs par défaut
      this.$reset()
    }
  }
}) 