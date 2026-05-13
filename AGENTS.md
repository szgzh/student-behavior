# 项目上下文

## 技术栈

- **核心**: Vite 7, TypeScript, Express
- **UI**: Tailwind CSS

## 项目概述

学生行为记录系统 - 用于记录、追踪和分析学生行为的综合管理平台。

### 主要功能

1. **仪表盘** - 展示学生统计概览、本周/本月排行预览
2. **学生管理** - 添加/编辑/删除学生信息，查看学生积分和称号
3. **行为记录** - 记录学生正面/负面行为，自动计算积分
4. **积分排行** - 按周/月/总积分排名，查看学生称号
5. **分析报告** - 单个学生的详细行为分析报告，支持生成下载

## 目录结构

```
├── scripts/            # 构建与启动脚本
│   ├── build.sh        # 构建脚本
│   ├── dev.sh          # 开发环境启动脚本
│   ├── prepare.sh      # 预处理脚本
│   └── start.sh        # 生产环境启动脚本
├── server/             # 服务端逻辑
│   ├── routes/         # API 路由
│   ├── server.ts       # Express 服务入口
│   └── vite.ts         # Vite 中间件集成
├── src/                # 前端源码
│   ├── index.css       # 全局样式
│   ├── index.ts        # 客户端入口
│   ├── main.ts         # 主应用逻辑（路由、视图渲染）
│   ├── types.ts        # 类型定义和行为配置
│   ├── store.ts        # 状态管理
│   └── mockData.ts     # 模拟数据生成
├── index.html          # 入口 HTML
├── package.json        # 项目依赖管理
├── tsconfig.json       # TypeScript 配置
└── vite.config.ts      # Vite 配置
```

## 核心数据结构

### 学生 (Student)
```typescript
interface Student {
  id: string;
  name: string;
  class: string;
  avatar: string;
  createdAt: string;
}
```

### 行为记录 (BehaviorRecord)
```typescript
interface BehaviorRecord {
  id: string;
  studentId: string;
  behaviorId: string;
  score: number;
  date: string;
  note?: string;
}
```

### 学生称号
| 称号 | 图标 | 最低积分 |
|------|------|----------|
| 学习之星 | 📚 | 100分 |
| 进步之星 | 🚀 | 50分 |
| 文明之星 | 🌟 | 30分 |
| 劳动之星 | 🏆 | 20分 |
| 团结之星 | 🤝 | 10分 |

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- 使用 Tailwind CSS 进行样式开发
- 数据存储在内存中（重启后重置）
- 模拟数据在启动时自动生成

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、Express `req`/`res`、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### 状态管理

使用简单的发布-订阅模式（Store），在 `src/store.ts` 中实现：
- `getStudents()` - 获取所有学生
- `addRecord()` - 添加行为记录
- `getWeeklyLeaderboard()` - 获取周榜
- `getMonthlyLeaderboard()` - 获取月榜
- `getStudentReport()` - 获取学生分析报告

## 访问地址

开发环境：http://localhost:5000
