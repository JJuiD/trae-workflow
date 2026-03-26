---
name: "requirement-discussion"
description: "Updates development plan docs with requirements and progress. Invoke when user wants to clarify requirements or update task documents."
---

# 需求讨论

此Skill负责从 `e:\project\trae-workflow\.trae\rules\development-plan.md` 获取最新开发计划，详细更新 `e:\project\trae-workflow\plans` 目录下进行中的开发markdown文档，包括需求变更、技术方案调整和进度更新等内容。

## 触发条件

当用户提出以下场景时触发：
- 用户要求讨论当前任务的细节
- 用户询问某个功能的实现方式
- 用户需要明确需求的选择
- 需要更新开发计划文档

## 职责范围

- 从 `e:\project\trae-workflow\.trae\rules\development-plan.md` 获取最新开发计划
- 更新 `e:\project\trae-workflow\plans` 目录下进行中的开发markdown文档
- 记录需求变更内容
- 记录技术方案调整
- 更新进度信息
- 设置任务状态为"开发中"

## 执行流程

### 1. 获取当前开发计划

读取 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 当前任务名称
- 当前Git分支
- 当前状态
- 已明确的需求

### 2. 读取进行中的任务文档

读取 `e:\project\trae-workflow\plans` 目录下对应的任务文档：
- 任务目标
- 已明确的需求
- 需要讨论的待定项

### 3. 理解用户需求

针对用户提出的需求或问题：
- 使用术语表中的术语进行标准化描述
- 结合游戏策划案中的设计理念
- 提供合理的选项范围

### 4. 提供结构化选项

使用 AskUserQuestion 工具提供 2-4 个结构化选项，选项应：
- 覆盖不同的实现方向
- 包含明确的利弊说明
- 符合项目技术栈和架构

### 5. 更新任务文档（仅当用户明确需求后）

当用户明确需求后，更新 `e:\project\trae-workflow\plans` 目录下进行中的开发markdown文档：
- 记录已确定的需求细节
- 添加新的需求备注
- 更新技术方案（如有调整）
- 更新任务状态

### 6. 设置开发状态（仅当用户明确说"开始开发"时）

当用户明确说"开始开发"时，更新 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 将任务状态从"策划中"流转为"开发中"
- 记录状态变更时间

**重要**：状态流转必须由用户主动明确触发，不得自动流转。

## 状态流转

使用 AskUserQuestion 工具询问用户选择下一步：

```
options: [
  { label: "1. 开始开发", description: "将任务状态从'策划中'流转为'开发中'" },
  { label: "2. 继续讨论", description: "继续需求讨论，用户输入讨论内容" }
]
```

| 选项 | 说明 |
|------|------|
| 1. 开始开发 | 将任务状态从"策划中"流转为"开发中"，触发 development-assistance |
| 2. 继续讨论 | 继续需求讨论，用户输入讨论内容 |

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 进行中的任务目录 | `e:\project\trae-workflow\plans` |
| 术语表 | `e:\project\trae-workflow\docs\术语表.md` |
| 游戏策划案 | `e:\project\trae-workflow\docs\游戏策划案_中间塔防.md` |

## 注意事项

- 始终使用术语表中的标准术语
- 确保文档与实际讨论内容一致
- 保持文档版本清晰可追溯
- 所有选项应符合项目文档管理规范