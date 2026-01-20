<script setup lang="ts">
import { Sun, Moon, Menu, X, Home, BookOpen, Tv, LayoutDashboard, User } from 'lucide-vue-next'
import { useWindowScroll } from '@vueuse/core'

const colorMode = useColorMode()
const { y } = useWindowScroll()
const route = useRoute()

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const isMenuOpen = ref(false)

const isScrolled = computed(() => y.value > 50)
const isTransparentPage = computed(() => ['/', '/blog', '/about', '/animes'].includes(route.path))
const showScrolledStyle = computed(() => !isTransparentPage.value || isScrolled.value)
const isHomePage = computed(() => route.path === '/')
const shouldShowDarkText = computed(() => {
    // If scrolled, always use dark text (because background becomes solid/blurred)
    if (showScrolledStyle.value) return true;
    
    // If on homepage and not scrolled
    if (isHomePage.value) {
        // In dark mode, we want white text on the dark background
        if (colorMode.value === 'dark') return false;
        // In light mode, we want dark text on the light beige background
        return true;
    }
    
    // Default fallback
    return false;
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans flex flex-col">
    <!-- Navbar -->
    <header 
      class="fixed top-0 z-50 w-full transition-all duration-300"
      :class="[
        showScrolledStyle 
          ? 'bg-background/80 backdrop-blur-md shadow-sm py-2' 
          : 'bg-transparent py-4'
      ]"
    >
      <div class="container flex items-center justify-between px-4 md:px-6">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl tracking-tight transition-colors" :class="shouldShowDarkText ? 'text-foreground' : 'text-white'">
          <span>XieJava's BLOG</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-2 text-base font-medium">
          <NuxtLink 
            to="/" 
            class="px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'"
          >
            <Home class="w-4 h-4" />
            <span>首页</span>
          </NuxtLink>
          <NuxtLink 
            to="/blog" 
            class="px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'"
          >
            <BookOpen class="w-4 h-4" />
            <span>博客</span>
          </NuxtLink>
          <NuxtLink 
            to="/animes" 
            class="px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'"
          >
            <Tv class="w-4 h-4" />
            <span>番剧</span>
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'"
          >
            <User class="w-4 h-4" />
            <span>关于</span>
          </NuxtLink>
          <LoginDialog>
             <button 
              class="px-5 py-2 rounded-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white/90 hover:bg-white/10 hover:text-white backdrop-blur-sm'"
             >
               <LayoutDashboard class="w-4 h-4" />
               <span>后台</span>
             </button>
          </LoginDialog>
        </nav>

        <div class="flex items-center gap-4">
           <button 
            @click="toggleTheme" 
            class="p-2 rounded-full transition-colors focus:outline-none"
            :class="shouldShowDarkText ? 'hover:bg-secondary text-foreground' : 'text-white hover:bg-white/10'"
            aria-label="Toggle theme"
          >
             <ClientOnly>
              <Sun v-if="colorMode.value === 'light'" class="w-5 h-5" />
              <Moon v-else class="w-5 h-5" />
              <template #fallback>
                <div class="w-5 h-5"></div>
              </template>
            </ClientOnly>
          </button>

          <!-- Mobile Menu Toggle -->
          <button class="md:hidden p-2" @click="isMenuOpen = !isMenuOpen" :class="shouldShowDarkText ? 'text-foreground' : 'text-white'">
            <Menu v-if="!isMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div v-if="isMenuOpen" v-motion-slide-top class="md:hidden border-b bg-background p-4 absolute w-full top-full left-0 shadow-lg">
        <nav class="flex flex-col gap-4 text-sm font-medium text-foreground">
          <NuxtLink to="/" @click="isMenuOpen = false" class="transition-colors hover:text-primary flex items-center gap-2">
            <Home class="w-4 h-4" />
            <span>首页</span>
          </NuxtLink>
          <NuxtLink to="/blog" @click="isMenuOpen = false" class="transition-colors hover:text-primary flex items-center gap-2">
            <BookOpen class="w-4 h-4" />
            <span>博客</span>
          </NuxtLink>
          <NuxtLink to="/about" @click="isMenuOpen = false" class="transition-colors hover:text-primary flex items-center gap-2">
            <User class="w-4 h-4" />
            <span>关于</span>
          </NuxtLink>
           <LoginDialog>
             <button @click="isMenuOpen = false" class="transition-colors hover:text-primary text-left w-full flex items-center gap-2">
                <LayoutDashboard class="w-4 h-4" />
                <span>后台</span>
             </button>
           </LoginDialog>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t py-6 md:py-0">
      <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
        <p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {{ new Date().getFullYear() }} Built with Nuxt 4 & Tailwind.
        </p>
      </div>
    </footer>
  </div>
</template>
