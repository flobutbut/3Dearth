import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeologicalService } from '@/services/geological/GeologicalService'

describe('GeologicalService', () => {
  let service: GeologicalService

  beforeEach(() => {
    // Réinitialiser l'instance du singleton
    // @ts-ignore
    GeologicalService.instance = null
    service = GeologicalService.getInstance()
  })

  it('devrait être un singleton', () => {
    const instance1 = GeologicalService.getInstance()
    const instance2 = GeologicalService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('devrait charger les données géologiques', async () => {
    await service.loadGeologicalData()
    expect(service['geologicalData']).toBeDefined()
  })

  it('devrait interpoler les données', () => {
    service.interpolateData(100)
    expect(service['currentEpoch']).toBe(100)
    expect(service['nextEpoch']).toBe(101)
    expect(service['interpolationProgress']).toBe(0)
  })

  it('devrait mettre à jour la visualisation', () => {
    service.updateVisualization()
    // Vérifier que la méthode ne lance pas d'erreur
    expect(true).toBe(true)
  })
}) 