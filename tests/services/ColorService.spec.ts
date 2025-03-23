import { describe, it, expect, beforeEach, vi } from 'vitest'
import ColorService from '@/services/color/ColorService'
import * as THREE from 'three'

describe('ColorService', () => {
  let service: typeof ColorService

  beforeEach(() => {
    service = ColorService
    vi.clearAllMocks()
  })

  it('should be a singleton', () => {
    const instance1 = ColorService
    const instance2 = ColorService
    expect(instance1).toBe(instance2)
  })

  it('should return blue colors for ocean depths', () => {
    const color = service.getColorForPosition(-5000, 0, 0)
    expect(color).toBeInstanceOf(THREE.Color)
    expect(color.getHSL({ h: 0, s: 0, l: 0 }).h).toBeCloseTo(0.6) // Teinte bleue
  })

  it('should return white for polar regions', () => {
    const color = service.getColorForPosition(100, 85, 0)
    expect(color).toBeInstanceOf(THREE.Color)
    expect(color.getHSL({ h: 0, s: 0, l: 0 }).l).toBeGreaterThan(0.8) // Luminosité élevée
  })

  it('should return green for equatorial regions', () => {
    const color = service.getColorForPosition(100, 0, 0)
    expect(color).toBeInstanceOf(THREE.Color)
    expect(color.getHSL({ h: 0, s: 0, l: 0 }).h).toBeCloseTo(0.3) // Teinte verte
  })

  it('should apply colors to geometry', () => {
    // Mock de la géométrie
    const mockGeometry = {
      attributes: {
        position: {
          array: new Float32Array(9) // 3 vertices
        },
        color: undefined
      },
      setAttribute: vi.fn()
    }

    // Mock de la fonction d'élévation
    const mockGetElevation = vi.fn().mockReturnValue(0)

    // Mock pour THREE.Vector3 et THREE.Spherical
    const mockVector3 = {
      x: 1, y: 1, z: 1,
      multiplyScalar: vi.fn().mockReturnThis()
    }

    const mockSpherical = {
      phi: Math.PI / 2,
      theta: Math.PI,
      setFromVector3: vi.fn().mockReturnThis()
    }

    vi.spyOn(THREE, 'Vector3').mockImplementation(() => mockVector3 as any)
    vi.spyOn(THREE, 'Spherical').mockImplementation(() => mockSpherical as any)
    vi.spyOn(THREE, 'BufferAttribute').mockImplementation(() => ({ needsUpdate: false }) as any)

    service.applyColorsToGeometry(mockGeometry as unknown as THREE.SphereGeometry, mockGetElevation)

    expect(mockGeometry.setAttribute).toHaveBeenCalled()
  })
}) 