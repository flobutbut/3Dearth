<script setup lang="ts">
import Earth from './components/Earth.vue'
import Timeline from './components/Timeline/Timeline.vue'
</script>

<template>
  <div class="app">
    <div class="earth-container">
      <Earth />
    </div>
    <Timeline />
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
  display: flex;
  flex-direction: column;
}

.earth-container {
  flex: 1;
  position: relative;
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
