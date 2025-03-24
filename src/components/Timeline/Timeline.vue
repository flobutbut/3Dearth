<template>
  <div class="timeline">
    <div class="timeline-content">
      <div class="timeline-info">
        <div class="timeline-date">{{ currentDate }}</div>
        <div class="timeline-description">{{ currentDescription }}</div>
      </div>
      <div 
        class="timeline-progress"
        @mousedown="startDragging"
        @touchstart="startDragging"
      >
        <div 
          class="timeline-progress-bar"
          :style="{ width: `${progress}%` }"
        ></div>
        <div 
          class="timeline-progress-handle"
          :style="{ left: `${progress}%` }"
        ></div>
      </div>
      <div class="timeline-events">
        <div 
          v-for="event in events" 
          :key="event.timestamp"
          class="timeline-event-dot"
          :class="{ 'timeline-event-dot-active': currentEvent.timestamp === event.timestamp }"
          :style="{ left: `${getEventPosition(event.timestamp)}%` }"
          @click="goToEvent(event)"
        >
          <div class="timeline-event-tooltip">{{ event.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { typography, colors, spacing, layout } from '../../design/tokens'

interface TimelineEvent {
  date: string
  title: string
  description: string
  timestamp: number
}

const events: TimelineEvent[] = [
  {
    date: '4.5 Ga',
    title: 'Formation de la Terre',
    description: 'Accrétion des planétésimaux et formation de la Terre primitive',
    timestamp: 4500000000
  },
  {
    date: '4.0 Ga',
    title: 'Premiers océans',
    description: 'Formation des premiers océans et début de la tectonique des plaques',
    timestamp: 4000000000
  },
  {
    date: '3.5 Ga',
    title: 'Première vie',
    description: 'Apparition des premières formes de vie unicellulaires',
    timestamp: 3500000000
  },
  {
    date: '2.5 Ga',
    title: 'Grande oxydation',
    description: 'Augmentation significative de l\'oxygène dans l\'atmosphère',
    timestamp: 2500000000
  },
  {
    date: '1.0 Ga',
    title: 'Supercontinent Rodinia',
    description: 'Formation du supercontinent Rodinia',
    timestamp: 1000000000
  },
  {
    date: '0.5 Ga',
    title: 'Explosion cambrienne',
    description: 'Diversification rapide des formes de vie complexes',
    timestamp: 500000000
  },
  {
    date: '0.2 Ga',
    title: 'Dinosaures',
    description: 'Âge des dinosaures et formation de la Pangée',
    timestamp: 200000000
  },
  {
    date: '0.065 Ga',
    title: 'Extinction K-T',
    description: 'Extinction des dinosaures et début de l\'ère des mammifères',
    timestamp: 65000000
  },
  {
    date: '0.002 Ga',
    title: 'Époque moderne',
    description: 'Apparition des premiers humains et développement de la civilisation',
    timestamp: 2000000
  }
]

const currentPosition = ref(0)
const isDragging = ref(false)

const getCurrentTimestamp = (percentage: number): number => {
  const maxTime = events[0].timestamp
  const minTime = events[events.length - 1].timestamp
  return minTime + (percentage / 100) * (maxTime - minTime)
}

const getEventPosition = (timestamp: number): number => {
  const maxTime = events[0].timestamp
  const minTime = events[events.length - 1].timestamp
  return 100 - ((timestamp - minTime) / (maxTime - minTime)) * 100
}

const findClosestEvent = (timestamp: number) => {
  return events.reduce((closest, event) => {
    const currentDiff = Math.abs(event.timestamp - timestamp)
    const closestDiff = Math.abs(closest.timestamp - timestamp)
    return currentDiff < closestDiff ? event : closest
  }, events[0])
}

const currentEvent = computed(() => {
  const timestamp = getCurrentTimestamp(100 - currentPosition.value)
  return findClosestEvent(timestamp)
})

const currentDate = computed(() => currentEvent.value.date)
const currentDescription = computed(() => currentEvent.value.description)
const progress = computed(() => currentPosition.value)

const startDragging = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true
  handleDrag(event)
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const timeline = document.querySelector('.timeline-progress') as HTMLElement
  if (!timeline) return
  const rect = timeline.getBoundingClientRect()
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const x = clientX - rect.left
  currentPosition.value = Math.max(0, Math.min(100, (x / rect.width) * 100))
}

const stopDragging = () => {
  isDragging.value = false
}

const goToEvent = (event: TimelineEvent) => {
  currentPosition.value = getEventPosition(event.timestamp)
}

onMounted(() => {
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchmove', handleDrag)
  window.addEventListener('touchend', stopDragging)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', stopDragging)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', stopDragging)
})
</script>

<style scoped>
.timeline {
  padding: v-bind('spacing[4]') v-bind('spacing[4]') v-bind('spacing[2]') v-bind('spacing[4]');
  background: v-bind('colors.gray[50]');
  border-radius: v-bind('layout.borderRadius.lg');
  box-shadow: v-bind('layout.boxShadow.md');
  height: fit-content;
}

.timeline-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: v-bind('spacing[2]');
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.timeline-progress {
  height: 4px;
  background: v-bind('colors.gray[200]');
  border-radius: v-bind('layout.borderRadius.full');
  overflow: visible;
  position: relative;
  cursor: pointer;
}

.timeline-progress-bar {
  height: 100%;
  background: v-bind('colors.primary[500]');
  transition: width 0.3s ease;
  position: relative;
}

.timeline-progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: v-bind('colors.primary[500]');
  border-radius: v-bind('layout.borderRadius.full');
  cursor: grab;
  box-shadow: v-bind('layout.boxShadow.sm');
  transition: transform 0.2s;
  z-index: 1;
}

.timeline-progress-handle:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

.timeline-events {
  position: relative;
  height: 24px;
  width: 100%;
  margin-top: v-bind('spacing[2]');
}

.timeline-event-dot {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: v-bind('colors.gray[300]');
  border-radius: v-bind('layout.borderRadius.full');
  cursor: pointer;
  z-index: 2;
}

.timeline-event-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: v-bind('spacing[1]') v-bind('spacing[2]');
  background: v-bind('colors.gray[900]');
  color: v-bind('colors.gray[100]');
  border-radius: v-bind('layout.borderRadius.md');
  font-size: v-bind('typography.fontSize.sm');
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 3;
}

.timeline-event-dot:hover {
  background: v-bind('colors.primary[500]');
}

.timeline-event-dot:hover .timeline-event-tooltip {
  opacity: 1;
  visibility: visible;
}

.timeline-event-dot-active {
  background: v-bind('colors.primary[500]');
}

.timeline-date {
  font-family: v-bind('typography.fontFamily.mono');
  font-size: v-bind('typography.fontSize.lg');
  font-weight: v-bind('typography.fontWeight.bold');
  color: v-bind('colors.gray[900]');
}

.timeline-description {
  font-family: v-bind('typography.fontFamily.sans');
  font-size: v-bind('typography.fontSize.base');
  color: v-bind('colors.gray[600]');
  max-width: 60%;
}

/* Mode sombre */
:root[data-theme="dark"] {
  .timeline {
    background: v-bind('colors.gray[800]');
  }

  .timeline-date {
    color: v-bind('colors.gray[100]');
  }

  .timeline-description {
    color: v-bind('colors.gray[400]');
  }

  .timeline-event-dot {
    background: v-bind('colors.gray[600]');
  }

  .timeline-event-tooltip {
    background: v-bind('colors.gray[100]');
    color: v-bind('colors.gray[900]');
  }
}
</style> 