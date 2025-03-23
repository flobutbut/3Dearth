import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Timeline from '@/components/Timeline/Timeline.vue'
import { useTimelineStore } from '@/stores/timeline/timelineStore'

describe('Timeline', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should mount successfully', () => {
    const wrapper = mount(Timeline)
    expect(wrapper.exists()).toBe(true)
  })

  it('should render playback controls', () => {
    const wrapper = mount(Timeline)
    expect(wrapper.find('.playback-controls').exists()).toBe(true)
    expect(wrapper.find('.control-button').exists()).toBe(true)
    expect(wrapper.find('.speed-controls').exists()).toBe(true)
  })

  it('should render timeline slider', () => {
    const wrapper = mount(Timeline)
    expect(wrapper.find('.timeline-slider').exists()).toBe(true)
    expect(wrapper.find('input[type="range"]').exists()).toBe(true)
    expect(wrapper.find('.time-labels').exists()).toBe(true)
  })

  it('should display correct time labels', () => {
    const wrapper = mount(Timeline)
    const labels = wrapper.findAll('.time-labels span')
    
    expect(labels).toHaveLength(3)
    expect(labels[0].text()).toBe('250 Ma passés')
    expect(labels[2].text()).toBe('0 Ma')
  })

  it('should toggle playback on button click', async () => {
    const wrapper = mount(Timeline)
    const button = wrapper.find('.control-button')
    
    // État initial
    expect(button.text()).toBe('▶')
    
    // Premier clic
    await button.trigger('click')
    expect(button.text()).toBe('⏸')
    
    // Deuxième clic
    await button.trigger('click')
    expect(button.text()).toBe('▶')
  })

  it('should change playback speed', async () => {
    const wrapper = mount(Timeline)
    const speedButtons = wrapper.findAll('.speed-button')
    
    // Test chaque bouton de vitesse
    for (const button of speedButtons) {
      await button.trigger('click')
      expect(button.classes()).toContain('active')
    }
  })

  it('should update time on slider change', async () => {
    const wrapper = mount(Timeline)
    const slider = wrapper.find('input[type="range"]')
    
    await slider.setValue(-100)
    expect(wrapper.find('.current-time').text()).toBe('100 Ma passés')
  })

  it('should start animation on mount and clean up on unmount', () => {
    const wrapper = mount(Timeline)
    
    // Vérifie que requestAnimationFrame a été appelé
    expect(vi.getTimerCount()).toBe(1)
    
    // Démonte le composant
    wrapper.unmount()
    
    // Vérifie que cancelAnimationFrame a été appelé
    expect(vi.getTimerCount()).toBe(0)
  })

  it('should animate time when playing', () => {
    const wrapper = mount(Timeline)
    const store = useTimelineStore()
    
    // Active la lecture
    store.togglePlayback()
    
    // Avance le temps
    vi.advanceTimersByTime(1000) // 1 seconde
    
    // Vérifie que le temps a été mis à jour
    expect(store.currentTime).not.toBe(0)
  })
}) 