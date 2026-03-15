# Tailwind CSS 配置说明

## 配置概览

本项目已成功配置 Tailwind CSS v4，包含自定义响应式断点和颜色主题。

## 响应式断点

项目配置了三个响应式断点，适配移动端、平板端和桌面端：

- **mobile**: `< 768px` (移动设备)
- **tablet**: `768px - 1023px` (平板设备)
- **desktop**: `≥ 1024px` (桌面设备)

### 使用示例

```jsx
// 在不同设备上显示不同的样式
<div className="mobile:text-sm tablet:text-base desktop:text-lg">
  响应式文字大小
</div>

// 在移动端隐藏，桌面端显示
<div className="mobile:hidden desktop:block">
  仅在桌面端显示
</div>
```

## 自定义颜色主题

项目配置了适合旅行应用的配色方案：

### 品牌色
- `brand-primary`: `#ffb545` (温暖的橙色 - 代表冒险和活力)
- `brand-secondary`: `#00c46a` (清新的绿色 - 代表自然和探索)

### 深色系
- `dark-0`: `#242a2e`
- `dark-1`: `#2d3439`
- `dark-2`: `#42484d`

### 浅色系
- `light-1`: `#aaa`
- `light-2`: `#ececec`
- `light-3`: `#d6dee0`

### 使用示例

```jsx
// 使用品牌主色作为背景
<button className="bg-brand-primary text-dark-0 px-4 py-2 rounded">
  立即探索
</button>

// 使用品牌副色
<div className="bg-brand-secondary text-white p-6">
  开始你的旅程
</div>

// 使用深色和浅色系
<div className="bg-dark-1 text-light-2 p-4">
  深色主题内容
</div>
```

## 字体配置

项目使用 `Manrope` 作为默认字体家族：

```jsx
<div className="font-sans">
  使用 Manrope 字体
</div>
```

## 配置文件

- `postcss.config.js`: PostCSS 配置，包含 Tailwind CSS 和 Autoprefixer
- `src/index.css`: Tailwind CSS 导入和自定义主题配置

## 验证配置

运行以下命令验证配置是否正确：

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 注意事项

1. 本项目使用 Tailwind CSS v4，配置方式与 v3 不同
2. 自定义主题通过 CSS 变量在 `@theme` 块中定义
3. 响应式断点可以通过 `mobile:`、`tablet:`、`desktop:` 前缀使用
4. 保持了原有的 CSS 变量（`:root`）以兼容现有的 CSS Module 文件
