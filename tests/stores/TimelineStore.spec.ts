import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTimelineStore } from '@/stores/timeline/timelineStore'

describe('TimelineStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default values', () => {
    const store = useTimelineStore()
    expect(store.currentTime).toBe(0)
    expect(store.isPlaying).toBe(false)
    expect(store.playbackSpeed).toBe(1)
    expect(store.timeRange.min).toBe(-250)
    expect(store.timeRange.max).toBe(0)
  })

  it('should format current time correctly', () => {
    const store = useTimelineStore()
    
    // Test temps présent
    store.setCurrentTime(0)
    expect(store.currentTimeFormatted).toBe('0 Ma')
    
    // Test temps passé
    store.setCurrentTime(-100)
    expect(store.currentTimeFormatted).toBe('100 Ma passés')
  })

  it('should calculate time progress correctly', () => {
    const store = useTimelineStore()
    
    // Test début de la timeline
    store.setCurrentTime(-250)
    expect(store.timeProgress).toBe(0)
    
    // Test milieu de la timeline
    store.setCurrentTime(-125)
    expect(store.timeProgress).toBe(50)
    
    // Test fin de la timeline
    store.setCurrentTime(0)
    expect(store.timeProgress).toBe(100)
  })

  it('should set current time within bounds', () => {
    const store = useTimelineStore()
    
    // Test limite inférieure
    store.setCurrentTime(-300)
    expect(store.currentTime).toBe(-250)
    
    // Test limite supérieure
    store.setCurrentTime(50)
    expect(store.currentTime).toBe(0)
    
    // Test valeur valide
    store.setCurrentTime(-125)
    expect(store.currentTime).toBe(-125)
  })

  it('should toggle playback', () => {
    const store = useTimelineStore()
    expect(store.isPlaying).toBe(false)
    
    store.togglePlayback()
    expect(store.isPlaying).toBe(true)
    
    store.togglePlayback()
    expect(store.isPlaying).toBe(false)
  })

  it('should set playback speed', () => {
    const store = useTimelineStore()
    
    store.setPlaybackSpeed(2)
    expect(store.playbackSpeed).toBe(2)
    
    store.setPlaybackSpeed(0.5)
    expect(store.playbackSpeed).toBe(0.5)
  })

  it('should update time range and adjust current time if needed', () => {
    const store = useTimelineStore()
    
    // Test avec temps actuel dans les nouvelles limites
    store.setCurrentTime(-100)
    store.updateTimeRange(-200, -50)
    expect(store.timeRange.min).toBe(-200)
    expect(store.timeRange.max).toBe(-50)
    expect(store.currentTime).toBe(-100)
    
    // Test avec temps actuel hors des nouvelles limites
    store.updateTimeRange(-75, 0)
    expect(store.currentTime).toBe(-75) // Ajusté à la nouvelle limite min
  })
}) 