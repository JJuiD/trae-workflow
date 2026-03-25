# 游戏框架

## 概述

第1周项目初始化建立的基础游戏框架，基于HTML5 Canvas实现。

## 技术栈

- HTML5 Canvas (2D渲染)
- JavaScript (原生，ES6模块)
- npm 包管理

## 项目结构

```
MidTowerDefense/
├── docs/                      # 项目文档
├── src/                       # 源代码
│   ├── game/                 # 游戏核心逻辑
│   │   ├── map.js            # 地图网格系统
│   │   ├── crystal.js        # 中央水晶
│   │   └── player_position.js # 玩家方位定义
│   └── renderer/             # 渲染层
│       └── map_renderer.js   # 地图渲染器
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
    constructor(canvas, ctx)
    update(deltaTime)
    render()
    gameLoop(currentTime)
    start()
    selectDirection(direction)    // 选择玩家方位
    getAvailableDirections()      // 获取可用方位
    resetGame()                   // 重置游戏
}
```

### Map 类

位置：`src/game/map.js`

```javascript
class Map {
    constructor(size = 25)
    getTile(x, y)
    setTile(x, y, tileType)
    worldToGrid(worldX, worldY)
    gridToWorld(gridX, gridY)
    getCenterWorld()
}
```

### Crystal 类

位置：`src/game/crystal.js`

```javascript
class Crystal {
    constructor(x, y)
    takeDamage(amount)
    update(deltaTime)
    isAlive()
    reset()
}
```

### MapRenderer 类

位置：`src/renderer/map_renderer.js`

```javascript
class MapRenderer {
    constructor(ctx, tileSize)
    renderGrid(map)
    renderCrystal(crystal)
    renderPlayerPositions(map, occupiedDirections)
    renderMap(map, crystal, occupiedDirections)
}
```

## 常量定义

| 常量 | 值 | 说明 |
|------|-----|------|
| TILE_SIZE | 32 | 网格尺寸(像素) |
| DEFAULT_MAP_SIZE | 25 | 默认地图大小(网格数) |

## 玩家方位

位置统一在 `player_position.js` 管理：

| 方位 | 网格坐标 | 说明 |
|------|----------|------|
| top | (12, 11) | 上方玩家位置 |
| bottom | (12, 13) | 下方玩家位置 |
| left | (11, 12) | 左侧玩家位置 |
| right | (13, 12) | 右侧玩家位置 |

**规则**：4个方位互斥，先选先得

## 游戏循环

使用 `requestAnimationFrame` 实现60fps游戏循环：

1. 计算 deltaTime（帧间隔）
2. 调用 `update(deltaTime)` 更新游戏状态
3. 调用 `render()` 渲染画面
4. 递归调用 `gameLoop()`

## 画布配置

- 默认尺寸：800x600 (25x25 网格)
- 背景色：#16213e

## 开发命令

| 命令 | 说明 |
|------|------|
| npm run dev | 启动开发服务器 |
| npm run build | 生产构建 |