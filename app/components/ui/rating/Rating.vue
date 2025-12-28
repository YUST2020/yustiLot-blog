<script setup lang="ts">
import { computed } from 'vue'
import { Star, StarHalf } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

interface Props {
  modelValue: number // 0-10
  max?: number // 10
  readonly?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  max: 10,
  size: 'md'
})

const emit = defineEmits(['update:modelValue', 'change'])

const stars = computed(() => props.max / 2)

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}

const handleMouseMove = (event: MouseEvent, index: number) => {
  if (props.readonly || props.disabled) return
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const isHalf = x < rect.width / 2
  
  // No-op for now, just visual feedback if we wanted it
}

const handleClick = (event: MouseEvent, index: number) => {
  if (props.readonly || props.disabled) return
  
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const isHalf = x < rect.width / 2
  
  const newValue = isHalf ? (index * 2) - 1 : index * 2
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const getStarType = (index: number) => {
  const starValue = index * 2
  if (props.modelValue >= starValue) return 'full'
  if (props.modelValue === starValue - 1) return 'half'
  return 'empty'
}
</script>

<template>
  <div 
    :class="cn(
      'flex items-center gap-1',
      disabled && 'opacity-50 cursor-not-allowed',
      !readonly && !disabled && 'cursor-pointer'
    )"
  >
    <div
      v-for="i in stars"
      :key="i"
      class="relative transition-transform active:scale-90"
      @click="handleClick($event, i)"
    >
      <Star
        v-if="getStarType(i) === 'full'"
        :class="cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')"
      />
      <StarHalf
        v-else-if="getStarType(i) === 'half'"
        :class="cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')"
      />
      <Star
        v-else
        :class="cn(sizeClasses[size], 'text-muted-foreground/30')"
      />
    </div>
  </div>
</template>
