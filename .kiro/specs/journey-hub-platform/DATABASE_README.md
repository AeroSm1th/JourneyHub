# JourneyHub 数据库配置文档

本目录包含 JourneyHub 项目的 Supabase 数据库配置相关文档。

## 📁 文档列表

### 1. [database-setup.sql](./database-setup.sql)
**完整的数据库初始化 SQL 脚本**

包含内容：
- ✅ 7 个数据库表的创建语句
- ✅ 所有表的索引配置
- ✅ Row Level Security (RLS) 策略
- ✅ 触发器函数（自动更新 updated_at）
- ✅ 详细的中文注释

**使用方法**：
1. 在 Supabase 控制台打开 SQL Editor
2. 复制此文件的全部内容
3. 粘贴并执行

---

### 2. [supabase-setup-guide.md](./supabase-setup-guide.md)
**Supabase 项目配置完整指南**

包含内容：
- 📝 创建 Supabase 项目的详细步骤
- 📝 执行数据库脚本的操作指南
- 📝 配置存储桶（Storage Buckets）
- 📝 配置认证设置
- 📝 获取项目配置信息
- 📝 测试数据库连接
- 📝 常见问题解答

**适用人群**：首次使用 Supabase 的开发者

---

### 3. [database-schema-reference.md](./database-schema-reference.md)
**数据库表结构快速参考**

包含内容：
- 📊 表关系图
- 📊 7 个表的详细字段说明
- 📊 索引和约束信息
- 📊 RLS 策略说明
- 📊 存储桶配置
- 📊 常用查询示例
- 📊 TypeScript 类型定义

**适用场景**：开发过程中快速查阅表结构

---

## 🚀 快速开始

### 第一次配置（完整流程）

1. **阅读配置指南**
   ```bash
   打开 supabase-setup-guide.md
   ```

2. **创建 Supabase 项目**
   - 访问 https://app.supabase.com/
   - 创建新项目
   - 记录项目 URL 和 API Key

3. **执行数据库脚本**
   - 在 SQL Editor 中执行 `database-setup.sql`
   - 验证 7 个表已创建成功

4. **配置存储桶**
   - 创建 `city-images` 存储桶
   - 创建 `user-avatars` 存储桶
   - 配置访问策略

5. **配置环境变量**
   ```bash
   # 在项目根目录创建 .env 文件
   VITE_SUPABASE_URL=你的项目URL
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   ```

6. **测试连接**
   - 运行应用
   - 测试用户注册和登录
   - 测试数据 CRUD 操作

---

## 📊 数据库架构概览

### 核心表（7 个）

```
users (用户)
  ├── cities (城市记录)
  ├── wishlist_items (愿望清单)
  ├── trips (行程)
  └── shares (分享链接)

trips (行程)
  ├── trip_days (日程)
  └── trip_tasks (任务)
```

### 存储桶（2 个）

- `city-images`: 城市封面图片
- `user-avatars`: 用户头像

### 安全策略

- ✅ 所有表启用 Row Level Security (RLS)
- ✅ 用户只能访问自己的数据
- ✅ 分享链接支持公开访问
- ✅ 存储桶配置用户级访问控制

---

## 🔧 开发参考

### 常用操作

#### 查询用户的所有城市

```typescript
const { data, error } = await supabase
  .from('cities')
  .select('*')
  .order('visited_at', { ascending: false });
```

#### 创建新城市记录

```typescript
const { data, error } = await supabase
  .from('cities')
  .insert({
    user_id: user.id,
    city_name: '北京',
    country_name: '中国',
    continent: 'Asia',
    latitude: 39.9042,
    longitude: 116.4074,
    visited_at: '2024-01-15',
    trip_type: 'leisure',
  })
  .select()
  .single();
```

#### 上传城市图片

```typescript
const { data, error } = await supabase.storage
  .from('city-images')
  .upload(`${user.id}/${Date.now()}-${file.name}`, file);
```

#### 查询行程及其日程

```typescript
const { data, error } = await supabase
  .from('trips')
  .select(`
    *,
    trip_days (*),
    trip_tasks (*)
  `)
  .eq('id', tripId)
  .single();
```

---

## 📝 表结构速查

