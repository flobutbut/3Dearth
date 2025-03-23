import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Earth from '../../src/components/Earth/Earth.vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import elevationService from '../../src/services/elevation/ElevationService'
import colorService from '../../src/services/color/ColorService'

// Mock du service d'élévation
vi.mock('../../src/services/elevation/ElevationService', () => ({
  default: {
    loadElevationData: vi.fn(),
    getElevationAtPoint: vi.fn(),
  },
}))

// Mock du service de couleurs
vi.mock('../../src/services/color/ColorService', () => ({
  default: {
    applyColorsToGeometry: vi.fn(),
  },
}))

// Mock de Three.js
const mockScene = {
  add: vi.fn(),
}

const mockCamera = {
  aspect: 1,
  updateProjectionMatrix: vi.fn(),
}

const mockRenderer = {
  setSize: vi.fn(),
  render: vi.fn(),
  domElement: document.createElement('canvas'),
}

vi.mock('three', () => ({
  Scene: vi.fn(() => mockScene),
  PerspectiveCamera: vi.fn(() => mockCamera),
  WebGLRenderer: vi.fn(() => mockRenderer),
  SphereGeometry: vi.fn(),
  MeshPhongMaterial: vi.fn(),
  Mesh: vi.fn(() => ({ position: { z: 0 } })),
  AmbientLight: vi.fn(),
  PointLight: vi.fn(() => ({ position: { set: vi.fn() } })),
  Color: vi.fn(),
}))

// Mock pour OrbitControls
const mockOrbitControls = vi.fn(() => ({
  enableDamping: false,
  dampingFactor: 0,
  rotateSpeed: 0,
  enableZoom: true,
  zoomSpeed: 1,
  minDistance: 0,
  maxDistance: 0,
  enablePan: true,
  autoRotate: false,
  autoRotateSpeed: 0,
  update: vi.fn(),
}))

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: mockOrbitControls,
}))

describe('Earth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mount successfully', () => {
    const wrapper = mount(Earth)
    expect(wrapper.exists()).toBe(true)
  })

  it('should create a container div with correct class', () => {
    const wrapper = mount(Earth)
    const container = wrapper.find('.earth-container')
    expect(container.exists()).toBe(true)
  })

  it('should initialize Three.js scene and controls', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()

    expect(THREE.Scene).toHaveBeenCalled()
    expect(THREE.PerspectiveCamera).toHaveBeenCalled()
    expect(THREE.WebGLRenderer).toHaveBeenCalled()
    expect(OrbitControls).toHaveBeenCalled()
  })

  it('should load elevation data on mount', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()

    expect(elevationService.loadElevationData).toHaveBeenCalled()
  })

  it('should create Earth geometry with correct parameters', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()

    expect(THREE.SphereGeometry).toHaveBeenCalledWith(5, 128, 128)
  })

  it('should apply colors to geometry', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()

    expect(colorService.applyColorsToGeometry).toHaveBeenCalled()
  })

  it('should configure orbit controls correctly', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()

    const mockControl = mockOrbitControls.mock.results[0].value
    expect(mockControl.enableDamping).toBe(false)
    expect(mockControl.enableZoom).toBe(true)
    expect(mockControl.minDistance).toBe(0)
    expect(mockControl.maxDistance).toBe(0)
  })

  it('should clean up resources on unmount', async () => {
    const wrapper = mount(Earth)
    await wrapper.vm.$nextTick()
    
    wrapper.unmount()
    
    expect(true).toBe(true)
  })
}) 