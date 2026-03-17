/**
 * Supabase Storage 工具函数
 *
 * 提供统一的文件路径提取和图片上传功能，
 * 避免在多个组件中重复实现相同逻辑。
 */

import { supabase } from '@/services/supabase/client';

/**
 * 从 Supabase Storage 公开 URL 中提取文件路径
 *
 * @param publicUrl - Storage 公开访问 URL
 * @param bucket - 存储桶名称
 * @returns 文件路径，如果 URL 格式不匹配则返回 null
 */
export function extractStoragePath(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

/**
 * 上传图片到 Supabase Storage，返回公开 URL
 *
 * @param file - 要上传的文件
 * @param userId - 用户 ID（用作路径前缀）
 * @param bucket - 存储桶名称，默认 'city-images'
 * @returns 公开访问 URL，如果没有文件则返回 undefined
 */
export async function uploadImage(
  file: File | undefined,
  userId: string,
  bucket: 'city-images' | 'user-avatars' = 'city-images',
): Promise<string | undefined> {
  if (!file || !(file instanceof File)) return undefined;

  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) {
    throw new Error(`图片上传失败: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}
