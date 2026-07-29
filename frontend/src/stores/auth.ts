import { defineStore } from 'pinia';
import request from '@/api/request';

interface AuthUser {
  id: number;
  username: string;
  name: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

// 鉴权 store：管理 token/user，持久化 token 到 localStorage
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('blog_token'),
    user: null,
  }),
  getters: {
    loggedIn: (state) => !!state.token,
  },
  actions: {
    setSession(payload: { user: AuthUser; token: string }) {
      this.token = payload.token;
      this.user = payload.user;
      localStorage.setItem('blog_token', payload.token);
    },
    async login(username: string, password: string) {
      const data: any = await request.post('/auth/login', { username, password });
      this.setSession({ user: data.user, token: data.token });
      return data;
    },
    async fetchMe() {
      try {
        const data: any = await request.get('/auth/me');
        this.user = data.user;
        return data.user;
      } catch {
        this.logout();
        return null;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('blog_token');
    },
  },
});
