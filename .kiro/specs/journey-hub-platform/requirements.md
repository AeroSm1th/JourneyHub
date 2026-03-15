# 需求文档

## 简介

JourneyHub 是一个地图驱动的旅行足迹与行程管理平台，基于 React + TypeScript 构建。用户可以在交互式地图上记录已访问的城市、管理愿望清单、规划未来行程，并通过可视化图表查看旅行统计数据。该平台支持离线访问、数据分享，并使用 Supabase 作为后端服务。

## 术语表

- **System**: JourneyHub 平台系统
- **User**: 已登录的注册用户
- **Guest**: 未登录的游客用户
- **City_Record**: 城市旅行记录，包含城市名称、访问日期、备注等信息
- **Wishlist_Item**: 愿望清单项目，表示用户想去但尚未访问的城市
- **Trip**: 行程，包含多个城市、日程安排、预算和待办事项
- **Map_Component**: 基于 Leaflet 的交互式地图组件
- **Auth_Service**: Supabase 认证服务
- **Database**: Supabase PostgreSQL 数据库
- **RLS**: Row Level Security，Supabase 行级安全策略
- **Cache**: 本地缓存数据，用于离线访问
- **Draft**: 表单草稿，在用户未提交前保存的临时数据
- **Statistics_Dashboard**: 统计仪表板，展示旅行数据的可视化分析
- **Share_Link**: 分享链接，允许其他用户查看公开的旅行数据

## 需求

### 需求 1: 用户认证与授权

**用户故事:** 作为用户，我希望能够注册和登录账户，以便安全地管理我的个人旅行数据。

#### 验收标准

1. THE System SHALL 提供邮箱密码注册功能
2. THE System SHALL 提供邮箱密码登录功能
3. WHEN 用户提交注册表单，THE Auth_Service SHALL 验证邮箱格式和密码强度
4. WHEN 用户登录成功，THE System SHALL 生成会话令牌并存储在客户端
5. WHEN 用户访问受保护路由且未登录，THE System SHALL 重定向到登录页面
6. THE System SHALL 提供退出登录功能
7. WHEN 用户退出登录，THE System SHALL 清除会话令牌和本地缓存数据

### 需求 2: 交互式地图展示

**用户故事:** 作为用户，我希望在交互式地图上查看和操作我的旅行数据，以便直观地管理足迹。

#### 验收标准

1. THE Map_Component SHALL 使用 Leaflet 渲染世界地图
2. THE Map_Component SHALL 在地图上标记所有已访问城市的位置
3. WHEN 用户点击地图上的某个位置，THE System SHALL 获取该位置的经纬度坐标
4. WHEN 用户点击地图上的城市标记，THE System SHALL 显示该城市的详细信息
5. THE Map_Component SHALL 支持缩放和平移操作
6. WHEN 用户选择某个城市记录，THE Map_Component SHALL 将地图中心移动到该城市位置
7. THE Map_Component SHALL 使用不同颜色或图标区分已访问城市和愿望清单城市

### 需求 3: 城市记录管理

**用户故事:** 作为用户，我希望创建、查看、编辑和删除城市旅行记录，以便维护我的旅行足迹。

#### 验收标准

1. WHEN 用户在地图上点击某个位置，THE System SHALL 显示创建城市记录的表单
2. THE System SHALL 通过反向地理编码 API 自动填充城市名称和国家信息
3. THE System SHALL 允许用户输入访问日期、备注和照片
4. WHEN 用户提交城市记录表单，THE System SHALL 验证必填字段
5. WHEN 城市记录验证通过，THE Database SHALL 存储该记录并关联到当前用户
6. THE System SHALL 在侧边栏列表中显示所有城市记录
7. WHEN 用户点击某条城市记录，THE System SHALL 显示该记录的详细信息
8. THE System SHALL 提供编辑城市记录的功能
9. THE System SHALL 提供删除城市记录的功能
10. WHEN 用户删除城市记录，THE System SHALL 要求确认操作

