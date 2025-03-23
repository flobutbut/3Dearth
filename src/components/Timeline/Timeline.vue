<template>
  <div class="timeline-container">
    <!-- Contrôles de lecture -->
    <div class="playback-controls">
      <button 
        class="control-button"
        @click="timelineStore.togglePlayback()"
        :title="timelineStore.isPlaying ? 'Pause' : 'Lecture'"
      >
        {{ timelineStore.isPlaying ? '⏸' : '▶' }}
      </button>
      <div class="speed-controls">
        <button 
          v-for="speed in [0.5, 1, 2, 5]" 
          :key="speed"
          class="speed-button"
          :class="{ active: timelineStore.playbackSpeed === speed }"
          @click="timelineStore.setPlaybackSpeed(speed)"
        >
          {{ speed }}x
        </button>
      </div>
    </div>

    <!-- Slider de la timeline -->
    <div class="timeline-slider">
      <input 
        type="range"
        :min="timelineStore.timeRange.min"
        :max="timelineStore.timeRange.max"
        :value="timelineStore.currentTime"
        @input="onTimeChange"
        step="1"
      >
      <div class="time-labels">
        <span>{{ formatTime(timelineStore.timeRange.min) }}</span>
        <span class="current-time">{{ timelineStore.currentTimeFormatted }}</span>
        <span>{{ formatTime(timelineStore.timeRange.max) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useTimelineStore } from '@/stores/timeline/timelineStore'

const timelineStore = useTimelineStore()

// Gestion de l'animation
let animationFrame: number | null = null

const animate = () => {
  if (timelineStore.isPlaying) {
    const newTime = timelineStore.currentTime + (timelineStore.playbackSpeed / 60)
    timelineStore.setCurrentTime(newTime)
    
    // Arrête la lecture si on atteint la fin
    if (newTime >= timelineStore.timeRange.max) {
      timelineStore.togglePlayback()
    }
  }
  animationFrame = requestAnimationFrame(animate)
}

// Formatage du temps
const formatTime = (time: number): string => {
  const absTime = Math.abs(time)
  return `${absTime} Ma${time < 0 ? ' passés' : ''}`
}

// Gestion du changement de temps via le slider
const onTimeChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  timelineStore.setCurrentTime(Number(target.value))
}

// Gestion du cycle de vie
onMounted(() => {
  animationFrame = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.timeline-container {
  width: 100%;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  max-width: 100%;
  overflow: hidden;
}

.control-button {
  background: none;
  border: 2px solid white;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
  justify-content: flex-start;
}

.speed-button {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.speed-button.active {
  background: white;
  color: black;
}

.timeline-slider {
  width: 100%;
  box-sizing: border-box;
}

input[type="range"] {
  width: 100%;
  margin: 1rem 0;
  box-sizing: border-box;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
  padding: 0 0.5rem;
}

.current-time {
  font-weight: bold;
  color: #4CAF50;
  text-align: center;
  flex: 1;
  margin: 0 1rem;
}
</style> 