# Supabase Storage 配置指南

本指南将帮助你在 Supabase 控制台配置存储桶（Storage Buckets），用于存储城市图片和用户头像。

## 概述

JourneyHub 需要两个存储桶：
1. **city-images** - 存储城市封面图片
2. **user-avatars** - 存储用户头像

## 第一步：创建 city-images 存储桶

### 1.1 进入 Storage 页面

1. 登录 [Supabase 控制台](https://app.supabase.com/)
2. 选择你的 JourneyHub 项目
3. 在左侧菜单点击 **Storage**
4. 点击 "Create a new bucket" 按钮

### 1.2 配置存储桶

填写以下信息：

- **Name**: `city-images`
- **Public bucket**: ✅ 勾选（允许公开访问）
- **File size limit**: `5242880` (5MB，以字节为单位)
- **Allowed MIME types**: 留空（稍后通过策略控制）

点击 "Create bucket" 创建存储桶。

### 1.3 配置访问策略

创建存储桶后，需要配置访问策略：

#### 策略 1：允许所有人查看图片

1. 点击 `city-images` 存储桶
2. 点击 "Policies" 标签
3. 点击 "New Policy" 按钮
4. 选择 "For full customization" 创建自定义策略

填写以下信息：

- **Policy name**: `Anyone can view images`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  bucket_id = 'city-images'
  ```

点击 "Save policy" 保存策略。

#### 策略 2：允许用户上传自己的图片

1. 点击 "New Policy" 按钮
2. 选择 "For full customization"

填写以下信息：

- **Policy name**: `Users can upload their own images`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'city-images' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

**说明**: 这个策略要求文件路径格式为 `{user_id}/{filename}`，确保用户只能上传到自己的文件夹。

点击 "Save policy" 保存策略。

#### 策略 3：允许用户删除自己的图片

1. 点击 "New Policy" 按钮
2. 选择 "For full customization"

填写以下信息：

- **Policy name**: `Users can delete their own images`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'city-images' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

点击 "Save policy" 保存策略。

#### 策略 4：允许用户更新自己的图片

1. 点击 "New Policy" 按钮
2. 选择 "For full customization"

填写以下信息：

- **Policy name**: `Users can update their own images`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'city-images' AND (storage.foldername(name))[1] = auth.uid()::text
  ```

点击 "Save policy" 保存策略。

## 第二步：创建 user-avatars 存储桶

重复第一步的所有操作，但使用以下配置：

### 2.1 配置存储桶

- **Name**: `user-avatars`
- **Public bucket**: ✅ 勾选
- **File size limit**: `2097152` (2MB，以字节为单位)
- **Allowed MIME types**: 留空

### 2.2 配置访问策略

创建与 `city-images` 相同的 4 个策略，但将所有策略定义中的 `'city-images'` 替换为 `'user-avatars'`。

**策略 1：Anyone can view avatars**
```sql
bucket_id = 'user-avatars'
```

**策略 2：Users can upload their own avatars**
```sql
bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```

**策略 3：Users can delete their own avatars**
```sql
bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```

**策略 4：Users can update their own avatars**
```sql
bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```

## 第三步：验证配置

### 3.1 检查存储桶列表

在 Storage 页面，你应该能看到两个存储桶：
- ✅ `city-images` (Public)
- ✅ `user-avatars` (Public)

### 3.2 检查策略

点击每个存储桶，进入 "Policies" 标签，确认有 4 个策略：
- ✅ Anyone can view images/avatars (SELECT)
- ✅ Users can upload their own images/avatars (INSERT)
- ✅ Users can delete their own images/avatars (DELETE)
- ✅ Users can update their own images/avatars (UPDATE)

## 文件路径规范

### city-images 存储桶

文件路径格式：`{user_id}/{city_id}_{timestamp}.{ext}`

示例：
```
3e650d13-8593-4809-a459-8c6798ac980c/beijing_1704067200000.jpg
3e650d13-8593-4809-a459-8c6798ac980c/shanghai_1704153600000.webp
```

### user-avatars 存储桶

文件路径格式：`{user_id}/avatar.{ext}`

示例：
```
3e650d13-8593-4809-a459-8c6798ac980c/avatar.jpg
9f98ab35-f9be-49cb-b3b7-cd65021d8685/avatar.png
```

## 文件类型限制

虽然在存储桶配置中没有设置 MIME 类型限制，但在应用代码中应该验证文件类型：

**允许的图片格式**：
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/webp` (.webp)

**文件大小限制**：
- city-images: 最大 5MB
- user-avatars: 最大 2MB

## 使用示例

### 上传城市图片

```typescript
import { supabase } from '@/services/supabase/client';

async function uploadCityImage(userId: string, cityId: string, file: File) {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件类型');
  }
  
  // 验证文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('文件大小超过 5MB');
  }
  
  // 生成文件名
  const timestamp = Date.now();
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${cityId}_${timestamp}.${ext}`;
  
  // 上传文件
  const { data, error } = await supabase.storage
    .from('city-images')
    .upload(fileName, file);
  
  if (error) throw error;
  
  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('city-images')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### 上传用户头像

```typescript
async function uploadUserAvatar(userId: string, file: File) {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('不支持的文件类型');
  }
  
  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('文件大小超过 2MB');
  }
  
  // 生成文件名
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${ext}`;
  
  // 上传文件（如果已存在则覆盖）
  const { data, error } = await supabase.storage
    .from('user-avatars')
    .upload(fileName, file, {
      upsert: true // 覆盖已存在的文件
    });
  
  if (error) throw error;
  
  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

### 删除图片

```typescript
async function deleteCityImage(filePath: string) {
  const { error } = await supabase.storage
    .from('city-images')
    .remove([filePath]);
  
  if (error) throw error;
}
```

## 常见问题

### Q1: 上传失败，提示权限错误

**A**: 检查以下几点：
- 确认用户已登录（`auth.uid()` 不为空）
- 确认文件路径格式正确（`{user_id}/{filename}`）
- 确认存储桶策略已正确配置
- 确认 `user_id` 与当前登录用户的 UUID 匹配

### Q2: 无法查看图片

**A**: 检查以下几点：
- 确认存储桶设置为 Public
- 确认 "Anyone can view" 策略已创建
- 确认使用 `getPublicUrl()` 获取公开 URL
- 检查浏览器控制台是否有 CORS 错误

### Q3: 文件大小限制不生效

**A**: 存储桶的文件大小限制是服务器端限制，但建议在客户端也进行验证，提供更好的用户体验。

### Q4: 如何更新已上传的图片

**A**: 使用 `upload()` 方法时，设置 `upsert: true` 选项：
```typescript
await supabase.storage
  .from('city-images')
  .upload(fileName, file, { upsert: true });
```

## 安全注意事项

1. **文件路径验证**: 始终确保文件路径以用户 UUID 开头
2. **文件类型验证**: 在客户端和服务器端都进行文件类型验证
3. **文件大小限制**: 在客户端预先检查文件大小，避免不必要的上传
4. **公开访问**: 只有查看操作是公开的，上传、删除、更新都需要认证
5. **文件命名**: 使用时间戳或 UUID 避免文件名冲突

## 下一步

完成 Storage 配置后，可以继续：

1. 创建 Supabase 客户端配置（任务 2.4）
2. 定义数据库类型（任务 3.1）
3. 实现图片上传功能（任务 8.8）

## 参考资源

- [Supabase Storage 官方文档](https://supabase.com/docs/guides/storage)
- [Storage 策略文档](https://supabase.com/docs/guides/storage/security/access-control)
- [文件上传最佳实践](https://supabase.com/docs/guides/storage/uploads)
