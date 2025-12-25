<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const { setVariant } = useBackground()
setVariant('hidden')

const { data: posts } = await useFetch('/api/posts', {
  query: { limit: 3 }
})

const scrollToContent = () => {
  const content = document.getElementById('recent-posts')
  content?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 overflow-hidden isolate">
      <!-- Background Image -->
      <div 
        class="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
        style="background-image: url('https://images.unsplash.com/photo-1487147264018-f937fba0c817?q=80&w=2070&auto=format&fit=crop')"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
      </div>
      
      <div class="container mx-auto text-center space-y-6 relative z-10" v-motion-slide-visible-once-bottom>
        <h1 class="text-4xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-md">
          探索自然与技术的边界
        </h1>
        <p class="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-sm">
          记录生活，分享知识，保持好奇。
        </p>
        <div class="flex justify-center gap-4 pt-8">
          <NuxtLink to="/blog" class="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-medium hover:bg-white/30 transition-all hover:scale-105 shadow-lg">
            开始阅读
          </NuxtLink>
        </div>
      </div>

      <!-- Bouncing Arrow -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-white/80 hover:text-white transition-colors" @click="scrollToContent">
        <ChevronDown class="w-10 h-10" />
      </div>
    </section>

    <!-- Recent Posts -->
    <section id="recent-posts" class="py-24 container px-4">
      <h2 class="text-3xl font-bold mb-12 text-center md:text-left">最新文章</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="post in posts" :key="post.id" class="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <NuxtLink :to="`/blog/${post.slug}`" class="absolute inset-0 z-10">
            <span class="sr-only">Read more about {{ post.title }}</span>
          </NuxtLink>
          <div class="aspect-video bg-muted relative overflow-hidden">
             <img v-if="post.coverImage" :src="post.coverImage" :alt="post.title" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
             <div v-else class="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
               <span class="text-4xl">📝</span>
             </div>
          </div>
          <div class="p-6 space-y-2">
            <div class="text-xs text-muted-foreground">
              {{ new Date(post.publishedAt).toLocaleDateString() }}
            </div>
            <h3 class="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
              {{ post.title }}
            </h3>
            <p class="text-muted-foreground text-sm line-clamp-3">
              {{ post.excerpt }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