### 需求 4: 愿望清单管理

**用户故事:** 作为用户，我希望维护一个愿望清单，记录我想去但尚未访问的城市，以便规划未来旅行。

#### 验收标准

1. THE System SHALL 提供添加城市到愿望清单的功能
2. WHEN 用户添加愿望清单项目，THE System SHALL 记录城市名称、国家和坐标
3. THE System SHALL 在地图上用不同标记显示愿望清单城市
4. THE System SHALL 在侧边栏显示愿望清单视图
5. THE System SHALL 提供将愿望清单项目转换为正式城市记录的功能
6. WHEN 用户转换愿望清单项目，THE System SHALL 预填充城市信息到创建表单
7. THE System SHALL 提供删除愿望清单项目的功能

### 需求 5: 行程规划与管理

**用户故事:** 作为用户，我希望创建和管理旅行行程，包括日程、预算和待办事项，以便更好地规划旅行。

#### 验收标准

1. THE System SHALL 提供创建行程的功能
2. WHEN 用户创建行程，THE System SHALL 要求输入行程名称、开始日期和结束日期
3. THE System SHALL 允许用户将多个城市添加到行程中
4. THE System SHALL 为每个行程提供日程管理功能
5. THE System SHALL 为每个行程提供预算跟踪功能
6. THE System SHALL 为每个行程提供待办事项列表
7. THE System SHALL 在行程详情页显示关联的所有城市
8. THE System SHALL 提供编辑和删除行程的功能
9. WHEN 行程结束日期已过，THE System SHALL 在列表中标记为已完成

### 需求 6: 旅行统计与可视化

**用户故事:** 作为用户，我希望查看我的旅行统计数据和可视化图表，以便了解我的旅行足迹概况。

#### 验收标准

1. THE Statistics_Dashboard SHALL 显示已访问城市总数
2. THE Statistics_Dashboard SHALL 显示已访问国家总数
3. THE Statistics_Dashboard SHALL 显示已访问大洲列表及每个大洲的城市数量
4. THE Statistics_Dashboard SHALL 使用 ECharts 渲染世界地图热力图
5. THE Statistics_Dashboard SHALL 显示按年份统计的旅行次数柱状图
6. THE Statistics_Dashboard SHALL 显示访问次数最多的前 10 个城市
7. THE Statistics_Dashboard SHALL 计算并显示大洲覆盖率百分比

### 需求 7: 数据分享功能

**用户故事:** 作为用户，我希望生成分享链接，让其他人查看我的公开旅行数据，以便展示我的旅行经历。

#### 验收标准

1. THE System SHALL 提供生成分享链接的功能
2. WHEN 用户生成分享链接，THE System SHALL 创建唯一的公开访问 URL
3. THE System SHALL 允许用户选择分享全部数据或特定行程
4. WHEN Guest 访问分享链接，THE System SHALL 显示只读的地图和城市列表
5. THE System SHALL 在分享页面隐藏用户的私密信息
6. THE System SHALL 提供撤销分享链接的功能
7. WHEN 用户撤销分享链接，THE System SHALL 使该链接失效

### 需求 8: 离线访问支持

**用户故事:** 作为用户，我希望在弱网或离线环境下继续访问最近的数据，以便不受网络限制地使用应用。

#### 验收标准

1. THE System SHALL 使用 Service Worker 缓存应用静态资源
2. WHEN User 访问应用，THE System SHALL 缓存最近查看的城市记录
3. WHEN 网络不可用，THE System SHALL 从 Cache 加载数据
4. WHEN 网络不可用，THE System SHALL 显示离线状态指示器
5. THE System SHALL 保存用户在离线状态下创建的表单草稿
6. WHEN 网络恢复，THE System SHALL 自动同步离线期间的草稿数据
7. IF 同步失败，THEN THE System SHALL 提示用户手动重试

### 需求 9: 表单验证与错误处理

**用户故事:** 作为用户，我希望在提交表单时获得清晰的验证反馈，以便正确填写数据。

#### 验收标准

