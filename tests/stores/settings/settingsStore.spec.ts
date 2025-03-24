import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings/settingsStore'

describe('SettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const store = useSettingsStore()
    expect(store.visualization.quality).toBe('medium')
    expect(store.visualization.resolution).toBe(1)
    expect(store.colors.scheme).toBe('default')
    expect(store.camera.fov).toBe(45)
    expect(store.performance.enableShadows).toBe(true)
    expect(store.interface.language).toBe('fr')
  })

  it('should set quality and update resolution', () => {
    const store = useSettingsStore()
    
    store.setQuality('low')
    expect(store.visualization.quality).toBe('low')
    expect(store.visualization.resolution).toBe(0.5)

    store.setQuality('high')
    expect(store.visualization.quality).toBe('high')
    expect(store.visualization.resolution).toBe(2)
  })

  it('should set color scheme', () => {
    const store = useSettingsStore()
    store.setColorScheme('satellite')
    expect(store.colors.scheme).toBe('satellite')
  })

  it('should update custom colors', () => {
    const store = useSettingsStore()
    store.updateCustomColor('ocean', '#000000')
    expect(store.colors.customColors.ocean).toBe('#000000')
  })

  it('should set camera defaults', () => {
    const store = useSettingsStore()
    store.camera.fov = 60
    store.camera.near = 1
    store.camera.far = 500

    store.setCameraDefaults()
    expect(store.camera.fov).toBe(45)
    expect(store.camera.near).toBe(0.1)
    expect(store.camera.far).toBe(1000)
  })

  it('should toggle shadows', () => {
    const store = useSettingsStore()
    store.toggleShadows(false)
    expect(store.performance.enableShadows).toBe(false)
  })

  it('should set language', () => {
    const store = useSettingsStore()
    store.setLanguage('en')
    expect(store.interface.language).toBe('en')
  })

  it('should set theme', () => {
    const store = useSettingsStore()
    store.setTheme('dark')
    expect(store.interface.theme).toBe('dark')
  })

  it('should return effective theme based on system preference', () => {
    const store = useSettingsStore()
    store.interface.theme = 'auto'

    // Mock matchMedia pour simuler le thème système
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query
      }))
    })

    expect(store.effectiveTheme).toBe('dark')
  })

  it('should return effective theme based on user preference', () => {
    const store = useSettingsStore()
    store.interface.theme = 'light'
    expect(store.effectiveTheme).toBe('light')
  })

  it('should return effective quality based on performance', () => {
    const store = useSettingsStore()
    store.performance.autoQuality = true

    // Test pour FPS bas
    store.performance.maxFPS = 25
    expect(store.effectiveQuality).toBe('low')

    // Test pour FPS moyen
    store.performance.maxFPS = 40
    expect(store.effectiveQuality).toBe('medium')

    // Test pour FPS élevé
    store.performance.maxFPS = 60
    expect(store.effectiveQuality).toBe('high')
  })

  it('should return user-set quality when auto-quality is disabled', () => {
    const store = useSettingsStore()
    store.performance.autoQuality = false
    store.visualization.quality = 'high'
    store.performance.maxFPS = 25 // Devrait être ignoré

    expect(store.effectiveQuality).toBe('high')
  })

  it('should reset to defaults', () => {
    const store = useSettingsStore()
    
    // Modifier plusieurs paramètres
    store.visualization.quality = 'low'
    store.colors.scheme = 'satellite'
    store.camera.fov = 60
    store.performance.enableShadows = false
    store.interface.language = 'en'

    store.resetToDefaults()

    // Vérifier que tout est revenu aux valeurs par défaut
    expect(store.visualization.quality).toBe('medium')
    expect(store.colors.scheme).toBe('default')
    expect(store.camera.fov).toBe(45)
    expect(store.performance.enableShadows).toBe(true)
    expect(store.interface.language).toBe('fr')
  })
}) 