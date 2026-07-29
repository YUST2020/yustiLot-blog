<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { Toaster } from 'vue-sonner';

// 首页渲染后空闲时段预加载其余页面 chunk，消除首次切换的加载白屏
onMounted(() => {
  const preload = () => {
    import('@/pages/blog/index.vue');
    import('@/pages/blog/[slug].vue');
    import('@/pages/animes/index.vue');
    import('@/pages/about.vue');
  };
  const ric = (window as any).requestIdleCallback as ((cb: () => void) => void) | undefined;
  if (ric) ric(preload);
  else setTimeout(preload, 1500);
});
</script>

<template>
  <!-- 外层只渲染布局组件，不加 transition/key，确保同布局内的路由切换不会重建布局 -->
  <RouterView />
  <!-- 全局 toast -->
  <Toaster rich-colors position="top-right" />
</template>
