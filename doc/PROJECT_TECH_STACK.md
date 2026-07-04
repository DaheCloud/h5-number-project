# project-h5 技术栈分析文档

> 本文档基于当前代码库的实际依赖、配置文件与源码组织方式整理而成。
> 项目定位：移动端 H5 应用 —— 六合彩号码分析工具，属于 `pnpm-monorepo-project` 仓库（pnpm monorepo）下的一个子包。

---

## 一、核心技术栈总览

| 分类 | 技术 | 版本 | 用途 |
| --- | --- | --- | --- |
| 前端框架 | Vue | ^3.5.21 | 视图层（Composition API + `<script setup>`） |
| 构建工具 | Vite | ^8.1.3 | 开发服务器 / 生产打包 |
| 语言 | TypeScript | ~5.8.3 | 类型安全 |
| 类型检查 | vue-tsc | ^3.0.7 | Vue SFC 类型校验（`vue-tsc -b`） |
| 路由 | Vue Router | ^4.5.1 | SPA 路由（Hash 模式） |
| 状态管理 | Pinia | ^3.0.3 | 全局状态（选号列表等） |
| CSS 框架 | Tailwind CSS | ^4.1.14 | 原子化 CSS（v4 CSS-first） |
| 组件库 | FlyonUI | ^2.4.1 | 基于 Tailwind 的 UI 组件库 |
| 动画库 | animate.css | ^4.1.1 | 通用 CSS 动画 |
| 图标方案 | Iconify + Tabler | - | 图标系统 |
| 移动端适配 | postcss-px-to-viewport-8-plugin | ^1.2.5 | px → vw 自动换算 |
| 单元测试 | Vitest | ^3.2.6 | 测试运行器 |
| 测试工具 | @vue/test-utils | ^2.4.6 | Vue 组件挂载/交互测试 |
| DOM 环境 | jsdom | ^28.1.0 | 测试用浏览器环境 |

---

## 二、UI 框架与样式方案

### 1. Tailwind CSS v4（CSS-first 配置）
- 通过官方 Vite 插件 `@tailwindcss/vite` 集成，无需 `tailwind.config.js`。
- 主题使用 `@theme` 指令在 `src/styles/style.css` 中以 CSS 变量定义（色板、圆角、阴影、间距、控件高度）。

```css
@import "tailwindcss";
@theme {
  --color-primary: #6336ff;
  --color-success: #10b981;
  --radius-md: 14px;
  --shadow-card: 0 6px 14px rgba(15, 23, 42, 0.06);
  /* ... */
}
```

### 2. FlyonUI 组件库
- 以 Tailwind 插件方式接入：`@plugin "flyonui"` + `@import "flyonui/variants.css"`。
- 提供 `btn`、`modal`、`alert`、`overlay`、`badge`、`card`、`menu`、`input` 等组件类。
- 在 `main.ts` 中执行 `import "flyonui/flyonui"` 触发其 JS 行为初始化。

### 3. 自定义设计系统
`src/styles/style.css` 内沉淀了一套通用工具类，与 Tailwind 配合使用：
- `.u-chip` — 标签芯片
- `.u-btn` / `.u-btn-primary` / `.u-btn-danger` / `.u-btn-ghost` — 统一按钮
- `.u-card` — 内容卡片
- `.u-section` / `.u-section-title` — 区块容器
- `.u-tabular` — 数字等宽对齐
- `.page-container` — 移动端居中画幅容器（max-width 768px）
- `.scrollbar-hide` — 隐藏滚动条

### 4. 移动端自适应（vw 适配）
- `postcss.config.cjs` 中配置 `postcss-px-to-viewport-8-plugin`：
  - 设计稿宽度 `viewportWidth: 375`
  - 通过 `selectorBlackList` 排除 Tailwind 工具类与 FlyonUI 组件类，避免其内部 px 被误转为 vw。
- `index.html` 中设置 `viewport-fit=cover`，组件中使用 `env(safe-area-inset-bottom)` 适配刘海屏/底部安全区。

---

## 三、图标库

采用 **Iconify** 方案，具体使用 **Tabler** 图标集：

| 依赖 | 作用 |
| --- | --- |
| `@iconify/tailwind4` ^1.2.3 | Tailwind v4 插件，支持 `icon-[set--name]` 类名语法 |
| `@iconify-json/tabler` ^1.2.35 | Tabler 图标的离线 JSON 数据源 |

**使用方式**（见 `App.vue` 底部 Tabbar）：
```html
<span class="icon-[tabler--home] size-5"></span>
```
按需引入、零运行时请求，构建时静态生成图标 CSS。

---

## 四、路由与状态管理

### 路由（Vue Router 4）
- 模式：`createWebHashHistory`（Hash 路由，适合静态托管）。
- base 取自环境变量 `VITE_BASE_URL`。
- 路由表 `src/routes/root.ts`：4 个主页面 + 2 个重定向，均使用懒加载（`() => import(...)`）。
- 全局守卫：
  - `beforeEach`：启动顶部进度条 + 动态设置 `document.title`。
  - `afterEach`：结束进度条。
- 进度条为自建轻量实现（`src/utils/progress.ts`，~30 行，零依赖），替代 `@bprogress/core`。

