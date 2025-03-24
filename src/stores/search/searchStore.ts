import { defineStore } from 'pinia'

interface SearchResult {
  id: string
  type: 'location' | 'event' | 'plate'
  name: string
  description: string
  coordinates?: [number, number] // [latitude, longitude]
  time?: number // En millions d'années
}

interface SearchState {
  query: string
  results: SearchResult[]
  isSearching: boolean
  selectedResultId: string | null
  recentSearches: string[]
  filters: {
    types: string[]
    timeRange: {
      min: number | null
      max: number | null
    }
  }
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    query: '',
    results: [],
    isSearching: false,
    selectedResultId: null,
    recentSearches: [],
    filters: {
      types: ['location', 'event', 'plate'],
      timeRange: {
        min: null,
        max: null
      }
    }
  }),

  getters: {
    filteredResults: (state): SearchResult[] => {
      return state.results.filter(result => {
        // Filtre par type
        if (!state.filters.types.includes(result.type)) return false

        // Filtre par période temporelle
        if (result.time !== undefined) {
          if (state.filters.timeRange.min !== null && result.time < state.filters.timeRange.min) return false
          if (state.filters.timeRange.max !== null && result.time > state.filters.timeRange.max) return false
        }

        return true
      })
    },

    selectedResult: (state): SearchResult | null => {
      if (!state.selectedResultId) return null
      return state.results.find(result => result.id === state.selectedResultId) || null
    },

    hasResults: (state): boolean => state.results.length > 0
  },

  actions: {
    async search(query: string) {
      if (!query.trim()) {
        this.results = []
        return
      }

      this.query = query
      this.isSearching = true

      try {
        // TODO: Implémenter la recherche réelle
        // Pour l'instant, on utilise des données de test
        this.results = [
          {
            id: '1',
            type: 'location',
            name: 'Mont Everest',
            description: 'Plus haute montagne du monde',
            coordinates: [27.9881, 86.9250],
            time: 0
          },
          {
            id: '2',
            type: 'event',
            name: 'Formation de l\'Himalaya',
            description: 'Collision entre les plaques indienne et eurasienne',
            time: -50
          }
        ]

        // Ajoute la recherche à l'historique
        if (!this.recentSearches.includes(query)) {
          this.recentSearches.unshift(query)
          if (this.recentSearches.length > 10) {
            this.recentSearches.pop()
          }
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        this.results = []
      } finally {
        this.isSearching = false
      }
    },

    selectResult(resultId: string | null) {
      this.selectedResultId = resultId
    },

    clearSearch() {
      this.query = ''
      this.results = []
      this.selectedResultId = null
    },

    setTimeRange(min: number | null, max: number | null) {
      this.filters.timeRange.min = min
      this.filters.timeRange.max = max
    },

    toggleTypeFilter(type: string) {
      const index = this.filters.types.indexOf(type)
      if (index === -1) {
        this.filters.types.push(type)
      } else {
        this.filters.types.splice(index, 1)
      }
    },

    clearFilters() {
      this.filters = {
        types: ['location', 'event', 'plate'],
        timeRange: {
          min: null,
          max: null
        }
      }
    },

    clearHistory() {
      this.recentSearches = []
    }
  }
}) 