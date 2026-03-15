# ImageUpload 组件使用指南

## 概述

`ImageUpload` 是一个功能完整的图片上传组件，支持文件验证、上传进度显示和图片预览。

## 功能特性

- ✅ 文件大小验证（默认最大 5MB）
- ✅ 文件类型验证（JPG、PNG、WebP）
- ✅ 实时图片预览
- ✅ 上传进度显示
- ✅ 上传到 Supabase Storage
- ✅ 支持更换和删除图片
- ✅ 响应式设计
- ✅ 触摸屏友好

## 基础用法

```tsx
import { ImageUpload } from '@/components/forms/ImageUpload';

function MyComponent() {
  const userId = 'user-uuid';

  return (
    <ImageUpload
      bucket="city-images"
      pathPrefix={userId}
      onUploadSuccess={(url) => console.log('上传成功:', url)}
    />
  );
}
```

## Props

| 属性              | 类型                                      | 默认值                                      | 说明                          |
| ----------------- | ----------------------------------------- | ------------------------------------------- | ----------------------------- |
| `bucket`          | `'city-images' \| 'user-avatars'`         | `'city-images'`                             | Supabase 存储桶名称           |
| `pathPrefix`      | `string`                                  | 必填                                        | 文件路径前缀（通常是用户 ID） |
| `currentImageUrl` | `string`                                  | -                                           | 当前图片 URL（用于编辑场景）  |
| `maxSize`         | `number`                                  | `5242880`                                   | 最大文件大小（字节）          |
| `acceptedTypes`   | `string[]`                                | `['image/jpeg', 'image/png', 'image/webp']` | 允许的文件类型                |
| `onUploadSuccess` | `(url: string, filePath: string) => void` | 必填                                        | 上传成功回调                  |
| `onUploadError`   | `(error: Error) => void`                  | -                                           | 上传失败回调                  |
| `onDelete`        | `() => void`                              | -                                           | 删除图片回调                  |
| `disabled`        | `boolean`                                 | `false`                                     | 是否禁用                      |

## 使用场景

### 1. 城市封面图片上传

```tsx
<ImageUpload
  bucket="city-images"
  pathPrefix={userId}
  maxSize={5 * 1024 * 1024} // 5MB
  onUploadSuccess={(url) => setValue('coverImage', url)}
/>
```

### 2. 用户头像上传

```tsx
<ImageUpload
  bucket="user-avatars"
  pathPrefix={userId}
  maxSize={2 * 1024 * 1024} // 2MB
  currentImageUrl={user.avatarUrl}
  onUploadSuccess={(url) => updateAvatar(url)}
/>
```

### 3. 在 React Hook Form 中使用

```tsx
import { useForm } from 'react-hook-form';

function CityForm() {
  const { setValue, watch } = useForm();
  const coverImage = watch('coverImage');

  return (
    <ImageUpload
      bucket="city-images"
      pathPrefix={userId}
      currentImageUrl={coverImage}
      onUploadSuccess={(url) => setValue('coverImage', url)}
      onDelete={() => setValue('coverImage', '')}
    />
  );
}
```

## 文件验证规则

### 文件类型

默认支持：

- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/webp` (.webp)

### 文件大小

- 城市图片：最大 5MB
- 用户头像：最大 2MB

## 错误处理

组件会自动显示以下错误：

- 文件类型不支持
- 文件大小超过限制
- 上传失败

```tsx
<ImageUpload
  onUploadError={(error) => {
    console.error('上传失败:', error);
    toast.error('图片上传失败，请重试');
  }}
/>
```

## 样式定制

组件使用 CSS 类名，可以通过覆盖样式进行定制：

```css
.image-upload-placeholder {
  border-color: #your-color;
}

.image-upload-preview {
  border-radius: 12px;
}
```

## 注意事项

1. **路径格式**：文件会上传到 `{pathPrefix}/{timestamp}.{ext}` 路径
2. **权限要求**：用户必须已登录才能上传
3. **存储桶配置**：确保 Supabase Storage 已正确配置
4. **公开访问**：上传的图片会自动获取公开 URL

## 相关文档

- [Supabase Storage 配置指南](/.kiro/specs/journey-hub-platform/storage-setup-guide.md)
- [CityForm 组件](../city/CityForm.USAGE.md)
