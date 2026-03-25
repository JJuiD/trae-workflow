---
name: "hook"
description: "Universal hook. Always active. Check conditions and trigger appropriate workflows after each conversation."
---

# Universal Hook

此 Skill 作为全局 Hook，在每次对话后检查条件并触发相应工作流。

## 触发时机

每次 assistant 回复用户后自动执行（description 足够通用以匹配任意输入）

## 执行流程

### 1. 检查开发状态

读取 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 任务状态是否为"**开发中**"

### 2. 检查 Git 分支

运行 `git branch --show-current`：
- 是否为**非 main/master 分支**

### 3. 触发 Code Review（如条件满足）

当同时满足：
1. 任务状态 = "开发中"
2. Git 分支 ≠ "main" 且 ≠ "master"

则自动触发 `code-review` skill：
- 执行完整代码审查流程
- 生成审查报告
- 更新开发进度状态

### 4. 其他检查

- 检查是否有待提交的代码变更
- 检查 git hooks 是否已配置
- 提醒用户未保存的更改

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| Code Review Skill | `e:\project\trae-workflow\.trae\skills\code-review\SKILL.md` |

## 注意事项

- 此 Skill 依赖 Trae IDE 的 Skill 触发机制
- 如果 description 无法匹配所有输入，可能需要调整描述词
- 触发结果会显示在对话中
