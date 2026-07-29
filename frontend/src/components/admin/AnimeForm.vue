<script setup lang="ts">
import { ref } from 'vue';
import { Star } from 'lucide-vue-next';

const props = defineProps<{
  initialData?: any;
  isEdit?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const getCachedValue = (key: string, defaultValue: any) => {
  if (import.meta.env.SSR) return defaultValue;
  return localStorage.getItem(key) || defaultValue;
};

const form = ref({
  title: props.initialData?.title || '',
  coverImage: props.initialData?.coverImage || '',
  rating: props.initialData?.rating || 0,
  review: props.initialData?.review || '',
  releaseYear: String(props.initialData?.releaseYear || getCachedValue('last_anime_year', new Date().getFullYear())),
  releaseQuarter: String(props.initialData?.releaseQuarter || getCachedValue('last_anime_quarter', 1)),
});

const loading = ref(false);

const quarters = [
  { label: '1月', value: 1 },
  { label: '4月', value: 4 },
  { label: '7月', value: 7 },
  { label: '10月', value: 10 },
];

const years = Array.from({ length: new Date().getFullYear() - 2005 + 2 }, (_, i) => 2005 + i).reverse();

// 半星评分：每颗星左半点击 = 整数 -1，右半 = 整数（rating 0-10）
const handleStarClick = (event: MouseEvent, index: number) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const isHalf = event.clientX - rect.left < rect.width / 2;
  form.value.rating = isHalf ? index * 2 - 1 : index * 2;
};

const starType = (index: number) => {
  const starValue = index * 2;
  if (form.value.rating >= starValue) return 'full';
  if (form.value.rating === starValue - 1) return 'half';
  return 'empty';
};

const onSubmit = async () => {
  loading.value = true;
  try {
    // 缓存当前输入的年份和季度
    if (!props.isEdit) {
      localStorage.setItem('last_anime_year', form.value.releaseYear);
      localStorage.setItem('last_anime_quarter', form.value.releaseQuarter);
    }
    await emit('submit', {
      ...form.value,
      releaseYear: Number(form.value.releaseYear),
      releaseQuarter: Number(form.value.releaseQuarter),
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <!-- 名称 / 封面 -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label for="title" class="text-sm font-medium text-foreground">番剧名称</label>
        <input
          id="title"
          v-model="form.title"
          required
          placeholder="请输入番剧名称"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
      <div class="space-y-2">
        <label for="coverImage" class="text-sm font-medium text-foreground">封面图片 URL (225:300)</label>
        <input
          id="coverImage"
          v-model="form.coverImage"
          required
          placeholder="https://..."
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
        />
      </div>
    </div>

    <!-- 评分 / 年份季度 -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">评分（{{ form.rating }} 分）</label>
        <div class="flex items-center h-10 gap-1">
          <button
            v-for="i in 5"
            :key="i"
            type="button"
            class="relative h-8 w-8 inline-flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            @click="handleStarClick($event, i)"
          >
            <Star v-if="starType(i) === 'full'" class="h-7 w-7 fill-amber-400 text-amber-400" />
            <div v-else-if="starType(i) === 'half'" class="relative">
              <Star class="h-7 w-7 text-amber-400/30" />
              <div class="absolute inset-0 overflow-hidden w-1/2">
                <Star class="h-7 w-7 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <Star v-else class="h-7 w-7 text-amber-400/30" />
          </button>
        </div>
        <p class="text-xs text-muted-foreground">点击星星左侧为半分，右侧为整分</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">上映年份</label>
          <select
            v-model="form.releaseYear"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
          >
            <option v-for="year in years" :key="year" :value="year.toString()">{{ year }}年</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">上映季度</label>
          <select
            v-model="form.releaseQuarter"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
          >
            <option v-for="q in quarters" :key="q.value" :value="q.value.toString()">{{ q.label }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 感想 -->
    <div class="space-y-2">
      <label for="review" class="text-sm font-medium text-foreground">一句话感想</label>
      <textarea
        id="review"
        v-model="form.review"
        rows="3"
        placeholder="谈谈你的看法..."
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors resize-y"
      />
    </div>

    <!-- 操作 -->
    <div class="flex items-center gap-3 pt-2">
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {{ loading ? '保存中...' : '保存番剧' }}
      </button>
      <button
        type="button"
        @click="$emit('cancel')"
        class="inline-flex items-center justify-center h-10 px-6 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        取消
      </button>
    </div>
  </form>
</template>
