<template>
  <div ref="container" class="earth-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import elevationService from '@/services/elevation/ElevationService'
import colorService from '@/services/color/ColorService'
import { useTimelineStore } from '@/stores/timeline/timelineStore'
import geologicalService from '@/services/geological/GeologicalService'

const container = ref<HTMLElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let sphere: THREE.Mesh

const timelineStore = useTimelineStore()

const init = async () => {
  if (!container.value) return

  // Configuration de base de Three.js
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  )
  
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
  container.value.appendChild(renderer.domElement)

  // Chargement des données d'élévation
  await elevationService.loadElevationData()

  // Création de la sphère de base
  const geometry = new THREE.SphereGeometry(5, 128, 128)
  
  // Application de l'élévation à la géométrie
  elevationService.applyElevationToGeometry(geometry)

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 5,
    specular: new THREE.Color(0x111111),
  })
  
  // Application des couleurs basées sur l'élévation réelle
  colorService.applyColorsToGeometry(geometry, (lat, lon) => {
    const elevation = elevationService.getElevationAtPoint(lat, lon)
    return elevation
  })
  
  sphere = new THREE.Mesh(geometry, material)
  scene.add(sphere)

  // Configuration de la caméra et des lumières
  camera.position.set(0, 0, 15)
  
  // Ajout de la lumière
  const ambientLight = new THREE.AmbientLight(0x666666)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1).normalize()
  scene.add(directionalLight)

  const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
  backLight.position.set(-1, -1, -1).normalize()
  scene.add(backLight)

  // Configuration des contrôles
  controls = new OrbitControls(camera, renderer.domElement)
  
  // Configuration du comportement des contrôles
  controls.enableDamping = true        // Animation fluide
  controls.dampingFactor = 0.05        // Vitesse d'amortissement
  controls.rotateSpeed = 0.5           // Vitesse de rotation
  controls.enableZoom = true           // Activation du zoom
  controls.zoomSpeed = 1.0             // Vitesse du zoom
  controls.minDistance = 7             // Distance minimale de zoom (plus près de la Terre)
  controls.maxDistance = 30            // Distance maximale de zoom (plus loin de la Terre)
  controls.enablePan = false           // Désactivation du déplacement latéral
  controls.autoRotate = false          // Rotation automatique désactivée par défaut
  controls.autoRotateSpeed = 0.5       // Vitesse de rotation automatique si activée

  // Gestion du redimensionnement
  window.addEventListener('resize', onWindowResize)
}

const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  if (!container.value) return
  camera.aspect = container.value.clientWidth / container.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(container.value.clientWidth, container.value.clientHeight)
}

// Mise à jour de la géométrie en fonction du temps
watch(() => timelineStore.currentTime, async (newTime) => {
  await geologicalService.loadEpochData(newTime)
  geologicalService.applyToGeometry(sphere.geometry as THREE.SphereGeometry, newTime)
  
  // Recalcul des couleurs basé sur la nouvelle géométrie
  colorService.applyColorsToGeometry(
    sphere.geometry as THREE.SphereGeometry,
    (lat, lon) => elevationService.getElevationAtPoint(lat, lon)
  )
})

onMounted(async () => {
  await init()
  animate()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  if (container.value) {
    container.value.removeChild(renderer.domElement)
  }
})
</script>

<style scoped>
.earth-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style> 