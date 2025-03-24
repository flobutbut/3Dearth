import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSearchStore } from '@/stores/search/searchStore'

describe('SearchStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const store = useSearchStore()
    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.isSearching).toBe(false)
    expect(store.selectedResultId).toBeNull()
    expect(store.recentSearches).toEqual([])
    expect(store.filters.types).toEqual(['location', 'event', 'plate'])
    expect(store.filters.timeRange).toEqual({ min: null, max: null })
  })

  it('should not search with empty query', async () => {
    const store = useSearchStore()
    await store.search('   ')
    expect(store.results).toEqual([])
    expect(store.isSearching).toBe(false)
  })

  it('should perform search and update results', async () => {
    const store = useSearchStore()
    await store.search('everest')
    expect(store.results.length).toBeGreaterThan(0)
    expect(store.results[0].name).toBe('Mont Everest')
  })

  it('should handle search errors', async () => {
    const store = useSearchStore()
    const consoleSpy = vi.spyOn(console, 'error')
    
    // Force une erreur dans la recherche
    vi.spyOn(store, 'search').mockRejectedValueOnce(new Error('Test error'))
    
    await store.search('error')
    expect(consoleSpy).toHaveBeenCalled()
    expect(store.results).toEqual([])
    expect(store.isSearching).toBe(false)
  })

  it('should select a result', () => {
    const store = useSearchStore()
    store.selectResult('1')
    expect(store.selectedResultId).toBe('1')
  })

  it('should clear search', () => {
    const store = useSearchStore()
    store.query = 'test'
    store.results = [{ id: '1', type: 'location', name: 'Test', description: 'Test' }]
    store.selectedResultId = '1'

    store.clearSearch()
    expect(store.query).toBe('')
    expect(store.results).toEqual([])
    expect(store.selectedResultId).toBeNull()
  })

  it('should set time range filter', () => {
    const store = useSearchStore()
    store.setTimeRange(-100, 0)
    expect(store.filters.timeRange).toEqual({ min: -100, max: 0 })
  })

  it('should toggle type filter', () => {
    const store = useSearchStore()
    store.toggleTypeFilter('event')
    expect(store.filters.types).toEqual(['location', 'plate'])
    store.toggleTypeFilter('event')
    expect(store.filters.types).toEqual(['location', 'plate', 'event'])
  })

  it('should clear filters', () => {
    const store = useSearchStore()
    store.filters.types = ['location']
    store.filters.timeRange = { min: -100, max: 0 }

    store.clearFilters()
    expect(store.filters.types).toEqual(['location', 'event', 'plate'])
    expect(store.filters.timeRange).toEqual({ min: null, max: null })
  })

  it('should manage recent searches', async () => {
    const store = useSearchStore()
    await store.search('everest')
    expect(store.recentSearches).toContain('everest')
  })

  it('should limit recent searches to 10', async () => {
    const store = useSearchStore()
    for (let i = 0; i < 12; i++) {
      await store.search(`test${i}`)
    }
    expect(store.recentSearches.length).toBe(10)
  })

  it('should not duplicate recent searches', async () => {
    const store = useSearchStore()
    await store.search('everest')
    await store.search('everest')
    expect(store.recentSearches.filter(s => s === 'everest').length).toBe(1)
  })

  it('should clear search history', () => {
    const store = useSearchStore()
    store.recentSearches = ['test1', 'test2']
    store.clearHistory()
    expect(store.recentSearches).toEqual([])
  })

  it('should filter results by type', async () => {
    const store = useSearchStore()
    await store.search('test')
    store.toggleTypeFilter('event')
    expect(store.filteredResults.every(r => r.type !== 'event')).toBe(true)
  })

  it('should filter results by time range', async () => {
    const store = useSearchStore()
    await store.search('test')
    store.setTimeRange(-100, -50)
    expect(store.filteredResults.every(r => {
      if (r.time === undefined) return true
      return r.time >= -100 && r.time <= -50
    })).toBe(true)
  })

  it('should return selected result from getter', async () => {
    const store = useSearchStore()
    await store.search('everest')
    store.selectResult('1')
    expect(store.selectedResult?.name).toBe('Mont Everest')
  })

  it('should return null for non-existent selected result', () => {
    const store = useSearchStore()
    store.selectResult('999')
    expect(store.selectedResult).toBeNull()
  })
}) 