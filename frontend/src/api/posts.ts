import request from '@/api/request';

// 公开文章：返回裸数组（非分页对象）
export const fetchPosts = (params?: { page?: number; limit?: number }) =>
  request.get('/posts', { params });

export const fetchPostBySlug = (slug: string) => request.get(`/posts/${slug}`);

// 管理文章
export const fetchAdminPosts = () => request.get('/admin/posts');
export const createPost = (data: any) => request.post('/admin/posts', data);
export const fetchAdminPost = (id: number) => request.get(`/admin/posts/${id}`);
export const updatePost = (id: number, data: any) => request.put(`/admin/posts/${id}`, data);
export const deletePost = (id: number) => request.delete(`/admin/posts/${id}`);
