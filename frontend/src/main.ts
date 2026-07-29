import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setApp } from './composables/useDialogOpen';
import './assets/css/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// 注册 NuxtLink 全局别名，兼容迁移自 Nuxt 的页面（这些页面用 <NuxtLink>）
app.component('NuxtLink', () => import('vue-router').then((m) => m.RouterLink));

// 注入应用实例给 useDialogOpen（替代 Nuxt 的 useNuxtApp）
setApp(app);

app.mount('#app');
