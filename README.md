# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

h5项目

/**
 * 过滤条件
 * 五行
 * 波色
 * 大小
 * 单双
 * 家野生肖
 * 合单双
 * 段数
 * 合数
 * 
 */

## 数据源与维护

本项目采用自动化脚本生成 `src/data/data.json` 作为唯一数据源，消除了所有硬编码数据。

### 数据生成

使用 `scripts/generate_lhc_data.cjs` 脚本生成指定年份的数据：

```bash
# 生成 2026 年数据
node scripts/generate_lhc_data.cjs 2026
```

### 数据结构规范

`data.json` 包含以下分类：
- `生肖`: { [key: string]: number[] }
- `五行`: { [key: string]: number[] }
- `波色`: { [key: string]: number[] }
- `五门`: { [key: string]: number[] }
- `段位`: { [key: string]: number[] }
- `合数`: { [key: string]: number[] }
- `合单双`: { [key: string]: number[] }
- `其它属性`: { [key: string]: string[] } (如家禽、野兽等)

前端组件通过 `src/services/lotteryData.ts` 访问数据，无需直接解析 JSON。
