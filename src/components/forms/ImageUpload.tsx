/**
 * 图片上传组件
 *
 * 功能：
 * - 验证文件大小（最大 5MB）
 * - 验证文件类型（JPG、PNG、WebP）
 * - 显示上传进度
 * - 上传到 Supabase Storage
 * - 图片预览
 *
 * 验证需求: 3.3
 */

import { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import './ImageUpload.css';

interface ImageUploadProps {
  /**
   * 存储桶名称
   */
  bucket?: 'city-images' | 'user-avatars';

  /**
   * 文件路径前缀（通常是用户 ID）
   */
  pathPrefix: string;

  /**
   * 当前图片 URL（用于显示已上传的图片）
   */
  currentImageUrl?: string;

  /**
   * 最大文件大小（字节），默认 5MB
   */
  maxSize?: number;

  /**
   * 允许的文件类型
   */
  acceptedTypes?: string[];

  /**
   * 上传成功回调
   */
  onUploadSuccess: (url: string, filePath: string) => void;

  /**
   * 上传失败回调
   */
  onUploadError?: (error: Error) => void;

  /**
   * 删除图片回调
   */
  onDelete?: () => void;

  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 图片上传组件
 *
 * @example
 * ```tsx
 * <ImageUpload
 *   bucket="city-images"
 *   pathPrefix={userId}
 *   currentImageUrl={city.coverImage}
 *   onUploadSuccess={(url) => setValue('coverImage', url)}
 * />
 * ```
 */
export function ImageUpload({
  bucket = 'city-images',
  pathPrefix,
  currentImageUrl,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadSuccess,
  onUploadError,
  onDelete,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 验证文件
   */
  const validateFile = (file: File): string | null => {
    // 验证文件类型
    if (!acceptedTypes.includes(file.type)) {
      return `不支持的文件类型。请上传 ${acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join('、')} 格式的图片`;
    }

    // 验证文件大小
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      return `文件大小超过 ${maxSizeMB}MB 限制`;
    }

    return null;
  };

  /**
   * 处理文件选择
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 清除错误
    setError(null);
    setSelectedFile(file);

    // 生成预览 URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * 上传文件到 Supabase Storage
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 生成唯一文件名
      const timestamp = Date.now();
      const ext = selectedFile.name.split('.').pop();
      const fileName = `${pathPrefix}/${timestamp}.${ext}`;

      // 上传文件
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 模拟上传进度（Supabase 不提供实时进度）
      setUploadProgress(100);

      // 获取公开 URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      // 调用成功回调
      onUploadSuccess(publicUrl, fileName);

      // 清除选中的文件
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || '上传失败，请重试');
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * 删除图片
   */
  const handleDelete = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onDelete) {
      onDelete();
    }
  };

  /**
   * 触发文件选择
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="image-upload-input"
        disabled={disabled || uploading}
      />

      {/* 预览区域 */}
      {previewUrl ? (
        <div className="image-upload-preview">
          <img src={previewUrl} alt="预览" className="image-upload-preview-img" />
          <div className="image-upload-preview-overlay">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSelectClick}
              disabled={disabled || uploading}
            >
              更换图片
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={disabled || uploading}
            >
              删除
            </Button>
          </div>
        </div>
      ) : (
        <div className="image-upload-placeholder" onClick={handleSelectClick}>
          <svg
            className="image-upload-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="image-upload-placeholder-text">点击选择图片</p>
          <p className="image-upload-placeholder-hint">
            支持 JPG、PNG、WebP 格式，最大 {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        </div>
      )}

      {/* 文件信息 */}
      {selectedFile && !uploading && (
        <div className="image-upload-info">
          <p className="image-upload-filename">{selectedFile.name}</p>
          <p className="image-upload-filesize">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleUpload}
            disabled={disabled}
          >
            上传
          </Button>
        </div>
      )}

      {/* 上传进度 */}
      {uploading && (
        <div className="image-upload-progress">
          <Spinner size="sm" />
          <p className="image-upload-progress-text">上传中... {uploadProgress}%</p>
        </div>
      )}

      {/* 错误消息 */}
      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
}