### users - 用户表
- `id` (UUID): 主键
- `email` (TEXT): 邮箱，唯一
- `nickname` (TEXT): 昵称
- `avatar_url` (TEXT): 头像 URL

### cities - 城市记录表
- `id` (UUID): 主键
- `user_id` (UUID): 外键 → users
- `city_name` (TEXT): 城市名称
- `country_name` (TEXT): 国家名称
- `continent` (TEXT): 大洲
- `latitude` (DECIMAL): 纬度
- `longitude` (DECIMAL): 经度
- `visited_at` (DATE): 访问日期
- `trip_type` (TEXT): 旅行类型
- `rating` (INTEGER): 评分 1-5
- `is_favorite` (BOOLEAN): 是否收藏

### wishlist_items - 愿望清单表
- `id` (UUID): 主键
- `user_id` (UUID): 外键 → users
- `city_name` (TEXT): 城市名称
- `priority` (INTEGER): 优先级 1-5

### trips - 行程表
- `id` (UUID): 主键
- `user_id` (UUID): 外键 → users
- `title` (TEXT): 行程标题
- `start_date` (DATE): 开始日期
- `end_date` (DATE): 结束日期
- `status` (TEXT): 状态
- `share_enabled` (BOOLEAN): 是否分享

### trip_days - 日程表
- `id` (UUID): 主键
- `trip_id` (UUID): 外键 → trips
- `day_index` (INTEGER): 第几天
- `date` (DATE): 日期

### trip_tasks - 任务表
- `id` (UUID): 主键
- `trip_id` (UUID): 外键 → trips
- `content` (TEXT): 任务内容
- `is_done` (BOOLEAN): 是否完成

### shares - 分享表
- `id` (UUID): 主键
- `user_id` (UUID): 外键 → users
- `type` (TEXT): 分享类型
- `slug` (TEXT): 分享标识符，唯一

---

## ⚠️ 注意事项

### 数据安全

1. **永远不要在客户端存储数据库密码**
   - 只使用 `SUPABASE_ANON_KEY`
   - 数据库密码仅用于服务端或管理操作

2. **RLS 策略是数据安全的核心**
   - 确保所有表都启用了 RLS
   - 定期审查 RLS 策略
   - 测试不同用户的数据隔离

3. **存储桶访问控制**
   - 文件路径必须包含 `user_id`
   - 定期清理未使用的文件
   - 设置合理的文件大小限制

### 性能优化

1. **使用索引**
   - 所有外键都已创建索引
   - 常用查询字段已创建索引
   - 避免在未索引字段上进行大量查询

2. **批量操作**
   - 使用 `insert` 的数组形式批量插入
   - 使用 `upsert` 处理更新或插入
   - 避免在循环中执行单条查询

3. **查询优化**
   - 使用 `select` 指定需要的字段
   - 使用 `limit` 限制返回数量
   - 使用 `range` 实现分页

### 数据迁移

1. **修改表结构前**
   - 备份数据
   - 在测试环境验证
   - 准备回滚方案

2. **添加字段**
   - 使用 `ALTER TABLE ADD COLUMN`
   - 设置合理的默认值
   - 更新 TypeScript 类型定义

3. **删除字段**
   - 先确认代码中无引用
   - 先标记为废弃，观察一段时间
   - 再执行删除操作

---

## 🐛 故障排查

### 连接问题

**症状**: 无法连接到 Supabase
**检查**:
- [ ] `.env` 文件配置正确
- [ ] 项目状态为 Active
- [ ] 网络连接正常
- [ ] API Key 未过期

### RLS 问题

**症状**: 查询返回空数据或权限错误
**检查**:
- [ ] 用户已登录（`auth.uid()` 不为空）
- [ ] RLS 策略已创建
- [ ] 策略逻辑正确
- [ ] 表已启用 RLS

### 存储问题

**症状**: 文件上传失败
**检查**:
- [ ] 存储桶已创建
- [ ] 访问策略已配置
- [ ] 文件路径格式正确
- [ ] 文件大小未超限

---

## 📚 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)

---

## 🤝 贡献

如果发现文档有误或需要补充，请：
1. 在项目中提出 Issue
2. 提交 Pull Request
3. 联系项目维护者

---

## 📄 许可证

本文档遵循项目的开源许可证。
