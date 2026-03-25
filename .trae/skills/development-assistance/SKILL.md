---
name: "development-assistance"
description: "Provides technical assistance during development. Invoke when user needs code generation, problem troubleshooting or technical guidance."
---

# 开发辅助

此Skill提供开发过程中的技术辅助功能，包括代码生成、问题排查和技术方案建议等支持。

## 触发条件

当用户提出以下场景时触发：
- 需要代码生成
- 遇到问题需要排查
- 需要技术方案建议
- 需要开发方向指引
- 不确定需求如何实现

## 职责范围

- 代码生成
- 问题排查
- 技术方案建议
- 开发方向指引

## 执行流程

### 1. 理解当前任务

读取 `e:\project\trae-workflow\plans` 目录下进行中的任务文档：
- 任务目标
- 已明确的需求
- 技术方案
- 验收标准

### 2. 理解用户需求

分析用户的技术问题或请求：
- 代码生成需求
- 问题描述
- 技术方案疑问
- 方向指引请求

### 3. 提供技术支持

根据用户需求提供相应支持：

#### 代码生成
- 基于任务文档中的需求生成代码
- 遵循项目编码规范
- 使用术语表中的标准术语
- 确保代码结构清晰

#### 问题排查
- 分析问题原因
- 提供解决方案
- 给出代码修复示例

#### 技术方案建议
- 分析技术可行性
- 提供多种实现方案
- 说明各方案优缺点

#### 开发方向指引
- 根据当前进度推荐下一步
- 结合开发计划给出建议

### 4. 更新代码

根据讨论结果更新当前分支代码：
- 生成新的代码文件
- 修改现有代码
- 遵循Git工作流

### 5. 更新任务文档

记录开发过程中的重要决策和变更：
- 更新技术方案
- 记录问题解决方案
- 更新进度信息

## 状态流转

| 阶段 | 状态 | 说明 |
|------|------|------|
| 开发中 | 代码生成和调试 | development-assistance 生成代码 |
| 待审查 | 代码已生成 | 提交给 code-review 审查 |
| 审查迭代 | 审查发现问题 | 返回 development-assistance 优化 |

## 与 code-review 的协作

- `development-assistance` 更新代码后，触发 `code-review` 进行审查
- `code-review` 审查后，如有问题则反馈给 `development-assistance` 优化
- 此迭代过程最多进行3轮

## 文件路径

| 文件 | 路径 |
|------|------|
| 进行中的任务目录 | `e:\project\trae-workflow\plans` |
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 术语表 | `e:\project\trae-workflow\docs\术语表.md` |
| 游戏策划案 | `e:\project\trae-workflow\docs\游戏策划案_中间塔防.md` |
| 编码规范 | `e:\project\trae-workflow\.trae\rules\coding-rule.md` |

## 注意事项

- 始终使用术语表中的标准术语
- 代码遵循项目编码规范
- 优先参考现有代码风格
- 保持与游戏策划案的一致性