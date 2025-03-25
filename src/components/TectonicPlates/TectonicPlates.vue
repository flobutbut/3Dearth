<template>
  <div class="tectonic-plates">
    <div ref="container" class="plates-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const container = ref<HTMLElement | null>(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let platesGroup: THREE.Group;

const init = () => {
  if (!container.value) return;

  // Création de la scène
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Création de la caméra
  camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Création du renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  // Ajout des contrôles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 10;

  // Ajout des lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Création du groupe pour les plaques
  platesGroup = new THREE.Group();
  scene.add(platesGroup);

  // Chargement des données des plaques
  fetch('/data/gplates/parsed_data.json')
    .then(response => response.json())
    .then(data => {
      const platesData = data.Zahirovic2022;
      Object.entries(platesData.plateRotations).forEach(([plateId, rotations]: [string, any[]]) => {
        const geometry = new THREE.SphereGeometry(0.02, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
        });
        const plate = new THREE.Mesh(geometry, material);
        
        // Positionner le point sur le globe
        const position = new THREE.Vector3();
        position.setFromSpherical(new THREE.Spherical(1, 0, 0));
        plate.position.copy(position);
        
        platesGroup.add(plate);
      });
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données des plaques:', error);
    });

  // Animation
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};

// Gestion du redimensionnement
const handleResize = () => {
  if (!container.value) return;
  
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

onMounted(() => {
  init();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (container.value) {
    container.value.removeChild(renderer.domElement);
  }
});
</script>

<style scoped>
.tectonic-plates {
  width: 100%;
  height: 100%;
  position: relative;
}

.plates-container {
  width: 100%;
  height: 100%;
  background-color: #000;
}
</style> 