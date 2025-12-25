<script setup lang="ts">
import { useMouse, useWindowSize } from '@vueuse/core'

const { variant } = useBackground()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

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
  particles.value = Array.from({ length: 100 }, () => ({
    x: Math.random() * width.value,
    y: Math.random() * height.value,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    size: Math.random() * 2 + 1
  }))
}

onMounted(() => {
  initParticles()
  animate()
})

const animate = () => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

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

  requestAnimationFrame(animate)
}
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-500">
    <!-- Light Mode Gradients -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-300 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'blue' && !isDark ? 'opacity-100' : 'opacity-0']"></div>
    
    <div class="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-400 to-indigo-400 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'purple' && !isDark ? 'opacity-100' : 'opacity-0']"></div>
    
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-300 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'green' && !isDark ? 'opacity-100' : 'opacity-0']"></div>
    
    <div class="absolute inset-0 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-300 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'orange' && !isDark ? 'opacity-100' : 'opacity-0']"></div>

    <!-- Dark Mode Gradients -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'blue' && isDark ? 'opacity-100' : 'opacity-0']"></div>
         
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'purple' && isDark ? 'opacity-100' : 'opacity-0']"></div>
         
    <div class="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-950 to-teal-950 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'green' && isDark ? 'opacity-100' : 'opacity-0']"></div>
         
    <div class="absolute inset-0 bg-gradient-to-br from-orange-950 via-amber-950 to-yellow-950 transition-opacity duration-1000 ease-in-out"
         :class="[variant === 'orange' && isDark ? 'opacity-100' : 'opacity-0']"></div>

    <!-- Interactive Background -->
    <canvas 
      ref="canvas" 
      :width="width" 
      :height="height" 
      class="absolute inset-0 transition-opacity duration-1000"
      :class="[variant && variant !== 'hidden' ? 'opacity-100' : 'opacity-0']"
    ></canvas>
  </div>
</template>
