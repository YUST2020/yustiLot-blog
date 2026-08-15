<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMouse, useWindowSize, useRafFn } from '@vueuse/core'
import { useColorMode } from '@/composables/useColorMode'

interface Props {
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'rose'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'blue'
})

// 粒子动画逻辑
const { width, height } = useWindowSize()
const { x: mouseX, y: mouseY } = useMouse()

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseAlpha: number // 基础亮度：少数高亮"主星"，多数偏暗"星尘"，营造层次
  twinkle: number // 闪烁相位，每个粒子不同步
  twinkleSpeed: number
}

const particles = ref<Particle[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)

// 预渲染发光精灵：径向渐变光点，一次创建、复用绘制，质感与性能兼得
let particleSprite: HTMLCanvasElement | null = null
const createSprite = () => {
  const s = document.createElement('canvas')
  const r = 16 // 精灵半径（含光晕）
  s.width = s.height = r * 2
  const c = s.getContext('2d')
  if (!c) return null
  const g = c.createRadialGradient(r, r, 0, r, r, r)
  // 核心 → 中间光晕 → 边缘消散，白色，多层过渡更柔和
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.7)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.18)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = g
  c.beginPath()
  c.arc(r, r, r, 0, Math.PI * 2)
  c.fill()
  return s
}

// 动效降级：尊重用户系统的减少动效设置
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 高 DPI 适配倍率，让 Retina 屏粒子不再发虚
const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

// 粒子数量随屏幕尺寸自适应（小屏更少更流畅，大屏更多但不超 100）
const computeParticleCount = () => {
  if (width.value <= 0 || height.value <= 0) return 60
  return Math.min(100, Math.max(30, Math.floor((width.value * height.value) / 15000)))
}

const initParticles = () => {
  if (width.value <= 0 || height.value <= 0) return

  const count = computeParticleCount()
  particles.value = Array.from({ length: count }, (_, idx) => ({
    x: Math.random() * width.value,
    y: Math.random() * height.value,
    vx: (Math.random() - 0.5) * 1,
    vy: (Math.random() - 0.5) * 1,
    size: Math.random() * 2 + 1,
    // 约 20% 为高亮"主星"，其余为偏暗"星尘"，形成层次
    baseAlpha: idx % 5 === 0 ? 0.85 + Math.random() * 0.15 : 0.25 + Math.random() * 0.3,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.005 + Math.random() * 0.01
  }))
}

// 监听尺寸变化：首次拿到尺寸时初始化
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

  // 同步 canvas 物理像素与 CSS 像素（乘以 DPR 保证高清）
  const cssW = width.value
  const cssH = height.value
  if (canvas.value.width !== cssW * dpr || canvas.value.height !== cssH * dpr) {
    canvas.value.width = cssW * dpr
    canvas.value.height = cssH * dpr
    canvas.value.style.width = `${cssW}px`
    canvas.value.style.height = `${cssH}px`
  }

  // 每帧重置变换并按 DPR 缩放，绘制坐标系与 CSS 像素保持一致
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const particleColor = '255, 255, 255' // 始终白色

  // 惰性创建发光精灵
  if (!particleSprite) particleSprite = createSprite()

  // 阶段一：更新位置
  particles.value.forEach(p => {
    if (!prefersReducedMotion) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > cssW) p.vx *= -1
      if (p.y < 0 || p.y > cssH) p.vy *= -1
      p.twinkle += p.twinkleSpeed
    }
  })

  // 阶段二：绘制所有连线（作为背景层）
  // 粒子间连线：两端按各自亮度 + 距离衰减生成渐变，线宽随距离收窄
  for (let i = 0; i < particles.value.length; i++) {
    const p = particles.value[i]
    for (let j = i + 1; j < particles.value.length; j++) {
      const p2 = particles.value[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= 150) continue

      const t = 1 - dist / 150
      const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y)
      grad.addColorStop(0, `rgba(${particleColor}, ${0.12 * t * p.baseAlpha})`)
      grad.addColorStop(1, `rgba(${particleColor}, ${0.12 * t * p2.baseAlpha})`)
      ctx.strokeStyle = grad
      ctx.lineWidth = 0.4 + t * 0.6
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.stroke()
    }
  }

  // 鼠标连线（动效降级时关闭）
  if (!prefersReducedMotion) {
    particles.value.forEach(p => {
      const dx = p.x - mouseX.value
      const dy = p.y - mouseY.value
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= 200) return

      const t = 1 - dist / 200
      ctx.strokeStyle = `rgba(${particleColor}, ${0.18 * t * p.baseAlpha})`
      ctx.lineWidth = 0.4 + t * 0.8
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(mouseX.value, mouseY.value)
      ctx.stroke()
    })
  }
  ctx.lineWidth = 1

  // 阶段三：绘制发光粒子（前景层），呼吸闪烁让画面更灵动
  if (particleSprite) {
    particles.value.forEach(p => {
      // 呼吸系数：在 baseAlpha 基础上 ±25% 波动；reduced motion 时固定
      const breathe = prefersReducedMotion ? 1 : 0.75 + 0.25 * Math.sin(p.twinkle)
      ctx.globalAlpha = Math.min(1, p.baseAlpha * breathe)
      // 光晕半径约为粒子 size 的 4 倍，让光晕自然展开
      const drawR = p.size * 4
      ctx.drawImage(particleSprite!, p.x - drawR, p.y - drawR, drawR * 2, drawR * 2)
    })
    ctx.globalAlpha = 1
  }
})

