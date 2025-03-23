import { describe, it, expect, beforeEach, vi } from 'vitest'
import ElevationService from '../../src/services/elevation/ElevationService'
import * as THREE from 'three'

describe('ElevationService', () => {
  let service: typeof ElevationService

  beforeEach(() => {
    service = ElevationService
    vi.clearAllMocks()
    // Réinitialiser les données d'élévation avant chaque test
    service['elevationData'] = null
  })

  it('should be a singleton', () => {
    const instance1 = ElevationService
    const instance2 = ElevationService
    expect(instance1).toBe(instance2)
  })

  it('should initialize with null elevation data', () => {
    expect(service['elevationData']).toBeNull()
  })

  it('should load elevation data successfully', async () => {
    const mockResponse = new ArrayBuffer(1200 * 600 * 4) // Float32Array buffer
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(mockResponse),
    })

    await service.loadElevationData()
    expect(service['elevationData']).not.toBeNull()
    expect(service['elevationData']).toBeInstanceOf(Float32Array)
  })

  it('should handle elevation data loading errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    const consoleSpy = vi.spyOn(console, 'error')

    await service.loadElevationData()
    expect(consoleSpy).toHaveBeenCalled()
    expect(service['elevationData']).toBeNull()
  })

  it('should get elevation at specific coordinates', () => {
    // Simuler des données d'élévation
    const mockData = new Float32Array(1200 * 600)
    mockData[300000] = 1000 // Une valeur d'élévation arbitraire
    service['elevationData'] = mockData

    const elevation = service.getElevationAtPoint(0, 0)
    expect(typeof elevation).toBe('number')
  })

  it('should return 0 for elevation when no data is loaded', () => {
    service['elevationData'] = null
    const elevation = service.getElevationAtPoint(0, 0)
    expect(elevation).toBe(0)
  })

  it('should apply elevation to geometry', () => {
    // Mock des données d'élévation
    const mockData = new Float32Array(1200 * 600)
    service['elevationData'] = mockData

    // Mock de la géométrie Three.js
    const mockGeometry = {
      attributes: {
        position: {
          array: new Float32Array(3 * 100), // 100 vertices
          needsUpdate: false
        }
      },
      computeVertexNormals: vi.fn()
    }

    // Mock pour THREE.Vector3 et THREE.Spherical
    const mockVector3 = {
      x: 1,
      y: 1,
      z: 1,
      multiplyScalar: vi.fn().mockReturnThis()
    }

    const mockSpherical = {
      phi: Math.PI / 2,
      theta: Math.PI,
      setFromVector3: vi.fn().mockReturnThis()
    }

    vi.spyOn(THREE, 'Vector3').mockImplementation(() => mockVector3 as any)
    vi.spyOn(THREE, 'Spherical').mockImplementation(() => mockSpherical as any)

    service.applyElevationToGeometry(mockGeometry as unknown as THREE.SphereGeometry)
    expect(mockGeometry.computeVertexNormals).toHaveBeenCalled()
    expect(mockGeometry.attributes.position.needsUpdate).toBe(true)
  })

  it('should handle coordinate conversion correctly', () => {
    const mockData = new Float32Array(1200 * 600)
    service['elevationData'] = mockData

    // Test avec différentes coordonnées
    const testCoords = [
      { lat: 0, lon: 0 },
      { lat: 90, lon: 180 },
      { lat: -90, lon: -180 },
      { lat: 45, lon: 45 }
    ]

    testCoords.forEach(coord => {
      const elevation = service.getElevationAtPoint(coord.lat, coord.lon)
      expect(typeof elevation).toBe('number')
      expect(elevation).not.toBeNaN()
    })
  })
}) 