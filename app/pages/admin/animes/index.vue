<script setup lang="ts">
import { Star, Edit, Trash2, Plus } from 'lucide-vue-next'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const { data: animes, refresh } = await useFetch('/api/admin/animes')

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
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">番剧管理</h1>
        <p class="text-muted-foreground mt-1 text-sm">记录和管理我看过的番剧。</p>
      </div>
      <Button as-child shadow-sm>
        <NuxtLink to="/admin/animes/create" class="flex items-center gap-2">
          <Plus class="w-4 h-4" /> 新增记录
        </NuxtLink>
      </Button>
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
                  <div class="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" :title="anime.review">
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
                      <Button variant="ghost" size="icon" as-child class="h-8 w-8">
                        <NuxtLink :to="`/admin/animes/${anime.id}`">
                          <Edit class="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </NuxtLink>
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
              暂无番剧记录
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
