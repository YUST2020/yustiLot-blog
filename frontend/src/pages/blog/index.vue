<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ParticleBackground from '@/components/ParticleBackground.vue';
import { fetchPosts } from '@/api/posts';

const posts = ref<any[]>([]);
const selectedTag = ref<string | null>(null);

onMounted(async () => {
  try {
    posts.value = (await fetchPosts({ limit: 100 })) as any[];
  } catch {
    posts.value = [];
  }
});

// 聚合所有唯一标签
const allTags = computed(() => {
  const tags = new Set<string>();
  posts.value.forEach((post) => {
    if (post.tags) {
      try {
        const parsedTags = JSON.parse(post.tags);
        parsedTags.forEach((tag: string) => tags.add(tag));
      } catch {
        // ignore invalid json
      }
    }
  });
  return Array.from(tags);
});

// 按选中标签筛选
const filteredPosts = computed(() => {
  if (!selectedTag.value) return posts.value;
  return posts.value?.filter((post) => {
    if (!post.tags) return false;
    try {
      const parsedTags = JSON.parse(post.tags);
      return parsedTags.includes(selectedTag.value);
    } catch {
      return false;
    }
  });
});
</script>

<template>
    <ParticleBackground variant="blue">
      <!-- Main Content Card -->
      <div
        class="bg-background/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 min-h-[80vh] flex flex-col"
      >
        <div class="mb-8 text-center space-y-4">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
            博客文章
          </h1>
          <p class="text-white/90 text-lg max-w-2xl mx-auto font-medium drop-shadow-sm">
            在这里，我分享关于全栈开发、设计思维以及数字化生活的点滴思考。
          </p>
        </div>

        <!-- Tag Filter -->
        <div class="mb-10 flex flex-wrap justify-center gap-3">
          <button
            @click="selectedTag = null"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border"
            :class="
              !selectedTag
                ? 'bg-white text-primary border-white shadow-md scale-105'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            "
          >
            全部
          </button>
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="selectedTag = tag"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border"
            :class="
              selectedTag === tag
                ? 'bg-white text-primary border-white shadow-md scale-105'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            "
          >
            {{ tag }}
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[200px]">
          <TransitionGroup name="list" tag="div" class="contents">
            <div
              v-for="post in filteredPosts"
              :key="post.id"
              class="group relative flex flex-col bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <RouterLink :to="`/blog/${post.slug}`" class="absolute inset-0 z-10">
                <span class="sr-only">Read more about {{ post.title }}</span>
              </RouterLink>

              <div class="aspect-[16/10] overflow-hidden relative">
                <img
                  v-if="post.coverImage"
                  :src="post.coverImage"
                  :alt="post.title"
                  class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary text-muted-foreground"
                >
                  <span class="text-5xl opacity-20">📝</span>
                </div>

                <div
                  class="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                >
                  {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '' }}
                </div>
              </div>

              <div class="flex-1 p-6 flex flex-col space-y-3">
                <div v-if="post.tags" class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in JSON.parse(post.tags).slice(0, 2)"
                    :key="tag"
                    class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md"
                  >
                    #{{ tag }}
                  </span>
                </div>

                <h3 class="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {{ post.title }}
                </h3>

                <p class="text-muted-foreground text-sm line-clamp-3 flex-1 leading-relaxed">
                  {{ post.excerpt }}
                </p>

                <div
                  class="pt-4 mt-auto flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                >
                  阅读更多 <span class="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredPosts && filteredPosts.length === 0"
          class="flex flex-col items-center justify-center py-20 text-white/80"
        >
          <div class="text-6xl mb-4">📭</div>
          <p class="text-xl font-medium">该标签下暂无文章</p>
          <button @click="selectedTag = null" class="mt-4 text-sm underline hover:text-white">
            清除筛选
          </button>
        </div>
      </div>
    </ParticleBackground>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
  max-width: calc(100% / 3 - 2rem);
}
@media (max-width: 1024px) {
  .list-leave-active {
    max-width: calc(100% / 2 - 1.5rem);
  }
}
@media (max-width: 768px) {
  .list-leave-active {
    max-width: 100%;
  }
}
</style>
