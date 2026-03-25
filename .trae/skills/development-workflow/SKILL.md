---
name: "development-workflow"
description: "Creates and switches Git branches. Invoke when user says '创建需求' to create new development branches and plans."
---

# 开发工作流

此Skill负责Git分支创建与切换，在plans目录下创建开发计划文档，并确保分支管理与开发计划同步。

## 触发条件

当用户明确说"创建需求"时触发。

## 职责范围

- 创建和切换Git分支
- 在 `e:\project\trae-workflow\plans` 创建开发计划markdown文档
- 更新 `e:\project\trae-workflow\.trae\rules\development-plan.md` 中的开发计划内容

## 执行流程

### 1. 判断需求类型

首先判断用户创建的需求是新需求还是迭代需求：

**判断依据**：
- 用户明确说明是对现有功能的修改/扩展/迭代 → 迭代需求
- 用户说明是新增独立功能 → 新需求

**迭代需求处理**：
如果用户提到以下场景，应先调用 `requirement-iteration` skill：
- 需要在现有基础上进行功能扩展
- 需要修改已有功能的行为
- 需要参考历史实现细节
- 需要回顾过往技术方案

调用 `requirement-iteration` skill 完成后，获取其输出的结构化任务信息，再继续执行后续步骤。

### 2. 检查进行中的开发任务

读取 `e:\project\trae-workflow\.trae\rules\development-plan.md` 文件，检查是否存在进行中的开发任务记录。

- 如果存在进行中的任务（状态为"开发中"），则直接输出当前任务状态，不执行后续步骤
- 如果不存在进行中的任务，则继续执行以下步骤

### 3. 接收任务输入

接收来自以下模块的任务信息：
- `requirement-iteration` 输出的迭代任务详情
- 用户直接说明的新任务需求
- 从 `e:\project\trae-workflow\docs\开发计划.md` 提取的下周任务

### 4. Git分支操作

执行以下Git操作：
1. 基于当前分支创建新分支
2. 分支命名格式：`feature/任务标识` 或 `bugfix/问题描述`
3. 切换到新创建的分支

### 5. 创建开发计划文档

在 `e:\project\trae-workflow\plans` 目录下创建开发计划文档：
- 文件命名格式：`YYYY-MM-DD_任务名称.md`
- 文档内容应包含：
  - 任务目标
  - 详细任务拆解
  - 产出清单
  - 验收标准
  - 技术方案（如有）

### 6. 更新开发进度

更新 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 当前Git分支名称
- 当前任务名称
- 任务状态（初始状态由 `requirement-discussion` 设置）
- 开始时间

## 状态定义

| 状态 | 说明 |
|------|------|
| 策划中 | 需求已创建，等待详细讨论 |
| 开发中 | 需求已明确，开始编码实现 |
| 待审查 | 代码已生成，等待 code-review 审查 |
| 审查中 | 正在进行代码审查 |
| 待文档 | 审查通过，等待 documentation 更新文档 |
| 已完成 | 全部开发工作完成 |

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发计划 | `e:\project\trae-workflow\docs\开发计划.md` |
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 开发计划目录 | `e:\project\trae-workflow\plans` |

## 注意事项

- 此Skill仅负责分支创建和计划文档初始化
- 状态由 `requirement-discussion` 在用户说"开始开发"后设置
- 不承担开发阶段的任务执行与管理工作
- 所有文件操作使用绝对路径
- Git操作需在 PowerShell 环境中执行