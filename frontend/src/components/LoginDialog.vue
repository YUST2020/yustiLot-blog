<script setup lang="ts">
import { computed, ref } from 'vue';
import { User as UserIcon, Lock as LockIcon, Loader2, ArrowRight } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  open?: boolean;
  preventClose?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'login-success'): void;
}>();

const authStore = useAuthStore();

const internalOpen = computed({
  get: () => props.open || false,
  set: (val) => emit('update:open', val),
});

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

const login = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    await authStore.login(username.value, password.value);
    emit('update:open', false);
    emit('login-success');
  } catch {
    errorMsg.value = '登录失败，请检查用户名或密码';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="internalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- 遮罩 -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <!-- 卡片 -->
        <div class="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card shadow-lg p-6">
          <!-- 头部 -->
          <div class="space-y-1.5 text-center mb-6">
            <h2 class="text-xl font-semibold tracking-tight text-foreground">管理员登录</h2>
            <p class="text-sm text-muted-foreground">请输入凭据以访问后台</p>
          </div>

          <form @submit.prevent="login" class="space-y-4">
            <!-- 用户名 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">用户名</label>
              <div class="relative">
                <UserIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  v-model="username"
                  type="text"
                  required
                  placeholder="Username"
                  class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">密码</label>
              <div class="relative">
                <LockIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  v-model="password"
                  type="password"
                  required
                  placeholder="Password"
                  class="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
                />
              </div>
            </div>

            <!-- 错误提示 -->
            <p v-if="errorMsg" class="text-sm text-destructive">{{ errorMsg }}</p>

            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin mr-2" />
              <span v-else class="flex items-center gap-2">
                登录 <ArrowRight class="h-4 w-4" />
              </span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
</style>
