<script setup lang="ts">
import { Star, Edit, Trash2, Plus, Search, ArrowUpDown } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import { toast } from 'vue-sonner'
import { useDialogOpen } from '~/lib/useDialogOpen'
import AnimeDialog from '~/components/admin/AnimeDialog.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

// Query Params
const page = ref(Number(route.query.page) || 1)
const search = ref((route.query.search as string) || '')
const sortBy = ref((route.query.sortBy as string) || 'releaseDate')
const order = ref((route.query.order as string) || 'desc')

const { data, refresh } = await useFetch('/api/admin/animes', {
  key: 'admin-animes-list',
  query: { 
    page,
    search,
    sortBy,
    order
  }
})

// Debounced update for search
let searchTimeout: NodeJS.Timeout
const handleSearch = (val: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = val
    page.value = 1 // Reset to first page on search
  }, 300)
}

// Watchers to sync URL
watch([page, search, sortBy, order], () => {
  const query: any = {
    page: page.value,
  }
  
  if (search.value) query.search = search.value
  if (sortBy.value !== 'releaseDate') query.sortBy = sortBy.value
  if (order.value !== 'desc') query.order = order.value

  router.push({ query })
})

// Sync from URL changes (e.g. back button)
watch(() => route.query, (newQuery) => {
  page.value = Number(newQuery.page) || 1
  search.value = (newQuery.search as string) || ''
  sortBy.value = (newQuery.sortBy as string) || 'releaseDate'
  order.value = (newQuery.order as string) || 'desc'
})

const animes = computed(() => data.value?.items || [])
const totalPages = computed(() => data.value?.totalPages || 0)
const total = computed(() => data.value?.total || 0)

const openCreateDialog = () => {
  useDialogOpen(AnimeDialog, {
    isEdit: false,
    onConfirm: async (formData: any) => {
      await $fetch('/api/admin/animes', {
        method: 'POST',
        body: formData
      })
      toast.success('番剧记录已创建')
      refresh()
    }
  })
}

const openEditDialog = (anime: any) => {
  useDialogOpen(AnimeDialog, {
    isEdit: true,
    initialData: anime,
    onConfirm: async (formData: any) => {
      await $fetch(`/api/admin/animes/${anime.id}`, {
        method: 'PUT',
        body: formData
      })
      toast.success('番剧记录已更新')
      refresh()
    }
  })
}

const deleteAnime = async (id: number) => {
  if (!confirm('确定要删除这条番剧记录吗？')) return
  try {
    await $fetch(`/api/admin/animes/${id}`, { method: 'DELETE' })
    toast.success('删除成功')
    refresh()
  } catch (error) {
    toast.error('删除失败')
  }
}

const getQuarterLabel = (q: number) => {
  const labels: Record<number, string> = {
    1: '1月',
    4: '4月',
    7: '7月',
    10: '10月'
  }
  return labels[q] || q + '月'
}

const toggleOrder = () => {
  order.value = order.value === 'desc' ? 'asc' : 'desc'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">番剧管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">记录和管理我看过的番剧。</p>
      </div>
      <Button shadow-sm @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" /> 新增记录
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <div class="relative w-full max-w-sm">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          :model-value="search"
          @update:model-value="handleSearch"
          type="search"
          placeholder="搜索番剧..."
          class="pl-8"
        />
      </div>
      <div class="flex items-center gap-2 ml-auto">
        <Select v-model="sortBy">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="releaseDate">上映时间</SelectItem>
            <SelectItem value="rating">评分</SelectItem>
            <SelectItem value="createdAt">创建时间</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" @click="toggleOrder" :title="order === 'desc' ? '降序' : '升序'">
          <ArrowUpDown class="h-4 w-4" :class="{ 'rotate-180': order === 'asc' }" />
        </Button>
      </div>
    </div>

    <div class="border rounded-xl overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[300px]">番剧</TableHead>
            <TableHead>评分</TableHead>
            <TableHead>上映时间</TableHead>
            <TableHead class="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="anime in animes" :key="anime.id" class="group transition-colors">
            <TableCell>
              <div class="flex items-center gap-4">
                <div class="relative w-12 h-16 shrink-0 overflow-hidden rounded-md border bg-muted shadow-sm">
                  <img 
                    :src="anime.coverImage" 
                    :alt="anime.title" 
                    class="h-full w-full object-cover transition-transform group-hover:scale-110" 
                  />
                </div>
                <div class="space-y-1">
                  <div class="font-semibold text-foreground leading-none">{{ anime.title }}</div>
                  <div class="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" :title="anime.review!">
                    {{ anime.review || '暂无评价' }}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1.5">
                <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span class="font-bold text-base">{{ anime.rating }}</span>
                <span class="text-xs text-muted-foreground">/10</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" class="font-normal">
                {{ anime.releaseYear }}年 {{ getQuarterLabel(anime.releaseQuarter) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="ghost" size="icon" @click="openEditDialog(anime)" class="h-8 w-8">
                        <Edit class="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>编辑</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button variant="ghost" size="icon" @click="deleteAnime(anime.id)" class="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 class="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>删除</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="!animes?.length">
            <TableCell colspan="4" class="h-32 text-center text-muted-foreground">
              {{ search ? '未找到相关番剧' : '暂无番剧记录' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between">
       <div class="text-sm text-muted-foreground">
        共 {{ total }} 条记录
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page <= 1"
          @click="page--"
        >
          上一页
        </Button>
        <div class="text-sm text-muted-foreground">
          第 {{ page }} 页 / 共 {{ totalPages }} 页
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= totalPages"
          @click="page++"
        >
          下一页
        </Button>
      </div>
    </div>
  </div>
</template>
