# RLS 测试快速指南

## 问题解决

之前的 `test-rls-policies.sql` 脚本使用了 `DO $` 块语法，这在 Supabase SQL Editor 中不被支持。

我已经将测试脚本拆分为 8 个独立的 SQL 文件，可以直接在 Supabase SQL Editor 中执行。

## 测试步骤

### 步骤 1：创建测试数据

**文件**: `test-rls-step1-create-data.sql`

**作用**: 创建测试用户、城市、行程和分享链接

**执行方法**:
1. 打开 Supabase 控制台 → SQL Editor
2. 复制 `test-rls-step1-create-data.sql` 的内容
3. 粘贴并点击 "Run"

**预期结果**:
```
status                | users_count | cities_count | trips_count | shares_count
----------------------|-------------|--------------|-------------|-------------
✓ 测试数据创建完成     |      2      |      2       |      2      |      1
```

### 步骤 2：测试用户数据隔离

**文件**: `test-rls-step2-data-isolation.sql`

**作用**: 验证用户只能访问自己的数据

**预期结果**:
```
test_name              | count | result
-----------------------|-------|--------
Test 1.1: User A cities|   1   | ✓ PASS
Test 1.2: User B cities|   1   | ✓ PASS
Test 1.3: Data isolation check | 2 | ✓ PASS (Admin view - both test users visible)
```

**注意事项**:
- 测试 1.3 如果显示 `⚠ WARNING`，说明数据库中有其他用户的数据，但测试用户的数据隔离是正常的
- 测试 1.4 会显示测试用户的具体数据，验证数据完整性
- 测试 1.5 会显示所有用户的城市数量，用于调试

### 步骤 3：测试公开分享访问

**文件**: `test-rls-step3-public-share.sql`

**作用**: 验证未登录用户可以通过分享链接访问数据

**预期结果**:
```
test_name                          | count | result
-----------------------------------|-------|--------
Test 2.1: Share link exists        |   1   | ✓ PASS
Test 2.2: Public can view shared...|   1   | ✓ PASS
```

### 步骤 4：测试级联权限

**文件**: `test-rls-step4-cascade-permissions.sql`

**作用**: 验证用户可以管理自己行程的子数据

**预期结果**:
```
test_name                          | count | result
-----------------------------------|-------|--------
Test 3.1: User can view own trip...|   1   | ✓ PASS
Test 3.2: User can view own trip...|   1   | ✓ PASS
Test 3.3: Cascade relationship     |   -   | ✓ PASS
```


### 步骤 5：测试写操作权限

**文件**: `test-rls-step5-write-operations.sql`

**作用**: 验证用户可以修改自己的数据

**预期结果**:
```
test_name                          | count | result
-----------------------------------|-------|--------
Test 4.1: User can update own ci...|   1   | ✓ PASS
Test 4.2: User can update own tr...|   1   | ✓ PASS
Test 4.3: User can update trip t...|   1   | ✓ PASS
```

### 步骤 6：测试分享撤销

**文件**: `test-rls-step6-revoke-share.sql`

**作用**: 验证撤销分享后，公开访问被正确拒绝

**预期结果**:
```
test_name                          | count | result
-----------------------------------|-------|--------
Test 5.1: Share link revoked       |   0   | ✓ PASS
Test 5.2: Public access blocked... |   0   | ✓ PASS
```

### 步骤 7：测试特定行程分享

**文件**: `test-rls-step7-trip-share.sql`

**作用**: 验证 'trip' 类型分享只公开特定行程

**预期结果**:
```
test_name                          | count | result
-----------------------------------|-------|--------
Test 6.1: Public can view shared...|   1   | ✓ PASS
Test 6.2: Share type is trip       |   -   | ✓ PASS
Test 6.3: Can access shared trip...|   -   | ✓ PASS
```

### 步骤 8：清理测试数据

**文件**: `test-rls-step8-cleanup.sql`

**作用**: 清理所有测试数据

**预期结果**:
```
status                | remaining_users | remaining_cities | result
----------------------|-----------------|------------------|-------------
✓ 测试数据清理完成     |        0        |        0         | ✓ 清理成功
```

## 完整测试流程

在 Supabase SQL Editor 中按顺序执行以下文件：

1. ✅ `test-rls-step1-create-data.sql` - 创建测试数据
2. ✅ `test-rls-step2-data-isolation.sql` - 测试数据隔离
3. ✅ `test-rls-step3-public-share.sql` - 测试公开分享
4. ✅ `test-rls-step4-cascade-permissions.sql` - 测试级联权限
5. ✅ `test-rls-step5-write-operations.sql` - 测试写操作
6. ✅ `test-rls-step6-revoke-share.sql` - 测试撤销分享
7. ✅ `test-rls-step7-trip-share.sql` - 测试特定行程分享
8. ✅ `test-rls-step8-cleanup.sql` - 清理测试数据

## 常见问题

### Q: 为什么要拆分成多个文件？

**A**: Supabase SQL Editor 不支持 `DO $` 块语法，拆分后的脚本使用标准 SQL 语句，可以直接执行。

### Q: 可以一次性执行所有测试吗？

**A**: 不建议。分步执行可以更清楚地看到每个测试的结果，便于定位问题。

### Q: 如果某个测试失败怎么办？

**A**: 
1. 检查 RLS 策略是否正确配置（执行了 `rls-policies.sql`）
2. 检查测试数据是否成功创建（步骤 1 的结果）
3. 查看详细的错误信息
4. 参考 `RLS_CONFIGURATION_SUMMARY.md` 中的故障排查部分

### Q: 测试完成后需要清理数据吗？

**A**: 建议执行步骤 8 清理测试数据，避免影响后续测试或开发。

## 测试结果汇总

执行完所有步骤后，应该看到：

- ✅ 8 个步骤全部执行成功
- ✅ 所有测试结果显示 `✓ PASS`
- ✅ 测试数据已清理

如果所有测试都通过，说明 RLS 策略配置正确，可以开始应用开发！

## 下一步

RLS 测试通过后，可以继续：

1. 配置 Supabase Storage（任务 2.3）
2. 创建 Supabase 客户端配置（任务 2.4）
3. 定义数据库类型（任务 3.1）
4. 开始实现认证功能（任务 4.1-4.7）
