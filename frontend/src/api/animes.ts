import request from '@/api/request';

// 公开番剧：返回分页对象
export const fetchAnimes = (params: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
}) => request.get('/animes', { params });

// 管理番剧
export const fetchAdminAnimes = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  order?: string;
}) => request.get('/admin/animes', { params });

export const createAnime = (data: any) => request.post('/admin/animes', data);
export const fetchAdminAnime = (id: number) => request.get(`/admin/animes/${id}`);
export const updateAnime = (id: number, data: any) => request.put(`/admin/animes/${id}`, data);
export const deleteAnime = (id: number) => request.delete(`/admin/animes/${id}`);
