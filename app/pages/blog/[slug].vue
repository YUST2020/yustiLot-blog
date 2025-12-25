<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import { Calendar, Eye, Clock, ArrowLeft, Share2, Tag } from 'lucide-vue-next'

const { setVariant } = useBackground()
setVariant('blue')

const route = useRoute()
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
const renderedContent = computed(() => post.value ? md.render(post.value.content) : '')

// Calculate reading time (rough estimate: 200 words per minute)
const readingTime = computed(() => {
  if (!post.value?.content) return 0
  const words = post.value.content.trim().split(/\s+/).length
  return Math.ceil(words / 200)
})

useHead({
  title: post.value?.title,
  meta: [
    { name: 'description', content: post.value?.excerpt }
  ]
})
</script>

<template>
  <div class="container relative z-10 px-4 mx-auto pt-24 pb-16">
    <div v-if="post" class="min-h-[80vh] flex flex-col items-center">
      
      <!-- Main Content Card -->
      <div class="w-full max-w-7xl bg-background/60 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 md:p-12 relative">
        
        <!-- Breadcrumb & Back -->
        <div class="mb-8">
          <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium group">
            <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回文章列表
          </NuxtLink>
        </div>

        <!-- Article Header -->
        <header class="mb-10 space-y-6">
          <!-- Tags -->
          <div v-if="post.tags" class="flex flex-wrap gap-2">
             <span v-for="tag in JSON.parse(post.tags)" :key="tag" class="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium cursor-default">
               <Tag class="w-3 h-3" />
               {{ tag }}
             </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {{ post.title }}
          </h1>

          <!-- Meta Info -->
          <div class="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium border-b pb-8 border-border/50">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              <span>{{ new Date(post.publishedAt).toLocaleDateString() }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Eye class="w-4 h-4" />
              <span>{{ post.viewCount }} 阅读</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              <span>{{ readingTime }} 分钟阅读</span>
            </div>
          </div>
        </header>

        <!-- Cover Image -->
        <div v-if="post.coverImage" class="mb-12 rounded-2xl overflow-hidden shadow-lg border border-border/50">
          <img 
            :src="post.coverImage" 
            :alt="post.title" 
            class="w-full h-auto object-cover"
          />
        </div>

        <!-- Content -->
        <article class="prose prose-lg prose-slate dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
          prose-p:leading-loose prose-p:text-muted-foreground
          prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-xl prose-img:shadow-md
          prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-secondary/30 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted-foreground
          prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-secondary/50 prose-pre:border prose-pre:text-foreground"
          v-html="renderedContent">
        </article>

        <!-- Share / Footer -->
        <div class="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-sm text-muted-foreground">
            感谢阅读，希望这篇文章对你有所启发。
          </div>
          <div class="flex gap-2">
            <button class="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="分享">
              <Share2 class="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom selection color */
::selection {
  background-color: hsl(var(--primary) / 0.2);
  color: hsl(var(--primary));
}
</style>
