# 工作流模块

## 概述

工作流模块定义了中间塔防项目的开发流程规范，基于Skill系统实现自动化需求处理。

## 流程架构

```
requirement-iteration → development-workflow → requirement-discussion
                                                    ↓
                                            development-assistance
                                                    ↓
                                               code-review
                                                    ↓
                                            documentation
```

## 流程说明

### 1. 需求创建
- **新需求**：直接由 `development-workflow` 创建分支
- **迭代需求**：先由 `requirement-iteration` 分析现有功能

### 2. 需求讨论
- `requirement-discussion` 明确需求细节
- 用户确认后说"开始开发"触发开发阶段

### 3. 开发实现
- `development-assistance` 生成代码
- 代码提交后触发审查

### 4. 代码审查
- `code-review` 进行最多3轮迭代审查
- 严重问题自动修复，非严重问题用户检查

### 5. 文档更新
- `documentation` 更新项目文档
- 更新完成后自动提交MR到master

## Skill列表

| Skill | 职责 |
|-------|------|
| development-workflow | 创建分支、计划文档 |
| requirement-discussion | 需求细节讨论 |
| development-assistance | 代码生成 |
| code-review | 代码审查 |
| documentation | 文档管理 |
| requirement-iteration | 迭代需求分析 |

## 状态定义

| 状态 | 说明 |
|------|------|
| 策划中 | 需求已创建，等待详细讨论 |
| 开发中 | 需求已明确，开始编码实现 |
| 待审查 | 代码已生成，等待code-review审查 |
| 待用户检查 | 审查完成，等待用户检查代码 |
| 审查迭代 | 审查发现问题，返回development-assistance优化 |
| 待文档 | 审查通过，等待documentation更新文档 |
| 已完成 | 全部开发工作完成 |

## 决策点

| 决策点 | 条件 | 结果 |
|--------|------|------|
| 需求类型判断 | 用户说明是新功能 | 直接进入开发工作流 |
| 需求类型判断 | 用户说明是修改现有功能 | 先执行requirement-iteration |
| 代码问题严重性 | 问题导致游戏无法运行 | 自动修复 |
| 代码问题严重性 | 问题为中等/轻微 | 用户检查决定 |
| 审查迭代 | 3轮内问题修复完成 | 进入文档更新 |
| 审查迭代 | 3轮后仍有严重问题 | 报告给用户决定 |