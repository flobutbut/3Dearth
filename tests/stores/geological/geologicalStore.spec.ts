import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGeologicalStore } from '@/stores/geological/geologicalStore'
import { GeologicalService } from '@/services/geological/GeologicalService'

describe('GeologicalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const store = useGeologicalStore()
    expect(store.plates).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.selectedPlateId).toBeNull()
    expect(store.visibleLayers).toEqual(['plates', 'boundaries'])
    expect(store.interpolationProgress).toBe(0)
    expect(store.currentEpoch).toBeNull()
    expect(store.nextEpoch).toBeNull()
  })

  it('should select a plate', () => {
    const store = useGeologicalStore()
    store.selectPlate(1)
    expect(store.selectedPlateId).toBe(1)
  })

  it('should reset plate selection', () => {
    const store = useGeologicalStore()
    store.selectPlate(1)
    store.resetSelection()
    expect(store.selectedPlateId).toBeNull()
  })

  it('should toggle layer visibility', () => {
    const store = useGeologicalStore()
    store.toggleLayer('boundaries')
    expect(store.visibleLayers).toEqual(['plates'])
    store.toggleLayer('boundaries')
    expect(store.visibleLayers).toEqual(['plates', 'boundaries'])
  })

  it('should set interpolation progress', () => {
    const store = useGeologicalStore()
    store.setInterpolationProgress(0.5)
    expect(store.interpolationProgress).toBe(0.5)
  })

  it('should clamp interpolation progress between 0 and 1', () => {
    const store = useGeologicalStore()
    store.setInterpolationProgress(-0.5)
    expect(store.interpolationProgress).toBe(0)
    store.setInterpolationProgress(1.5)
    expect(store.interpolationProgress).toBe(1)
  })

  it('should load epoch data', async () => {
    const store = useGeologicalStore()
    const mockEpochData = {
      time: 100,
      plates: [{
        id: 1,
        name: 'Test Plate',
        coordinates: [[0, 0], [10, 10]],
        elevation: 1000
      }]
    }

    // Mock du service géologique
    vi.spyOn(GeologicalService, 'getInstance').mockReturnValue({
      loadEpochData: vi.fn().mockResolvedValue(undefined),
      epochs: [mockEpochData]
    } as any)

    await store.loadEpochData(100)
    expect(store.currentEpoch).toEqual(mockEpochData)
    expect(store.plates).toEqual(mockEpochData.plates)
  })

  it('should handle loading errors', async () => {
    const store = useGeologicalStore()
    const consoleSpy = vi.spyOn(console, 'error')

    // Mock du service géologique avec une erreur
    vi.spyOn(GeologicalService, 'getInstance').mockReturnValue({
      loadEpochData: vi.fn().mockRejectedValue(new Error('Test error')),
      epochs: []
    } as any)

    await store.loadEpochData(100)
    expect(consoleSpy).toHaveBeenCalled()
    expect(store.isLoading).toBe(false)
  })

  it('should not load data when already loading', async () => {
    const store = useGeologicalStore()
    store.isLoading = true

    const loadSpy = vi.fn()
    vi.spyOn(GeologicalService, 'getInstance').mockReturnValue({
      loadEpochData: loadSpy
    } as any)

    await store.loadEpochData(100)
    expect(loadSpy).not.toHaveBeenCalled()
  })

  it('should return selected plate from getter', () => {
    const store = useGeologicalStore()
    const testPlate = {
      id: 1,
      name: 'Test Plate',
      coordinates: [[0, 0]],
      elevation: 1000
    }
    store.plates = [testPlate]
    store.selectPlate(1)
    expect(store.selectedPlate).toEqual(testPlate)
  })

  it('should return null for non-existent selected plate', () => {
    const store = useGeologicalStore()
    store.selectPlate(999)
    expect(store.selectedPlate).toBeNull()
  })

  it('should return interpolated plates', () => {
    const store = useGeologicalStore()
    const mockInterpolatedPlates = [{
      id: 1,
      name: 'Interpolated Plate',
      coordinates: [[5, 5]],
      elevation: 1500
    }]

    store.currentEpoch = { time: 100, plates: [] }
    store.nextEpoch = { time: 200, plates: [] }
    store.interpolationProgress = 0.5

    vi.spyOn(GeologicalService, 'getInstance').mockReturnValue({
      interpolateEpochs: vi.fn().mockReturnValue(mockInterpolatedPlates)
    } as any)

    expect(store.interpolatedPlates).toEqual(mockInterpolatedPlates)
  })

  it('should return visible plate data based on layer visibility', () => {
    const store = useGeologicalStore()
    const testPlates = [{
      id: 1,
      name: 'Test Plate',
      coordinates: [[0, 0]],
      elevation: 1000
    }]
    store.plates = testPlates

    expect(store.visiblePlateData).toEqual(testPlates)
    store.visibleLayers = ['boundaries']
    expect(store.visiblePlateData).toEqual([])
  })
}) 