import request from '@/api/request';

// 公开作品：返回裸数组（非分页对象），仅可见作品
export const fetchProjects = () => request.get('/projects');

// 管理作品
export const fetchAdminProjects = () => request.get('/admin/projects');
export const createProject = (data: any) => request.post('/admin/projects', data);
export const updateProject = (id: number, data: any) => request.put(`/admin/projects/${id}`, data);
export const deleteProject = (id: number) => request.delete(`/admin/projects/${id}`);
