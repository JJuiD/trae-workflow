---
alwaysApply: false
description: Follow these guidelines when writing code
---

# Coding Guidelines

## Performance

- 优先使用引用传递，避免不必要的对象复制
- 需要修改时使用可变对象，否则使用不可变对象
- 谨慎使用深度拷贝

## Code Structure

- 使用卫语句（guard clauses）处理提前退出
- 嵌套层级控制在 3 层以内
- 不使用魔法数字，用命名常量替代

## Naming Conventions

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录/文件 | lowercase_with_underscores | game_entity, tower_attack.py |
| 类名 | PascalCase | TowerBase |
| 函数/变量 | lowercase_with_underscores | calculate_damage, tower_level |

- 使用有意义的名称，避免 `data`、`temp`、`tmp`
- 不使用无意义缩写，单字母变量仅用于循环计数

## Code Organization

- 函数保持单一职责，长度建议不超过 50 行
- 相关函数组织在同一模块，按职责划分
- 避免混合不同层次的逻辑

## Comments

- 注释解释为什么，而非做什么
- 注释说明业务逻辑、决策原因或复杂算法
- 为公共 API 提供文档字符串
- 代码变更后同步更新注释