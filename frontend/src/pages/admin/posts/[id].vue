<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PostForm from '@/components/admin/PostForm.vue';
import { fetchAdminPost, updatePost } from '@/api/posts';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id);

const post = ref<any>(null);

onMounted(async () => {
  try {
    post.value = await fetchAdminPost(id);
  } catch {
    post.value = null;
  }
});

const onSubmit = async (data: any) => {
  await updatePost(id, data);
  router.push('/admin/posts');
};
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold tracking-tight">编辑文章</h1>
    <PostForm v-if="post" :initial-data="post" is-edit @submit="onSubmit" />
  </div>
</template>
