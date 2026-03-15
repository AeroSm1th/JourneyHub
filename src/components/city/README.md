# City 组件模块

城市相关的 UI 组件集合，用于展示和管理旅行城市记录。

## 组件列表

### CityCard

卡片形式展示城市信息的组件。

- **文件**: `CityCard.tsx`
- **样式**: `CityCard.css`
- **示例**: `CityCard.example.tsx`
- **文档**: `CityCard.USAGE.md`
- **测试**: `__tests__/CityCard.test.tsx`

**功能特性**:

- 显示城市名称、国家、访问日期
- 显示封面图（支持懒加载）
- 显示评分（1-5 星）
- 显示标签（最多 3 个）
- 收藏标记
- 选中状态高亮
- 键盘导航支持
- 响应式设计

**使用示例**:

```tsx
import { CityCard } from '@/components/city';

<CityCard
  city={cityData}
  onClick={(city) => navigate(`/cities/${city.id}`)}
  isSelected={selectedId === city.id}
/>;
```

### CityList

列表形式展示所有城市记录的组件。

- **文件**: `CityList.tsx`
- **样式**: `CityList.css`
- **示例**: `CityList.example.tsx`
- **文档**: `CityList.USAGE.md`
- **测试**: `__tests__/CityList.test.tsx`

**功能特性**:

- 显示所有城市记录
- 按访问日期降序排序
- 支持点击查看详情
- 加载状态、错误状态、空状态
- 显示城市数量统计

**使用示例**:

```tsx
import { CityList } from '@/components/city';

<CityList onCityClick={(city) => console.log(city)} selectedCityId={selectedId} />;
```

### CityForm

创建和编辑城市记录的表单组件。

- **文件**: `CityForm.tsx`
- **样式**: `CityForm.css`
- **示例**: `CityForm.example.tsx`
- **文档**: `CityForm.USAGE.md`

**功能特性**:

- 创建新城市记录
- 编辑现有城市记录
- 表单验证（React Hook Form + Zod）
- 反向地理编码自动填充
- 图片上传
- 实时字段验证

**使用示例**:

```tsx
import { CityForm } from '@/components/city';

<CityForm
  coordinates={{ lat: 39.9042, lng: 116.4074 }}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>;
```

### CityDetailPanel

显示完整城市信息的详情面板组件。

- **文件**: `CityDetailPanel.tsx`
- **样式**: `CityDetailPanel.css`
- **示例**: `CityDetailPanel.example.tsx`
- **文档**: `CityDetailPanel.USAGE.md`
- **测试**: `__tests__/CityDetailPanel.test.tsx`

**功能特性**:

- 显示完整的城市信息
- 显示封面图
- 显示评分、标签、备注
- 提供编辑按钮
- 提供删除按钮（带确认对话框）
- 响应式设计
- 触摸屏优化

**使用示例**:

```tsx
import { CityDetailPanel } from '@/components/city';

<CityDetailPanel
  city={cityData}
  onEdit={(city) => openEditForm(city)}
  onDeleteSuccess={() => navigate('/cities')}
  onClose={() => setSelectedCity(null)}
/>;
```

## 导出

所有组件通过 `index.ts` 统一导出：

```tsx
export { CityForm } from './CityForm';
export { CityList } from './CityList';
export { CityCard } from './CityCard';
export { CityDetailPanel } from './CityDetailPanel';
```

## 相关类型

所有组件使用的类型定义位于：

- `@/types/database.ts` - 数据库类型
- `@/types/entities.ts` - 业务实体类型

## 相关 Hooks

- `useCities` - 获取所有城市记录
- `useCity` - 获取单个城市记录
- `useCreateCity` - 创建城市记录
- `useUpdateCity` - 更新城市记录
- `useDeleteCity` - 删除城市记录

## 测试

所有组件都有对应的测试文件，位于 `__tests__/` 目录。

运行测试：

```bash
npm test -- src/components/city
```

## 验证需求

- ✅ 需求 3.1：地图点击触发表单
- ✅ 需求 3.6：城市列表显示
- ✅ 需求 3.7：城市记录详情显示
- ✅ 需求 3.8：编辑城市记录
- ✅ 需求 3.9：删除城市记录
