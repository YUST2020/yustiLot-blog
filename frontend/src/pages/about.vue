<script setup lang="ts">
import { Github, Twitter, Mail } from 'lucide-vue-next';
import ParticleBackground from '@/components/ParticleBackground.vue';

document.title = '关于我 - MyBlog';
</script>

<template>
    <ParticleBackground variant="purple">
      <div class="flex flex-col items-center text-center space-y-8">
        <!-- Avatar -->
        <div class="relative group">
          <div
            class="w-40 h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            class="absolute inset-0 rounded-full ring-2 ring-white/20 ring-offset-4 ring-offset-transparent pointer-events-none"
          ></div>
        </div>

        <!-- Introduction -->
        <div class="space-y-4 max-w-2xl">
          <h1 class="text-4xl font-bold tracking-tight text-white drop-shadow-md">你好，我是 Trae</h1>
          <p class="text-lg text-white/90 leading-relaxed font-medium drop-shadow-sm">
            一名充满热情的全栈开发者，致力于构建优雅、高效的 Web 应用。
            <br class="hidden md:block" />
            喜欢探索新技术，热衷于开源社区，偶尔也会写写文章分享心得。
          </p>
        </div>

        <!-- Social Links -->
        <div class="flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-emerald-600 transition-all duration-300 hover:-translate-y-1 shadow-lg border border-white/20"
          >
            <Github class="w-5 h-5" />
            <span class="sr-only">GitHub</span>
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-sky-500 transition-all duration-300 hover:-translate-y-1 shadow-lg border border-white/20"
          >
            <Twitter class="w-5 h-5" />
            <span class="sr-only">Twitter</span>
          </a>
          <a
            href="mailto:hello@example.com"
            class="p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-rose-500 transition-all duration-300 hover:-translate-y-1 shadow-lg border border-white/20"
          >
            <Mail class="w-5 h-5" />
            <span class="sr-only">Email</span>
          </a>
        </div>

        <!-- Tech Stack -->
        <div class="w-full pt-8 border-t border-white/20">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white/80 mb-6">技术栈</h2>
          <div class="flex flex-wrap justify-center gap-3">
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >Vue 3</span
            >
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >TypeScript</span
            >
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >Tailwind CSS</span
            >
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >Node.js</span
            >
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >NestJS</span
            >
            <span
              class="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium text-white hover:bg-white/20 transition-colors cursor-default"
              >MySQL</span
            >
          </div>
        </div>
      </div>
    </ParticleBackground>
</template>
