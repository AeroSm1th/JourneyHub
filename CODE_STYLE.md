# 代码规范文档

## 概述

本项目使用 ESLint 和 Prettier 来保持代码风格的一致性，并通过 Husky 和 lint-staged 在提交前自动检查和修复代码。

## 工具配置

### ESLint

ESLint 配置文件：`.eslintrc.json`

**主要规则：**
- 继承 `react-app` 和 `@typescript-eslint/recommended` 规则
- 集成 Prettier 规则
- 未使用的变量警告（以 `_` 开头的变量除外）
- 禁止使用 `any` 类型（警告级别）
- 限制 `console` 使用（仅允许 `console.warn` 和 `console.error`）

### Prettier

Prettier 配置文件：`.prettierrc.json`

**格式规则：**
- 使用单引号
- 使用分号
- 每行最大 100 字符
- 2 空格缩进
- 使用 LF 换行符
- 尾随逗号（ES5 风格）

### Pre-commit Hooks

使用 Husky 和 lint-staged 在提交前自动运行代码检查和格式化。

**配置位置：**
- Husky 配置：`.husky/pre-commit`
- lint-staged 配置：`package.json` 中的 `lint-staged` 字段

**自动执行的操作：**
- 对暂存的 `.ts`、`.tsx`、`.js`、`.jsx` 文件运行 ESLint 修复
- 对暂存的所有源文件运行 Prettier 格式化

## 可用命令

### 代码检查

```bash
# 运行 ESLint 检查
npm run lint

# 运行 ESLint 并自动修复问题
npm run lint:fix

# 运行 Prettier 格式化
npm run format
```

### 工作流程

1. **开发时**：编写代码，编辑器会根据 ESLint 配置实时提示问题
2. **提交前**：运行 `git add` 添加文件后，执行 `git commit`
3. **自动检查**：pre-commit hook 会自动运行 lint-staged
4. **自动修复**：ESLint 和 Prettier 会自动修复可修复的问题
5. **提交成功**：如果所有检查通过，提交成功

## 编辑器集成

### VS Code

推荐安装以下扩展：
- ESLint
- Prettier - Code formatter

在 `.vscode/settings.json` 中添加：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 常见问题

### Q: 提交时卡住了怎么办？

A: 可能是 lint-staged 在处理大量文件。请耐心等待，或者使用 `git commit --no-verify` 跳过 hook（不推荐）。

### Q: 如何临时跳过 pre-commit hook？

A: 使用 `git commit --no-verify` 或 `git commit -n`（不推荐在正常开发中使用）。

### Q: ESLint 和 Prettier 规则冲突怎么办？

A: 项目已配置 `eslint-config-prettier` 来禁用与 Prettier 冲突的 ESLint 规则。

## 规则定制

如需修改规则，请编辑：
- ESLint 规则：`.eslintrc.json`
- Prettier 规则：`.prettierrc.json`

修改后建议运行 `npm run lint:fix` 和 `npm run format` 来统一现有代码风格。
