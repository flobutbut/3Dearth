<script setup lang="ts">
import Earth from '@/components/Earth/Earth.vue'
import Timeline from '@/components/Timeline/Timeline.vue'
</script>

<template>
  <div class="app">
    <div class="earth-container">
      <Earth />
    </div>
    <div class="timeline-container">
      <Timeline />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  position: relative;
}

.earth-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.timeline-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  padding: 1rem;
  box-sizing: border-box;
}
</style>
