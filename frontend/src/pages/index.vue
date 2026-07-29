<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import RubiksCubeBackground from '@/components/RubiksCubeBackground.vue';
import { fetchPosts } from '@/api/posts';

// 拉取最新 3 篇已发布文章
const posts = ref<any[]>([]);
onMounted(async () => {
  try {
    posts.value = (await fetchPosts({ limit: 3 })) as any[];
  } catch {
    posts.value = [];
  }
});

const scrollToContent = () => {
  const content = document.getElementById('recent-posts');
  content?.scrollIntoView({ behavior: 'smooth' });
};

// 打字机逻辑
const fullText = '记录生活，分享知识，保持好奇。';
const typewriterText = ref('');

onMounted(() => {
  let i = 0;
  const type = () => {
    if (i < fullText.length) {
      typewriterText.value += fullText.charAt(i);
      i++;
      setTimeout(type, 100);
    }
  };
  setTimeout(type, 800);
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center px-4 overflow-hidden isolate">
      <RubiksCubeBackground />

      <div
        class="container mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center pointer-events-none"
      >
        <div class="hidden md:block"></div>

        <div
          class="text-center md:text-left space-y-6 pointer-events-auto p-4 md:p-8 rounded-3xl dark:bg-black/40 dark:backdrop-blur-md transition-all"
        >
          <h1
            class="hero-title text-4xl md:text-7xl font-bold tracking-tighter text-foreground drop-shadow-sm transition-colors"
          >
            探索自然与技术的边界
          </h1>
          <p
            class="hero-subtitle text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto md:mx-0 font-light drop-shadow-sm min-h-[2rem] transition-colors"
          >
            <span>{{ typewriterText }}</span><span class="animate-pulse ml-1">|</span>
          </p>
          <div class="flex justify-center md:justify-start gap-4 pt-4 md:pt-8">
            <RouterLink
              to="/blog"
              class="hero-button px-8 py-3 bg-gray-900/10 dark:bg-white/10 backdrop-blur-md border border-gray-900/20 dark:border-white/20 text-foreground rounded-full font-medium hover:bg-gray-900/20 dark:hover:bg-white/20 transition-all hover:scale-105 shadow-lg"
            >
              开始阅读
            </RouterLink>
          </div>
        </div>
      </div>

      <div
        class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
        @click="scrollToContent"
      >
        <ChevronDown class="w-10 h-10" />
      </div>
    </section>

    <!-- Recent Posts -->
    <section id="recent-posts" class="py-24 container px-4">
      <h2 class="text-3xl font-bold mb-12 text-center md:text-left">最新文章</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="post in posts"
          :key="post.id"
          class="group relative bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <RouterLink :to="`/blog/${post.slug}`" class="absolute inset-0 z-10">
            <span class="sr-only">Read more about {{ post.title }}</span>
          </RouterLink>
          <div class="aspect-video bg-muted relative overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50"
            >
              <span class="text-4xl">📝</span>
            </div>
          </div>
          <div class="p-6 space-y-2">
            <div class="text-xs text-muted-foreground">
              {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '' }}
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

<style scoped>
:global(.dark) .hero-title {
  color: #ffffff !important;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
:global(.dark) .hero-subtitle {
  color: #e5e7eb !important;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}
:global(.dark) .hero-button {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
}
:global(.dark) .hero-button:hover {
  background-color: rgba(255, 255, 255, 0.25) !important;
}
</style>
