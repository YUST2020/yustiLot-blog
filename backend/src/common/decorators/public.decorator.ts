import { SetMetadata } from '@nestjs/common';

// 标记接口为公开（豁免 JwtAuthGuard），元数据键为 'isPublic'
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