### 状态管理（Pinia 3）
- `src/stores/index.ts` 创建 pinia 实例。
- `src/stores/main.ts` 定义 `useMainStore`（setup 写法），管理全局选号列表 `selectedNumbers`，提供 `addNumber` / `removeNumber` / `clearAll`。

---

## 五、项目结构

```
src/
├── api/            # （预留）接口层
├── assets/         # （预留）静态资源
├── components/     # （预留）全局组件
├── data/
│   └── data.json   # 六合彩 1-49 号码属性数据（由脚本生成）
├── hooks/          # （预留）组合式函数
├── icons/          # （预留）自定义图标
├── routes/         # 路由配置（index.ts + root.ts）
├── services/
│   └── lotteryData.ts  # 号码数据服务（单例，封装数据查询）
├── stores/         # Pinia 状态（index.ts + main.ts）
├── styles/
│   └── style.css   # 全局样式 + Tailwind @theme 主题
├── typs/           # （预留）类型定义
├── utils/          # 工具函数
│   ├── feedback.ts       # 自建 Toast / Dialog
│   ├── numberMatcher.ts  # 号码条件匹配引擎
│   ├── progress.ts       # 路由进度条
│   └── zodiac.ts         # 生肖排序/分组工具
├── views/          # 页面（按模块组织，各含 components/ 子目录）
│   ├── home/            # 首页（工具入口导航）
│   ├── num-chose/       # 选号（01-49 数字池点选）
│   ├── filter-center/   # 筛选中心（生肖/头尾筛选）
│   └── filter-numbers/  # 筛选号码（多条件合并计算）
├── App.vue         # 根组件（自定义底部 Tabbar）
└── main.ts         # 应用入口
```

---

## 六、业务数据与脚本

### 数据生成
`scripts/generate_lhc_data.cjs`（Node.js CJS 脚本）：
- 根据传入年份（默认当前年）推算每个号码（1-49）对应的干支、生肖、纳音五行、波色。
- 计算五门、段位、合数、合单双等分类。
- 静态属性：家禽/野兽、单笔/双笔、男肖/女肖、天肖/地肖、阴阳、三合/六合 等。
- 输出至 `src/data/data.json`。

### 数据校验
`scripts/validate.cjs`：
- 校验各分类是否完整覆盖 1-49、是否存在重复或遗漏。

### 数据服务层
`src/services/lotteryData.ts`：
- 单例 `LotteryDataService`，在构造时解析 `data.json` 并组装为强类型的 `LotteryNumber[]`。
- 提供查询接口：`getAllNumbers` / `getNumber` / `getZodiacOptions` / `getOtherAttributeZodiacs` 等。

---

## 七、自建轻量组件（未引入第三方依赖）

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| Toast | `src/utils/feedback.ts` | 基于 FlyonUI `alert-soft-*` 样式，DOM 直插，2.5s 自动消失 |
| Dialog | `src/utils/feedback.ts` | 基于 FlyonUI `modal`/`overlay` 样式，Promise 返回确认结果 |
| 路由进度条 | `src/utils/progress.ts` | 顶部 2px 进度条，模拟递增 + 淡出，替代 @bprogress/core |
| 号码匹配引擎 | `src/utils/numberMatcher.ts` | 统一「条件 → 号码 ID」匹配逻辑，带缓存 |

---

## 八、测试方案

- **运行器**：Vitest（`globals: true`，全局可用 `describe`/`it`/`expect`）。
- **环境**：jsdom。
- **配置**：`vitest.config.ts`（独立于 `vite.config.ts`，复用 vue 插件与 `@` 别名）。
- **测试文件**（`tests/` 目录）：
  - `zodiac.spec.ts` — 生肖排序/分组逻辑
  - `lotteryData.spec.ts` — 数据服务
  - `filter_center.spec.ts` — 筛选中心
  - `filter_verify.spec.ts` — 筛选校验
- 运行命令：`npm test`（即 `vitest run`）。

---

## 九、工程配置

### Vite 配置（`vite.config.ts`）
- 路径别名：`@` → `./src`。
- 插件：`vue()` + `tailwindcss()`。
- base 路径：从 `VITE_BASE_URL` 读取并规范化（保证首尾 `/`）。
- 开发服务器允许访问 monorepo 上级目录（`fs.allow: ['../../']`）。

### TypeScript 配置
- `tsconfig.json` 采用 project references，引用 `tsconfig.app.json`（应用代码）与 `tsconfig.node.json`（Node 侧）。
- `tsconfig.app.json` 继承 `@vue/tsconfig/tsconfig.dom.json`，开启严格模式（`strict`、`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch` 等）。

### 脚本命令（`package.json`）
| 命令 | 作用 |
| --- | --- |
| `dev` | `vite --mode development` 启动开发服务 |
| `build` | `vue-tsc -b && vite build` 类型检查 + 打包 |
| `preview` | `vite preview` 预览构建产物 |
| `test` | `vitest run` 执行单元测试 |

---

## 十、运行环境与部署特征

- **包管理**：pnpm（monorepo 结构，位于 `packages/project-h5`）。
- **模块系统**：ESM（`"type": "module"`）。
- **目标平台**：移动端 H5，设计稿 375px，最大内容宽度 768px（桌面端居中呈现手机画幅）。
- **托管兼容性**：Hash 路由 + 可配置 base，适配各类静态托管（子路径部署友好）。
