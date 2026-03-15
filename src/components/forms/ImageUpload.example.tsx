/**
 * ImageUpload 组件使用示例
 */

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';

/**
 * 基础使用示例
 */
export function BasicExample() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c'; // 示例用户 ID

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">基础图片上传</h2>
      <ImageUpload
        bucket="city-images"
        pathPrefix={userId}
        onUploadSuccess={(url) => {
          setImageUrl(url);
          console.log('上传成功:', url);
        }}
        onUploadError={(error) => {
          console.error('上传失败:', error);
        }}
      />
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">上传的图片 URL:</p>
          <p className="text-sm text-blue-600 break-all">{imageUrl}</p>
        </div>
      )}
    </div>
  );
}

/**
 * 带已有图片的示例
 */
export function WithExistingImageExample() {
  const [imageUrl, setImageUrl] = useState<string>('https://example.com/existing-image.jpg');
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c';

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">编辑已有图片</h2>
      <ImageUpload
        bucket="city-images"
        pathPrefix={userId}
        currentImageUrl={imageUrl}
        onUploadSuccess={(url) => {
          setImageUrl(url);
          console.log('更新成功:', url);
        }}
        onDelete={() => {
          setImageUrl('');
          console.log('图片已删除');
        }}
      />
    </div>
  );
}

/**
 * 用户头像上传示例（2MB 限制）
 */
export function AvatarUploadExample() {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c';

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">用户头像上传</h2>
      <ImageUpload
        bucket="user-avatars"
        pathPrefix={userId}
        currentImageUrl={avatarUrl}
        maxSize={2 * 1024 * 1024} // 2MB
        onUploadSuccess={(url) => {
          setAvatarUrl(url);
          console.log('头像上传成功:', url);
        }}
      />
    </div>
  );
}

/**
 * 在表单中使用示例
 */
export function FormIntegrationExample() {
  const [formData, setFormData] = useState({
    cityName: '',
    coverImage: '',
  });
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('提交表单:', formData);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">表单集成示例</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            城市名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.cityName}
            onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">封面图片（可选）</label>
          <ImageUpload
            bucket="city-images"
            pathPrefix={userId}
            currentImageUrl={formData.coverImage}
            onUploadSuccess={(url) => {
              setFormData({ ...formData, coverImage: url });
            }}
            onDelete={() => {
              setFormData({ ...formData, coverImage: '' });
            }}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          提交
        </button>
      </form>
    </div>
  );
}

/**
 * 禁用状态示例
 */
export function DisabledExample() {
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c';

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">禁用状态</h2>
      <ImageUpload
        bucket="city-images"
        pathPrefix={userId}
        disabled={true}
        onUploadSuccess={(url) => console.log(url)}
      />
    </div>
  );
}

/**
 * 自定义文件类型示例
 */
export function CustomFileTypesExample() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const userId = '3e650d13-8593-4809-a459-8c6798ac980c';

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">仅允许 PNG 格式</h2>
      <ImageUpload
        bucket="city-images"
        pathPrefix={userId}
        acceptedTypes={['image/png']}
        onUploadSuccess={(url) => {
          setImageUrl(url);
        }}
      />
    </div>
  );
}
