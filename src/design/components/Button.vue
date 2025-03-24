<template>
  <button
    :class="[
      'btn',
      `btn-${props.variant}`,
      `btn-${props.size}`,
      { 'btn-icon': props.icon },
      { 'btn-loading': props.loading }
    ]"
    :disabled="props.disabled || props.loading"
    @click="$emit('click', $event)"
  >
    <span v-if="props.loading" class="btn-spinner">
      <component :is="LoaderIcon" class="animate-spin" />
    </span>
    <component v-else-if="props.icon" :is="props.icon" :size="iconSize" />
    <span v-if="$slots.default" :class="{ 'ml-2': props.icon && !props.iconOnly }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, defineProps, withDefaults } from 'vue'
import { Loader2 as LoaderIcon } from 'lucide-vue-next'
import { typography, layout, lightTheme, darkTheme } from '../tokens'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: any
  iconOnly?: boolean
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  loading: false,
  disabled: false
})

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm': return 16
    case 'lg': return 24
    default: return 20
  }
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: v-bind('typography.fontFamily.sans');
  font-weight: v-bind('typography.fontWeight.medium');
  border-radius: v-bind('layout.borderRadius.default');
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Tailles */
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: v-bind('typography.fontSize.sm');
}

.btn-md {
  height: 40px;
  padding: 0 16px;
  font-size: v-bind('typography.fontSize.base');
}

.btn-lg {
  height: 48px;
  padding: 0 20px;
  font-size: v-bind('typography.fontSize.lg');
}

/* Variantes - Mode clair */
:root[data-theme="light"] {
  .btn-primary {
    background: v-bind('lightTheme.accent.primary');
    color: white;
    border: none;
  }
  .btn-primary:hover:not(:disabled) {
    background: v-bind('lightTheme.accent.hover');
  }
  .btn-primary:active:not(:disabled) {
    background: v-bind('lightTheme.accent.active');
  }

  .btn-secondary {
    background: v-bind('lightTheme.background.secondary');
    color: v-bind('lightTheme.text.primary');
    border: 1px solid v-bind('lightTheme.border.default');
  }
  .btn-secondary:hover:not(:disabled) {
    background: v-bind('lightTheme.background.tertiary');
  }

  .btn-outline {
    background: transparent;
    color: v-bind('lightTheme.accent.primary');
    border: 1px solid v-bind('lightTheme.accent.primary');
  }
  .btn-outline:hover:not(:disabled) {
    background: v-bind('lightTheme.accent.primary');
    color: white;
  }

  .btn-ghost {
    background: transparent;
    color: v-bind('lightTheme.text.primary');
    border: none;
  }
  .btn-ghost:hover:not(:disabled) {
    background: v-bind('lightTheme.background.secondary');
  }
}

/* Variantes - Mode sombre */
:root[data-theme="dark"] {
  .btn-primary {
    background: v-bind('darkTheme.accent.primary');
    color: white;
    border: none;
  }
  .btn-primary:hover:not(:disabled) {
    background: v-bind('darkTheme.accent.hover');
  }
  .btn-primary:active:not(:disabled) {
    background: v-bind('darkTheme.accent.active');
  }

  .btn-secondary {
    background: v-bind('darkTheme.background.secondary');
    color: v-bind('darkTheme.text.primary');
    border: 1px solid v-bind('darkTheme.border.default');
  }
  .btn-secondary:hover:not(:disabled) {
    background: v-bind('darkTheme.background.tertiary');
  }

  .btn-outline {
    background: transparent;
    color: v-bind('darkTheme.accent.primary');
    border: 1px solid v-bind('darkTheme.accent.primary');
  }
  .btn-outline:hover:not(:disabled) {
    background: v-bind('darkTheme.accent.primary');
    color: white;
  }

  .btn-ghost {
    background: transparent;
    color: v-bind('darkTheme.text.primary');
    border: none;
  }
  .btn-ghost:hover:not(:disabled) {
    background: v-bind('darkTheme.background.secondary');
  }
}

/* États spéciaux */
.btn-icon {
  padding: 0;
  &.btn-sm { width: 32px; }
  &.btn-md { width: 40px; }
  &.btn-lg { width: 48px; }
}

.btn-loading {
  position: relative;
  pointer-events: none;
}

.btn-spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 