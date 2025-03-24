import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ColorService } from '@/services/color/ColorService'
import * as THREE from 'three'

describe('ColorService', () => {
  let service: ColorService

  beforeEach(() => {
    // Réinitialiser l'instance du singleton
    (ColorService as any).instance = null
    service = ColorService.getInstance()
    vi.clearAllMocks()
  })

  it('should be a singleton', () => {
    const instance1 = ColorService.getInstance()
    const instance2 = ColorService.getInstance()
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

    service.applyColorsToGeometry(mockGeometry as unknown as THREE.SphereGeometry, mockGetElevation)

    expect(mockGeometry.setAttribute).toHaveBeenCalled()
  })
}) 