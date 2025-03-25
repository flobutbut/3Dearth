<template>
  <div ref="container" class="earth-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PlateRotationService } from '@/services/geological/PlateRotationService'

// Références
const container = ref<HTMLElement | null>(null)

// Variables Three.js (non réactives)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let earth: THREE.Mesh
let continents: THREE.Group
let boundaries: THREE.Group
let animationFrameId: number

// Configuration
const EARTH_RADIUS = 5
const SEGMENTS = 64
const RINGS = 64

// Ajout des constantes pour les plaques
const PLATE_OPACITY = 0.8
const BOUNDARY_OPACITY = 0.4
const BOUNDARY_WIDTH = 1

// Initialisation de la scène
const initScene = () => {
  // Création de la scène
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Création de la caméra
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 15

  // Création du renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.value?.appendChild(renderer.domElement)

  // Création des contrôles
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 5
  controls.maxDistance = 50
  controls.maxPolarAngle = Math.PI
  controls.rotateSpeed = 0.5

  // Création de la Terre
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, SEGMENTS, RINGS)
  const material = new THREE.MeshPhongMaterial({
    color: 0x1e4d6b,
    shininess: 5,
    specular: 0x111111,
    transparent: true,
    opacity: 0.9
  })
  earth = new THREE.Mesh(geometry, material)
  scene.add(earth)

  // Création des groupes
  continents = new THREE.Group()
  boundaries = new THREE.Group()
  scene.add(continents)
  scene.add(boundaries)

  // Ajout des lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(5, 3, 5)
  scene.add(directionalLight)

  const secondaryLight = new THREE.DirectionalLight(0xffffff, 1.0)
  secondaryLight.position.set(-5, -3, -5)
  scene.add(secondaryLight)

  // Chargement des plaques
  loadPlates()
}

// Fonction utilitaire pour convertir lat/lon en coordonnées 3D
const latLonToXYZ = (lon: number, lat: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * Math.PI / 180
  const theta = (lon + 180) * Math.PI / 180
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Fonction pour créer une géométrie de continent
const createContinentGeometry = (coordinates: number[][], radius: number): THREE.BufferGeometry => {
  // Convertir les coordonnées en points 3D
  const points: THREE.Vector3[] = coordinates.map(coord => 
    latLonToXYZ(coord[1], coord[0], radius) // Inverser lat/lon car les données sont [lat, lon]
  )

  // Créer la géométrie
  const geometry = new THREE.BufferGeometry()
  
  // Ajouter les positions
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(
    points.flatMap(p => [p.x, p.y, p.z]),
    3
  ))

  // Calculer le centre du polygone
  const center = new THREE.Vector3()
  points.forEach(p => center.add(p))
  center.divideScalar(points.length)
  
  // Normaliser le centre pour qu'il soit sur la surface de la sphère
  center.normalize().multiplyScalar(radius)
  
  // Créer les triangles en utilisant une triangulation radiale
  const indices: number[] = []
  
  // Pour chaque point sauf le dernier, créer un triangle avec le centre et le point suivant
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    
    // Ajouter le triangle (centre, point actuel, point suivant)
    indices.push(
      points.length, // index du centre
      i,
      j
    )
  }
  
  // Ajouter le centre comme dernier point
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(
    [...points.flatMap(p => [p.x, p.y, p.z]), center.x, center.y, center.z],
    3
  ))
  
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

// Fonction pour créer une géométrie de frontière
const createBoundaryGeometry = (coordinates: number[][], radius: number): THREE.BufferGeometry => {
  // Convertir les coordonnées en points 3D
  const points: THREE.Vector3[] = coordinates.map(coord => 
    latLonToXYZ(coord[1], coord[0], radius) // Inverser lat/lon car les données sont [lat, lon]
  )

  // Créer la géométrie
  const geometry = new THREE.BufferGeometry()
  
  // Ajouter les positions
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(
    points.flatMap(p => [p.x, p.y, p.z]),
    3
  ))

  return geometry
}

