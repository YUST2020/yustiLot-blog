=<script setup lang="ts">
import { useMouse, useWindowSize, useRafFn } from '@vueuse/core'

interface Props {
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'rose'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue'
})

// Particle Animation Logic
const { width, height } = useWindowSize()
const { x: mouseX, y: mouseY } = useMouse()

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

const particles = ref<Particle[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)

const initParticles = () => {
  if (width.value <= 0 || height.value <= 0) return

  particles.value = Array.from({ length: 100 }, () => ({
    x: Math.random() * width.value,
    y: Math.random() * height.value,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    size: Math.random() * 2 + 1
  }))
}

// Watch for dimension changes to re-init if needed (e.g. on first load)
watch([width, height], ([newW, newH]) => {
  if (newW > 0 && newH > 0 && particles.value.length === 0) {
    initParticles()
  }
})

onMounted(() => {
  if (width.value > 0 && height.value > 0) {
    initParticles()
  }
})

const { pause, resume } = useRafFn(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Ensure canvas dimensions match window size
  if (canvas.value.width !== width.value || canvas.value.height !== height.value) {
    canvas.value.width = width.value
    canvas.value.height = height.value
  }

  ctx.clearRect(0, 0, width.value, height.value)
  
  // Update and draw particles
  const particleColor = '255, 255, 255' // Always white for better contrast

  particles.value.forEach((p, i) => {
    p.x += p.vx
    p.y += p.vy

    if (p.x < 0 || p.x > width.value) p.vx *= -1
    if (p.y < 0 || p.y > height.value) p.vy *= -1

    // Draw particle
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${particleColor}, 0.3)`
    ctx.fill()

    // Connect particles
    particles.value.slice(i + 1).forEach(p2 => {
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 150) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = `rgba(${particleColor}, ${0.1 * (1 - dist / 150)})`
        ctx.stroke()
      }
    })

    // Connect to mouse
    const dx = p.x - mouseX.value
    const dy = p.y - mouseY.value
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    if (dist < 200) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(mouseX.value, mouseY.value)
        ctx.strokeStyle = `rgba(${particleColor}, ${0.15 * (1 - dist / 200)})`
        ctx.stroke()
    }
  })
})

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const lightGradientClasses = computed(() => {
  switch (props.variant) {
    case 'blue':
      return 'from-blue-400 via-indigo-300 to-purple-300'
    case 'purple':
      return 'from-fuchsia-500 via-purple-400 to-indigo-400'
    case 'green':
      return 'from-emerald-500 via-teal-400 to-cyan-300'
    case 'orange':
      return 'from-orange-400 via-amber-300 to-yellow-300'
    case 'rose':
      return 'from-rose-400 via-pink-300 to-fuchsia-300'
    default:
      return 'from-blue-400 via-indigo-300 to-purple-300'
  }
})

const darkGradientClasses = computed(() => {
  switch (props.variant) {
    case 'blue':
      return 'from-slate-900 via-blue-950 to-slate-900'
    case 'purple':
      return 'from-slate-950 via-purple-950 to-indigo-950'
    case 'green':
      return 'from-green-950 via-emerald-950 to-teal-950'
    case 'orange':
      return 'from-orange-950 via-amber-950 to-yellow-950'
    case 'rose':
      return 'from-slate-950 via-rose-950 to-pink-950'
    default:
      return 'from-slate-900 via-blue-950 to-slate-900'
  }
})
</script>

<template>
  <div 
    class="relative min-h-screen w-full pt-24 pb-16 transition-colors duration-500"
  >
    <!-- Background Layers with Cross-fade -->
    <div 
      class="fixed inset-0 bg-gradient-to-br transition-opacity duration-700 ease-in-out"
      :class="[lightGradientClasses, isDark ? 'opacity-0' : 'opacity-100']"
    ></div>
    <div 
      class="fixed inset-0 bg-gradient-to-br transition-opacity duration-700 ease-in-out"
      :class="[darkGradientClasses, isDark ? 'opacity-100' : 'opacity-0']"
    ></div>

    <!-- Interactive Background -->
    <canvas 
      ref="canvas" 
      class="fixed inset-0 pointer-events-none z-0 w-full h-full"
    ></canvas>

    <div class="container relative z-10 px-4 mx-auto">
      <slot />
    </div>
  </div>
</template>
