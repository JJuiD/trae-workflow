---
name: "requirement-iteration"
description: "Analyzes existing features and outputs structured tasks. Invoke when user wants to iterate on existing features or modify old modules."
---

# 需求迭代

此Skill负责在需要更新旧模块时，全面了解现有功能实现，分析功能边界和技术细节，总结具体开发任务和相关知识要点，并将结构化的任务信息输出给 `development-workflow` 模块。

## 触发条件

当用户提出以下场景时触发：
- 需要在现有基础上进行功能扩展
- 需要修改已有功能的行为
- 需要更新旧模块
- 需要回顾历史实现细节

## 职责范围

- 全面了解现有功能实现
- 分析功能边界和技术细节
- 总结具体开发任务和相关知识要点
- 将结构化任务信息输出给 `development-workflow` 模块

## 执行流程

### 阶段一：历史文档查阅

#### 1. 查阅开发计划

读取 `e:\project\trae-workflow\docs\开发计划.md`：
- 项目整体架构
- 各阶段任务规划
- 技术选型决策
- 里程碑节点

#### 2. 查阅历史文档

检查 `e:\project\trae-workflow\docs` 目录：
- 列出所有历史阶段文档
- 按时间顺序梳理各阶段实现内容
- 提取关键技术决策和变更记录

#### 3. 查阅现有代码

分析当前Git分支的代码实现：
- 模块结构和组织
- 核心逻辑实现
- 接口定义
- 依赖关系

### 阶段二：需求分析

#### 1. 明确迭代范围

确定：
- 需要修改的具体模块
- 功能边界变化
- 向后兼容性要求

#### 2. 技术细节分析

整理：
- 现有实现的问题点
- 技术债务
- 性能考虑
- 扩展性设计

#### 3. 开发任务拆解

将迭代需求拆分为具体开发任务：
```markdown
## 迭代任务输出

### 任务概述
- 迭代背景
- 目标模块
- 兼容性要求

### 任务拆解
1. 任务1：xxx
   - 知识要点：xxx
   - 技术细节：xxx
2. 任务2：xxx
   - 知识要点：xxx
   - 技术细节：xxx

### 风险提示
- 风险点1
- 风险点2

### 相关知识
- 需要了解的现有代码：xxx
- 需要遵守的技术规范：xxx
```

### 阶段三：输出至开发工作流

将结构化任务信息传递给 `development-workflow` 模块：
- 输出任务概述
- 输出详细任务拆解
- 输出知识要点
- 输出风险提示

完成后，等待 `development-workflow` 创建分支和计划文档。

## 状态定义

| 状态 | 说明 |
|------|------|
| 分析中 | 正在分析现有功能和历史文档 |
| 已输出 | 结构化任务已输出给 development-workflow |

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发计划 | `e:\project\trae-workflow\docs\开发计划.md` |
| 历史阶段目录 | `e:\project\trae-workflow\docs` |
| 知识模块目录 | `e:\project\trae-workflow\docs\modules` |
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |

## 注意事项

- 确保对现有实现的理解准确完整
- 任务拆解要具体可执行
- 知识要点要覆盖关键代码位置
- 风险提示要明确可能的问题