// 页面不可见时暂停动画，避免后台标签空耗 CPU
const handleVisibility = () => {
  if (document.hidden) pause()
  else resume()
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibility)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibility)
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
      return 'from-emerald-400 via-teal-300 to-cyan-200'
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
      return 'from-slate-950 via-emerald-900 to-slate-950'
    case 'orange':
      return 'from-orange-950 via-amber-950 to-yellow-950'
    case 'rose':
      return 'from-slate-950 via-rose-950 to-pink-950'
    default:
      return 'from-slate-900 via-blue-950 to-slate-900'
  }
})

// 点阵网格：深浅模式分别用各自可见度更高的颜色
const dotGridStyle = computed(() => {
  const color = isDark.value ? '255, 255, 255' : '30, 41, 59'
  return {
    backgroundImage: `radial-gradient(circle, rgba(${color}, 0.08) 1px, transparent 1px)`,
    backgroundSize: '32px 32px'
  }
})
</script>

<template>
  <div
    class="relative min-h-screen w-full pt-24 pb-16 transition-colors duration-500"
  >
    <!-- 浅色渐变层 -->
    <div
      class="fixed inset-0 bg-gradient-to-br transition-opacity duration-700 ease-in-out"
      :class="[lightGradientClasses, isDark ? 'opacity-0' : 'opacity-100']"
    ></div>
    <!-- 深色渐变层 -->
    <div
      class="fixed inset-0 bg-gradient-to-br transition-opacity duration-700 ease-in-out"
      :class="[darkGradientClasses, isDark ? 'opacity-100' : 'opacity-0']"
    ></div>

    <!-- 柔光球 Aurora Blobs：缓慢漂移的氛围光晕 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[-10%] left-[5%] h-[500px] w-[500px] rounded-full bg-white/10 blur-[120px] animate-float-slow"></div>
      <div class="absolute bottom-[-15%] right-[8%] h-[450px] w-[450px] rounded-full bg-white/10 blur-[130px] animate-float-slower"></div>
      <div class="absolute top-[35%] right-[25%] h-[300px] w-[300px] rounded-full bg-white/10 blur-[100px] animate-float-medium"></div>
    </div>

    <!-- 点阵网格 Dot Grid -->
    <div
      class="fixed inset-0 pointer-events-none"
      :style="dotGridStyle"
    ></div>

    <!-- 交互式粒子画布 -->
    <canvas
      ref="canvas"
      class="fixed inset-0 pointer-events-none z-0 w-full h-full"
    ></canvas>

    <div class="container relative z-10 px-4 mx-auto">
      <slot />
    </div>
  </div>
</template>

<style scoped>
@keyframes float-slow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}
@keyframes float-medium {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-25px, 15px); }
}
@keyframes float-slower {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 25px); }
}
.animate-float-slow { animation: float-slow 9s ease-in-out infinite; }
.animate-float-medium { animation: float-medium 7s ease-in-out infinite; }
.animate-float-slower { animation: float-slower 11s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-float-slow,
  .animate-float-medium,
  .animate-float-slower {
    animation: none;
  }
}
</style>
