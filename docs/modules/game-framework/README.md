# 游戏框架

## 概述

第1周项目初始化建立的基础游戏框架，基于HTML5 Canvas实现。

## 技术栈

- HTML5 Canvas (2D渲染)
- JavaScript (原生，无框架)
- npm 包管理

## 项目结构

```
MidTowerDefense/
├── docs/                      # 项目文档
├── src/                       # 源代码
├── assets/                    # 游戏资源
├── config/                    # 配置文件
├── test/                      # 测试代码
├── index.html                 # 入口HTML
└── package.json               # npm配置
```

## 核心类

### Game 类

位置：`src/main.js`

```javascript
class Game {
    constructor(canvas, ctx)    // 初始化画布和上下文
    update(delta_time)          // 游戏状态更新
    render()                    // 渲染画面
    gameLoop(current_time)      // 游戏主循环
    start()                     // 启动游戏
}
```

## 游戏循环

使用 `requestAnimationFrame` 实现60fps游戏循环：

1. 计算 delta_time（帧间隔）
2. 调用 `update(delta_time)` 更新游戏状态
3. 调用 `render()` 渲染画面
4. 递归调用 `gameLoop()`

## 画布配置

- 默认尺寸：800x600
- 背景色：#16213e

## 开发命令

| 命令 | 说明 |
|------|------|
| npm run dev | 启动开发服务器 |
| npm run build | 生产构建 |