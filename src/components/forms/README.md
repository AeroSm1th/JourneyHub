# Forms 组件目录

本目录包含所有表单相关的通用组件。

## 组件列表

### ImageUpload

图片上传组件，支持文件验证、上传进度显示和图片预览。

**功能特性：**

- 文件大小验证（默认最大 5MB）
- 文件类型验证（JPG、PNG、WebP）
- 实时图片预览
- 上传进度显示
- 上传到 Supabase Storage
- 支持更换和删除图片

**使用场景：**

- 城市封面图片上传
- 用户头像上传
- 任何需要图片上传的表单

**相关文件：**

- `ImageUpload.tsx` - 组件实现
- `ImageUpload.css` - 组件样式
- `ImageUpload.example.tsx` - 使用示例
- `ImageUpload.USAGE.md` - 使用文档
- `__tests__/ImageUpload.test.tsx` - 单元测试

**快速开始：**

```tsx
import { ImageUpload } from '@/components/forms/ImageUpload';

<ImageUpload
  bucket="city-images"
  pathPrefix={userId}
  onUploadSuccess={(url) => console.log('上传成功:', url)}
/>;
```

## 未来计划

以下组件将在后续任务中实现：

- **FormField** - 通用表单字段包装器
- **DatePicker** - 日期选择器组件
- **TagInput** - 标签输入组件
- **RatingInput** - 评分输入组件

## 设计原则

1. **可复用性**：组件应该足够通用，可以在多个场景中使用
2. **类型安全**：使用 TypeScript 确保类型安全
3. **验证友好**：与 React Hook Form + Zod 无缝集成
4. **响应式**：支持桌面端、平板端和移动端
5. **可访问性**：确保触摸屏可操作，符合无障碍标准

## 相关文档

- [通用组件目录](../common/README.md)
- [城市表单组件](../city/CityForm.USAGE.md)
- [Supabase Storage 配置](/.kiro/specs/journey-hub-platform/storage-setup-guide.md)