// Chargement des plaques
const loadPlates = async () => {
  try {
    const response = await fetch('/data/gplates/parsed_data.json')
    const data = await response.json()
    
    console.log('Structure des données reçues:', Object.keys(data))
    console.log('Données complètes:', data)
    
    // Chargement des continents
    if (data.ContinentalPolygons) {
      console.log('Données ContinentalPolygons:', data.ContinentalPolygons)
      console.log('Métadonnées:', data.ContinentalPolygons.metadata)
      
      if (Array.isArray(data.ContinentalPolygons.metadata?.plateIds)) {
        console.log('Nombre de polygones continentaux:', data.ContinentalPolygons.metadata.count)
        console.log('IDs des plaques:', data.ContinentalPolygons.metadata.plateIds)
        
        // Créer un matériau par plaque
        const plateMaterials = new Map<number, THREE.Material>()
        data.ContinentalPolygons.metadata.plateIds.forEach((plateId: number) => {
          plateMaterials.set(plateId, new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
            transparent: true,
            opacity: PLATE_OPACITY,
            side: THREE.DoubleSide,
            depthWrite: true
          }))
        })

        // Ajouter les polygones
        if (Array.isArray(data.ContinentalPolygons.polygons)) {
          console.log('Nombre de polygones à traiter:', data.ContinentalPolygons.polygons.length)
          data.ContinentalPolygons.polygons.forEach((polygon: any, index: number) => {
            console.log(`Traitement du polygone ${index}:`, polygon)
            if (!polygon.coordinates || polygon.coordinates.length < 3) {
              console.log(`Polygone ${index} ignoré: pas assez de coordonnées`)
              return
            }

            const geometry = createContinentGeometry(polygon.coordinates, EARTH_RADIUS)
            const material = plateMaterials.get(polygon.plateId) || new THREE.MeshPhongMaterial({
              color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
              transparent: true,
              opacity: PLATE_OPACITY,
              side: THREE.DoubleSide,
              depthWrite: true
            })

            const mesh = new THREE.Mesh(geometry, material)
            mesh.userData.plateId = polygon.plateId
            mesh.userData.name = polygon.name || `Continent ${index}`
            mesh.renderOrder = 1
            continents.add(mesh)
          })
        } else {
          console.error('Les polygones ne sont pas un tableau:', data.ContinentalPolygons.polygons)
        }
        console.log('Continents ajoutés à la scène:', continents.children.length)
      } else {
        console.error('Les IDs des plaques ne sont pas un tableau:', data.ContinentalPolygons.metadata?.plateIds)
      }
    } else {
      console.error('Pas de données ContinentalPolygons')
    }

    // Chargement des frontières (zones de fracture)
    if (data.FractureZones && Array.isArray(data.FractureZones.metadata?.plateIds)) {
      console.log('Nombre de zones de fracture:', data.FractureZones.metadata.count)
      data.FractureZones.polygons.forEach((fracture: any, index: number) => {
        if (!fracture.coordinates || fracture.coordinates.length < 2) {
          console.log(`Fracture ${index} ignorée: pas assez de coordonnées`)
          return
        }

        const geometry = createBoundaryGeometry(fracture.coordinates, EARTH_RADIUS)
        const material = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: BOUNDARY_OPACITY,
          linewidth: BOUNDARY_WIDTH,
          depthWrite: false
        })

        const line = new THREE.Line(geometry, material)
        line.userData.plateId = fracture.plateId
        line.userData.name = fracture.name || `Fracture ${index}`
        line.renderOrder = 0
        boundaries.add(line)
      })
      console.log('Frontières ajoutées à la scène:', boundaries.children.length)
    }

    // Chargement des rotations
    if (data.Zahirovic2022 && data.Zahirovic2022.rotations) {
      const rotationService = PlateRotationService.getInstance()
      await rotationService.loadRotations(data.Zahirovic2022.rotations)
      
      // Mettre à jour la timeline avec la plage de temps
      const timeRange = rotationService.getTimeRange()
      console.log('Plage de temps:', timeRange)
      
      // Émettre un événement pour mettre à jour la timeline
      window.dispatchEvent(new CustomEvent('timerange-updated', {
        detail: timeRange
      }))
    }

    // Ajuster la position de la caméra pour mieux voir les plaques
    camera.position.set(0, 0, EARTH_RADIUS * 3)
    camera.lookAt(0, 0, 0)

    console.log('Données GPlates chargées avec succès')
  } catch (error) {
    console.error('Erreur lors du chargement des plaques:', error)
  }
}

// Fonction pour mettre à jour les rotations des plaques
const updatePlateRotations = (time: number) => {
  const rotationService = PlateRotationService.getInstance()
  rotationService.setCurrentTime(time)

  // Mettre à jour les continents
  continents.children.forEach((child: THREE.Object3D) => {
    const plateId = child.userData.plateId
    if (plateId) {
      const matrix = rotationService.getRotationMatrixForPlate(plateId)
      child.matrix.copy(matrix)
      child.matrixAutoUpdate = false
    }
  })

  // Mettre à jour les frontières
  boundaries.children.forEach((child: THREE.Object3D) => {
    const plateId = child.userData.plateId
    if (plateId) {
      const matrix = rotationService.getRotationMatrixForPlate(plateId)
      child.matrix.copy(matrix)
      child.matrixAutoUpdate = false
    }
  })
}

// Écouter les changements de temps
window.addEventListener('time-changed', ((event: CustomEvent) => {
  updatePlateRotations(event.detail.time)
}) as EventListener)

// Animation
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  
  // Rotation lente de la Terre
  earth.rotation.y += 0.001
  continents.rotation.y += 0.001
  boundaries.rotation.y += 0.001
  
  controls.update()
  renderer.render(scene, camera)
}

// Gestion du redimensionnement
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Cycle de vie
onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  renderer.dispose()
})
</script>

<style scoped>
.earth-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000000;
}
</style> 