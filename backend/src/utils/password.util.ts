import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// 密码哈希/校验工具，与现有 Nuxt 版本（10 轮）保持兼容
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