1. THE System SHALL 使用 Zod 定义表单验证规则
2. WHEN 用户提交表单，THE System SHALL 验证所有字段
3. IF 验证失败，THEN THE System SHALL 在对应字段下方显示错误消息
4. THE System SHALL 在用户输入时实时验证字段
5. THE System SHALL 禁用提交按钮直到所有必填字段有效
6. WHEN API 请求失败，THE System SHALL 显示用户友好的错误提示
7. THE System SHALL 记录错误日志到控制台以便调试

### 需求 10: 响应式设计

**用户故事:** 作为用户，我希望在不同设备上都能良好地使用应用，以便随时随地管理旅行数据。

#### 验收标准

1. THE System SHALL 在桌面端（≥1024px）显示完整的侧边栏和地图布局
2. THE System SHALL 在平板端（768px-1023px）调整侧边栏宽度
3. THE System SHALL 在移动端（<768px）使用可折叠的侧边栏
4. THE System SHALL 确保所有交互元素在触摸屏上可操作
5. THE Map_Component SHALL 在移动端禁用某些手势以避免冲突
6. THE System SHALL 在小屏幕上优化表单布局
7. THE System SHALL 使用 Tailwind CSS 响应式工具类实现布局

### 需求 11: 性能优化

**用户故事:** 作为用户，我希望应用加载快速且运行流畅，以便获得良好的使用体验。

#### 验收标准

1. THE System SHALL 使用 React.lazy 和 Suspense 实现路由级代码分割
2. THE System SHALL 使用 TanStack Query 缓存服务器数据
3. WHEN 数据已缓存且未过期，THE System SHALL 直接使用缓存数据
4. THE System SHALL 对地图标记进行聚合以提升大数据量渲染性能
5. THE System SHALL 使用虚拟滚动优化长列表渲染
6. THE System SHALL 压缩和优化图片资源
7. WHEN 构建生产版本，THE System SHALL 生成小于 200KB 的初始 JS 包（gzip 后）

### 需求 12: 数据安全与隐私

**用户故事:** 作为用户，我希望我的数据安全且隐私受保护，以便放心使用应用。

#### 验收标准

1. THE Database SHALL 使用 RLS 策略确保用户只能访问自己的数据
2. THE Auth_Service SHALL 使用 HTTPS 传输所有敏感数据
3. THE System SHALL 不在客户端存储明文密码
4. THE System SHALL 在用户删除账户时清除所有关联数据
5. THE System SHALL 提供导出个人数据的功能
6. THE System SHALL 在分享功能中排除用户邮箱等私密信息
7. THE System SHALL 遵循 GDPR 数据保护原则

### 需求 13: 测试覆盖

**用户故事:** 作为开发者，我希望关键功能有测试覆盖，以便确保代码质量和可维护性。

#### 验收标准

1. THE System SHALL 为所有工具函数编写单元测试
2. THE System SHALL 为关键 React 组件编写组件测试
3. THE System SHALL 测试表单验证逻辑
4. THE System SHALL 测试认证流程
5. THE System SHALL 测试数据获取和缓存逻辑
6. THE System SHALL 使用 Vitest 作为测试运行器
7. THE System SHALL 使用 React Testing Library 测试组件交互
8. THE System SHALL 在 CI/CD 流程中自动运行测试



### 需求 14: Git 版本控制与提交规范

**用户故事:** 作为开发者，我希望遵循统一的 Git 提交规范，以便维护清晰的项目历史。

#### 验收标准

1. THE System SHALL 在每完成一个功能点后提交代码
2. THE System SHALL 使用中文编写提交信息
3. THE System SHALL 遵循格式：类型: 简短中文说明
4. THE System SHALL 使用以下提交类型：feat、fix、refactor、style、test、docs、chore
5. THE System SHALL 配置 Git 用户名为 AeroSm1th
6. THE System SHALL 推送代码到 https://github.com/AeroSm1th/JourneyHub.git
7. THE System SHALL 在提交前运行 lint 检查

