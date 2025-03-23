<script setup lang="ts">
import Earth from '@/components/Earth/Earth.vue'
import Timeline from '@/components/Timeline/Timeline.vue'
</script>

<template>
  <div class="app">
    <Earth />
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
}
</style>
