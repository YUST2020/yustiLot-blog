<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import { Calendar, Star, SortAsc, SortDesc, Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ParticleBackground from '@/components/ParticleBackground.vue';
import { fetchAnimes } from '@/api/animes';

const viewMode = ref<'timeline' | 'rating'>('timeline');
const sortBy = computed(() => (viewMode.value === 'timeline' ? 'releaseDate' : 'rating'));
const order = ref<'asc' | 'desc'>('desc');
const page = ref(1);
const pageSize = 24;
const hasMore = ref(true);
const scrollTrigger = ref<HTMLElement | null>(null);
const pending = ref(false);

const allAnimes = ref<any[]>([]);

// 分组入场完成标记：入场动画期间胶囊的 backdrop-filter 处于失效的合成层中，
// 时间轴节点/竖线会以未磨砂的亮环浮于标签上方，故必须等入场结束（含缓冲）后再渲染
const enteredLabels = ref(new Set<string>());
let settleTimer: ReturnType<typeof setTimeout> | undefined;
const markGroupEntered = (el: Element) => {
  const label = (el as HTMLElement).dataset.label;
  if (!label) return;
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    enteredLabels.value = new Set([...enteredLabels.value, label]);
  }, 300);
};

// 拉取一页数据
const loadData = async () => {
  pending.value = true;
  if (page.value === 1) {
    clearTimeout(settleTimer);
    enteredLabels.value = new Set();
  }
  try {
    const res: any = await fetchAnimes({
      page: page.value,
      pageSize,
      sortBy: sortBy.value,
      order: order.value,
    });
    if (res?.items) {
      if (page.value === 1) {
        allAnimes.value = res.items;
      } else {
        // 去重累加
        const existingIds = new Set(allAnimes.value.map((a) => a.id));
        const newItems = res.items.filter((a: any) => !existingIds.has(a.id));
        allAnimes.value.push(...newItems);
      }
      hasMore.value = allAnimes.value.length < (res.total || 0);
    }
  } finally {
    pending.value = false;
  }
};

onMounted(loadData);

// 监听排序/模式变化，重置页码并重新加载
watch([viewMode, order], () => {
  page.value = 1;
  loadData();
});

// 滚动加载
useIntersectionObserver(
  scrollTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !pending.value) {
      page.value++;
      loadData();
    }
  },
  { threshold: 0.1 },
);

const groupedItems = computed(() => {
  if (!allAnimes.value.length) return [];

  const groups: Record<string, any[]> = {};

  allAnimes.value.forEach((anime) => {
    let key = '';
    if (viewMode.value === 'timeline') {
      key = `${anime.releaseYear} ${getQuarterLabel(anime.releaseQuarter)}`;
    } else {
      key = `${anime.rating} 分`;
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(anime);
  });

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
});

const toggleOrder = () => {
  order.value = order.value === 'asc' ? 'desc' : 'asc';
};

const getQuarterLabel = (q: number) => {
  const labels: Record<number, string> = { 1: '冬', 4: '春', 7: '夏', 10: '秋' };
  return labels[q] || q + '月';
};

// 半星评分渲染
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating / 2);
  const hasHalfStar = rating % 2 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push({ type: 'full', key: i });
    } else if (i === fullStars && hasHalfStar) {
      stars.push({ type: 'half', key: i });
    } else {
      stars.push({ type: 'empty', key: i });
    }
  }
  return stars;
};
</script>

