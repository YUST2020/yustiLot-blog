import { useColorMode as useVueUseColorMode, type BasicColorSchema } from '@vueuse/core';

// 深浅色 composable，替代 @nuxtjs/color-mode
// 通过切换 html 的 .dark class 实现，持久化到 localStorage
export function useColorMode() {
  const mode = useVueUseColorMode({
    selector: 'html',
    attribute: 'class',
    modes: {
      dark: 'dark',
      light: '',
    },
    storageKey: 'nuxt-color-mode',
  });

  // 兼容旧代码的 .value / .preference 访问方式
  return {
    get value(): string {
      return mode.value;
    },
    set value(v: string) {
      mode.value = v as BasicColorSchema;
    },
    get preference(): string {
      return mode.store.value;
    },
    set preference(v: string) {
      mode.store.value = v as BasicColorSchema;
    },
  };
}
