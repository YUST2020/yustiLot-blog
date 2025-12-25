<script setup lang="ts">
import PostForm from '~/components/admin/PostForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const id = route.params.id

const { data: post } = await useFetch(`/api/admin/posts/${id}`)

const onSubmit = async (data: any) => {
  await $fetch(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: data
  })
  navigateTo('/admin/posts')
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">编辑文章</h1>
    <PostForm v-if="post" :initial-data="post" is-edit @submit="onSubmit" />
  </div>
</template>
