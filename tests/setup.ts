import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Configuration globale pour @vue/test-utils
config.global.stubs = {
  transition: false,
  'transition-group': false,
}

// Mock pour WebGL
const mockWebGLContext = {
  canvas: null,
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
  getExtension: () => null,
  getParameter: () => null,
  getShaderPrecisionFormat: () => ({
    precision: 1,
    rangeMin: 1,
    rangeMax: 1,
  }),
}

// Mock pour HTMLCanvasElement
class MockCanvas {
  getContext(contextId: string) {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return mockWebGLContext
    }
    return null
  }
}

// Mock pour Three.js
vi.mock('three', () => {
  return {
    Scene: vi.fn(),
    PerspectiveCamera: vi.fn(),
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
    SphereGeometry: vi.fn(),
    MeshPhongMaterial: vi.fn(),
    Mesh: vi.fn(),
    AmbientLight: vi.fn(),
    PointLight: vi.fn(),
    TextureLoader: vi.fn(() => ({
      load: vi.fn(),
    })),
    Vector3: vi.fn(() => ({
      multiplyScalar: vi.fn(),
    })),
    Spherical: vi.fn(() => ({
      setFromVector3: vi.fn(),
    })),
  }
})

// Mock pour OrbitControls
vi.mock('three/addons/controls/OrbitControls.js', () => {
  return {
    OrbitControls: vi.fn(() => ({
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
    })),
  }
})

// Configuration globale
Object.defineProperty(window, 'HTMLCanvasElement', { value: MockCanvas })
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
}) 