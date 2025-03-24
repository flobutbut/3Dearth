import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'
import { ElevationService } from '@/services/elevation/ElevationService'

describe('ElevationService', () => {
  let service: ElevationService

  beforeEach(() => {
    // Réinitialiser l'instance du singleton
    // @ts-ignore
    ElevationService.instance = null
    service = ElevationService.getInstance()
  })

  it('devrait être un singleton', () => {
    const instance1 = ElevationService.getInstance()
    const instance2 = ElevationService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('devrait charger les données d\'élévation', async () => {
    await service.loadElevationData()
    // Vérifier que les données sont chargées
    const elevation = service.getElevationAtPoint(0, 0)
    expect(elevation).toBeDefined()
  })

  it('devrait retourner l\'élévation correcte pour un point donné', async () => {
    await service.loadElevationData()
    const elevation = service.getElevationAtPoint(0, 0)
    expect(elevation).toBe(0) // Par défaut, l'élévation est 0
  })

  it('devrait appliquer l\'élévation à une géométrie', async () => {
    await service.loadElevationData()
    
    const geometry = new THREE.SphereGeometry(6371, 32, 32)
    const originalPositions = geometry.attributes.position.array.slice()
    
    service.applyElevationToGeometry(geometry)
    
    const newPositions = geometry.attributes.position.array
    expect(newPositions).not.toEqual(originalPositions)
  })
}) 