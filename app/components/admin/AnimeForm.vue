<script setup lang="ts">
import { ref } from 'vue'
import { Rating } from '~/components/ui/rating'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const props = defineProps<{
  initialData?: any
  isEdit?: boolean
}>()

const emit = defineEmits(['submit', 'cancel'])

const getCachedValue = (key: string, defaultValue: any) => {
  if (import.meta.server) return defaultValue
  return localStorage.getItem(key) || defaultValue
}

const form = ref({
  title: props.initialData?.title || '',
  coverImage: props.initialData?.coverImage || '',
  rating: props.initialData?.rating || 0,
  review: props.initialData?.review || '',
  releaseYear: String(props.initialData?.releaseYear || getCachedValue('last_anime_year', new Date().getFullYear())),
  releaseQuarter: String(props.initialData?.releaseQuarter || getCachedValue('last_anime_quarter', 1))
})

const loading = ref(false)

const quarters = [
  { label: '1月', value: 1 },
  { label: '4月', value: 4 },
  { label: '7月', value: 7 },
  { label: '10月', value: 10 }
]

const years = Array.from({ length: new Date().getFullYear() - 2005 + 2 }, (_, i) => 2005 + i).reverse()

const onSubmit = async () => {
  loading.value = true
  try {
    // 缓存当前输入的年份和季度
    if (!props.isEdit) {
      localStorage.setItem('last_anime_year', form.value.releaseYear)
      localStorage.setItem('last_anime_quarter', form.value.releaseQuarter)
    }
    
    await emit('submit', {
      ...form.value,
      releaseYear: Number(form.value.releaseYear),
      releaseQuarter: Number(form.value.releaseQuarter)
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <Label for="title">番剧名称</Label>
        <Input 
          id="title"
          v-model="form.title" 
          placeholder="请输入番剧名称"
          required 
        />
      </div>
      <div class="space-y-2">
        <Label for="coverImage">封面图片 URL (225:300)</Label>
        <Input 
          id="coverImage"
          v-model="form.coverImage" 
          placeholder="https://..."
          required 
        />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <Label>评分 ({{ form.rating }}分)</Label>
        <div class="flex items-center h-10">
          <Rating v-model="form.rating" size="lg" />
        </div>
        <p class="text-xs text-muted-foreground">点击星星左侧为半分，右侧为整分</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label>上映年份</Label>
          <Select v-model="form.releaseYear">
            <SelectTrigger>
              <SelectValue placeholder="选择年份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="year in years" :key="year" :value="year.toString()">
                {{ year }}年
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>上映季度</Label>
          <Select v-model="form.releaseQuarter">
            <SelectTrigger>
              <SelectValue placeholder="选择季度" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="q in quarters" :key="q.value" :value="q.value.toString()">
                {{ q.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="review">一句话感想</Label>
      <Textarea 
        id="review"
        v-model="form.review" 
        placeholder="谈谈你的看法..."
        rows="3"
        class="resize-none"
      />
    </div>

    <div class="flex gap-4 pt-4">
      <Button type="submit" :disabled="loading" class="px-8">
        {{ loading ? '保存中...' : '保存番剧' }}
      </Button>
      <Button type="button" variant="outline" @click="$emit('cancel')" class="px-8">
        取消
      </Button>
    </div>
  </form>
</template>
