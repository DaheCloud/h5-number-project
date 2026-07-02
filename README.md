# 六合彩号码分析工具 (project-h5)

基于 Vite + Vue 3 + TypeScript + Vant 4 构建的移动端六合彩号码选号与筛选分析工具。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite
- **语言**: TypeScript
- **UI 组件**: Vant 4
- **样式**: TailwindCSS v4 + PostCSS
- **状态管理**: Pinia
- **路由**: Vue Router (Hash 模式)
- **测试**: Vitest + jsdom

## 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页 | `/home` | 工具入口导航 |
| 选号助手 | `/num-chose` | 数字/生肖/五行/条件多维选号 |
| 筛选中心 | `/filter-center` | 头尾/生肖/条件三 Tab 筛选 |
| 筛选号码 | `/filter-numbers` | 多维条件筛选 + 结果分析 |

## 快速开始

```bash
# 安装依赖（在 monorepo 根目录）
pnpm install

# 启动开发服务
pnpm --filter project-h5 dev

# 构建
pnpm --filter project-h5 build

# 运行测试
pnpm --filter project-h5 test
```

## 项目结构

```
src/
├── main.ts             # 应用入口
├── App.vue             # 根组件（Tabbar 布局）
├── routes/             # 路由配置
├── stores/             # Pinia Store
├── services/           # 数据服务层
├── utils/              # 工具函数
├── styles/             # 全局样式
├── data/               # 静态数据
└── views/              # 页面组件
    ├── home/           # 首页
    ├── num-chose/      # 选号助手
    ├── filter-center/  # 筛选中心
    └── filter-numbers/ # 筛选号码
```

## 数据来源

静态数据位于 `src/data/data.json`，包含 1-49 号六合彩号码的生肖、五行、波色、门数、段位、合数等完整属性信息。
