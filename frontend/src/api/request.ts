import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';

// axios 实例：自动携带 JWT，401 时清除登录态
const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 请求拦截器：注入 Authorization
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：解包 data（返回业务数据而非 AxiosResponse），401 清登录态
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore().logout();
    }
    return Promise.reject(error);
  },
);

// 包装为返回 any（业务数据）的请求方法
const request = {
  get: (url: string, config?: any) => instance.get(url, config) as unknown as Promise<any>,
  post: (url: string, data?: any, config?: any) => instance.post(url, data, config) as unknown as Promise<any>,
  put: (url: string, data?: any, config?: any) => instance.put(url, data, config) as unknown as Promise<any>,
  delete: (url: string, config?: any) => instance.delete(url, config) as unknown as Promise<any>,
};

export default request;