<template>
    <ParticleBackground variant="rose">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div class="space-y-2">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
            番剧记录
          </h1>
          <p class="text-lg text-white/80 max-w-2xl drop-shadow-sm">
            记录我看过的每一部番剧，留住那些感动与热血。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- View Toggle -->
          <div class="flex bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20">
            <button
              @click="viewMode = 'timeline'"
              class="flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium"
              :class="viewMode === 'timeline' ? 'bg-white text-primary shadow-sm' : 'text-white hover:bg-white/10'"
            >
              <Calendar class="w-4 h-4" />
              时间轴
            </button>
            <button
              @click="viewMode = 'rating'"
              class="flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium"
              :class="viewMode === 'rating' ? 'bg-white text-primary shadow-sm' : 'text-white hover:bg-white/10'"
            >
              <Star class="w-4 h-4" />
              评分榜
            </button>
          </div>

          <!-- Order Toggle -->
          <Button
            variant="outline"
            size="icon"
            @click="toggleOrder"
            class="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          >
            <SortDesc v-if="order === 'desc'" class="w-4 h-4" />
            <SortAsc v-else class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="min-h-[600px] relative pb-20">
        <Transition name="page-fade" mode="out-in">
          <!-- Grouped Skeleton Loader -->
          <div v-if="pending && page === 1" key="skeleton" class="space-y-16 relative">
            <div
              class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/5 -translate-x-1/2 hidden md:block"
            ></div>

            <div v-for="i in 2" :key="i" class="relative">
              <div class="flex items-center justify-center mb-10 relative z-10">
                <div
                  class="w-48 h-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 animate-pulse"
                ></div>
              </div>

              <div
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 md:px-0"
              >
                <div
                  v-for="j in 5"
                  :key="j"
                  class="aspect-[3/4] rounded-xl bg-white/5 animate-pulse border border-white/10"
                ></div>
              </div>
            </div>
          </div>

          <div v-else-if="groupedItems.length" :key="viewMode + order" class="space-y-16 relative">
            <!-- Central Timeline Line：首个分组落定后再生长 -->
            <div
              v-if="enteredLabels.size"
              class="timeline-line absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent -translate-x-1/2 hidden md:block"
            ></div>

            <TransitionGroup name="list" appear @after-enter="markGroupEntered" @after-appear="markGroupEntered">
              <div
                v-for="group in groupedItems"
                :key="group.label"
                :data-label="group.label"
                class="relative group/section"
              >
                <!-- Group Header -->
                <div class="flex items-center justify-center mb-10 relative z-10">
                  <div
                    v-if="enteredLabels.has(group.label)"
                    class="timeline-node hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white/50 bg-primary/20 backdrop-blur-sm z-0"
                  ></div>

                  <div
                    class="relative bg-white/5 backdrop-blur-xl px-8 py-2.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover/section:bg-white/10 group-hover/section:-translate-y-1 group-hover/section:border-white/20 group-hover/section:shadow-primary/10"
                  >
                    <h2
                      class="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-4"
                    >
                      <div
                        class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_theme(colors.primary.DEFAULT)]"
                      ></div>
                      {{ group.label }}
                      <span
                        class="text-xs bg-white/10 px-2.5 py-1 rounded-lg text-white/60 font-medium border border-white/5"
                      >
                        {{ group.items.length }}
                      </span>
                    </h2>
                  </div>
                </div>

                <!-- Anime Grid -->
                <TransitionGroup
                  tag="div"
                  name="list"
                  appear
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 md:px-0"
                >
                  <div
                    v-for="(anime, animeIndex) in group.items"
                    :key="anime.id"
                    :style="{ '--delay': `${animeIndex % 10}` }"
                    class="list-item group relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-white/5 bg-white/[0.02] backdrop-blur-[2px] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(var(--primary-rgb),0.2)] hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <img
                      :src="anime.coverImage"
                      :alt="anime.title"
                      class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />

                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-0 transition-opacity duration-500"
                    ></div>

                    <div
                      class="absolute inset-0 bg-black/60 backdrop-blur-[8px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col p-4 border border-white/10 rounded-xl"
                    ></div>

                    <div class="absolute inset-0 p-4 flex flex-col z-10">
                      <div
                        class="flex flex-col h-full transition-transform duration-500 ease-out group-hover:translate-y-0 translate-y-[calc(100%-100px)]"
                      >
                        <div class="space-y-1.5 flex-shrink-0">
                          <Badge
                            variant="secondary"
                            class="bg-white/20 backdrop-blur-md border-white/30 text-white text-[10px] py-0"
                          >
                            {{ anime.releaseYear }} {{ getQuarterLabel(anime.releaseQuarter) }}
                          </Badge>
                          <h3 class="font-bold text-white text-sm line-clamp-2 leading-tight">
                            {{ anime.title }}
                          </h3>

                          <div class="flex items-center gap-1">
                            <div class="flex items-center gap-0.5">
                              <template v-for="star in renderStars(anime.rating)" :key="star.key">
                                <Star
                                  v-if="star.type === 'full'"
                                  class="w-3 h-3 fill-yellow-400 text-yellow-400"
                                />
                                <div v-else-if="star.type === 'half'" class="relative w-3 h-3">
                                  <Star class="absolute inset-0 w-3 h-3 text-yellow-400/30" />
                                  <div class="absolute inset-0 overflow-hidden w-1/2">
                                    <Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                </div>
                                <Star v-else class="w-3 h-3 text-yellow-400/30" />
                              </template>
                            </div>
                            <span class="text-[10px] font-medium text-yellow-400">
                              {{ anime.rating }}
                            </span>
                          </div>
                        </div>

                        <div class="relative mt-3 flex-1">
                          <div
                            class="transition-all duration-500 group-hover:opacity-0 group-hover:invisible group-hover:translate-y-2"
                          >
                            <div v-if="anime.review" class="pt-1 border-t border-white/10">
                              <p
                                class="text-[11px] text-white/50 italic truncate leading-none py-1"
                              >
                                {{ anime.review }}
                              </p>
                            </div>
                          </div>

                          <div
                            class="absolute inset-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 delay-150 translate-y-4 group-hover:translate-y-0"
                          >
                            <p
                              v-if="anime.review"
                              class="text-[11px] text-white/90 italic leading-relaxed line-clamp-[12]"
                            >
                              "{{ anime.review }}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </TransitionGroup>

            <!-- Scroll Trigger & Loading More State -->
            <div ref="scrollTrigger" class="py-12 flex justify-center">
              <div v-if="hasMore" class="flex flex-col items-center gap-4">
                <Loader2 class="w-8 h-8 text-white/40 animate-spin" />
                <p class="text-white/40 text-sm font-medium tracking-wider">加载更多...</p>
              </div>
              <div v-else class="flex flex-col items-center gap-4">
                <div class="w-12 h-0.5 bg-white/10 rounded-full"></div>
                <p class="text-white/20 text-sm font-medium tracking-wider italic">已经到底啦 ~</p>
              </div>
            </div>
          </div>
          <div v-else-if="!pending" key="empty" class="text-center py-24">
            <p class="text-white/60 text-lg">暂无记录</p>
          </div>
        </Transition>
      </div>
    </ParticleBackground>
</template>

<style scoped>
.container {
  max-width: 1400px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-active {
  transition-delay: calc(var(--delay, 0) * 0.05s);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}
.list-leave-active {
  position: absolute;
  width: 100%;
  z-index: 0;
}

/* 时间轴竖线：分组落定后渲染，自上而下生长 */
.timeline-line {
  transform-origin: top center;
  animation: timeline-line-grow 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.15s backwards;
}

@keyframes timeline-line-grow {
  from {
    opacity: 0;
    scale: 1 0;
  }
  to {
    opacity: 1;
    scale: 1 1;
  }
}

/* 时间轴节点：分组落定后渲染，柔和淡入避免突兀 */
.timeline-node {
  animation: timeline-node-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.05s backwards;
}

@keyframes timeline-node-in {
  from {
    opacity: 0;
    scale: 0.5;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
</style>
