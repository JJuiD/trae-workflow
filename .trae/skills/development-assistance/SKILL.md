---
name: "development-assistance"
description: "Provides problem fixing and code assistance during development. Invoke when user needs problem troubleshooting or technical guidance."
---

# 开发辅助

此Skill提供开发过程中的技术辅助功能，包括代码生成、问题排查和技术方案建议等支持。当用户说"问题修复"时，按照增强工作流执行。

## 触发条件

当用户提出以下场景时触发：
- 用户说"问题修复" (Problem Fix)
- 需要代码生成
- 遇到问题需要排查
- 需要技术方案建议
- 需要开发方向指引
- 不确定需求如何实现

## 职责范围

- 问题分析与定位
- 代码差异分析与总结
- 基于任务文档的修复执行
- 代码审查流程实施
- 开发结束/反馈选项处理
- 代码生成
- 问题排查
- 技术方案建议
- 开发方向指引

## 状态管理

| 状态 | 说明 |
|------|------|
| 待分析 | 等待分析问题差异和读取任务文档 |
| 修复中 | 正在执行问题修复和调试 |
| 待审查 | 修复已完成，等待代码审查 |
| 审查迭代 | 审查发现问题，返回继续修复 |
| 待选项 | 审查通过，等待用户选择结束或继续 |

## 增强工作流

### 阶段一：理解当前任务

#### 1.1 定位任务文档

从 `e:\project\trae-workflow\.trae\rules\development-plan.md` 获取当前任务名称，然后读取对应的任务文档：
- 任务文件路径：`e:\project\trae-workflow\plans\{任务名称}.md`

#### 1.2 读取任务文档内容

从任务文档中提取：
- **任务目标**：本次开发的核心目标
- **已明确的需求**：具体的功能需求
- **技术方案**：预定的技术实现方案
- **验收标准**：用于验证任务完成的标准

#### 1.3 呈现分析结果

向用户展示任务文档核心内容，确认是否开始修复（用户需明确说"问题修复"以继续）。

---

### 阶段二：修复执行

#### 2.1 分析Git代码差异

用户确认"问题修复"后，执行以下命令获取当前分支与main分支的差异：
```bash
git fetch origin main
git diff origin/main --stat
git diff origin/main --name-only
```

生成代码差异总结报告，包括：
- 新增文件列表
- 修改文件列表
- 删除文件列表
- 主要变更内容概述

#### 2.2 问题排查与修复

根据问题描述执行问题修复：

**问题排查**：
- 分析问题原因
- 定位问题代码位置
- 提供解决方案

**代码修复规范**：
- 基于问题描述修复代码
- 遵循项目编码规范
- 使用术语表中的标准术语
- 确保代码结构清晰
- 添加必要的中文注释

**技术方案建议**：
- 分析技术可行性
- 提供多种实现方案
- 说明各方案优缺点

**开发方向指引**：
- 根据当前进度推荐下一步
- 结合开发计划给出建议

#### 2.3 更新代码

根据讨论结果更新当前分支代码：
- 生成新的代码文件
- 修改现有代码
- 遵循Git工作流

#### 2.4 更新任务文档

记录修复过程中的重要决策和变更：
- 更新技术方案
- 记录问题解决方案
- 更新进度信息

---

### 阶段三：代码审查（强制执行）

每次修复迭代完成后，**必须**执行代码审查流程。

#### 3.1 触发 code-review

在完成代码更新后，触发 `code-review` skill进行审查。

#### 3.2 审查流程

- `code-review` 审查后，如有问题则反馈给 `development-assistance` 继续修复
- 此迭代过程最多进行3轮
- 每轮迭代需记录审查意见和修改内容

#### 3.3 审查通过

当 code-review 审查通过后，进入阶段四。

---

### 阶段四：完成选项（审查通过后执行）

向用户呈现**两个固定选项**：

#### 选项一：修复结束 ("修复结束")

当用户选择此选项时：

1. **更新任务状态**
   - 修改 `e:\project\trae-workflow\.trae\rules\development-plan.md` 中的状态为"待文档"
   - 记录完成时间

2. **触发文档整理**
   - 自动调用 `documentation` skill
   - 按照 documentation SKILL.md 的流程更新项目文档

3. **完成提示**
   - 告知用户问题修复已完成
   - 文档整理已启动

#### 选项二：继续修复 ("继续修复")

当用户选择此选项时：

1. **收集修复意见**
   - 允许用户输入具体的修复建议
   - 记录用户反馈的内容

2. **整合反馈**
   - 将修复意见纳入开发考量
   - 明确下一步改进方向

3. **重新执行修复**
   - 从阶段二开始，根据新反馈重新执行修复流程

---

## 文件路径

| 文件 | 路径 |
|------|------|
| 进行中的任务目录 | `e:\project\trae-workflow\plans` |
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 术语表 | `e:\project\trae-workflow\docs\术语表.md` |
| 游戏策划案 | `e:\project\trae-workflow\docs\游戏策划案_中间塔防.md` |
| 编码规范 | `e:\project\trae-workflow\.trae\rules\coding-rule.md` |
| 文档Skill | `e:\project\trae-workflow\.trae\skills\documentation\SKILL.md` |
| 代码审查Skill | `e:\project\trae-workflow\.trae\skills\code-review\SKILL.md` |

## 与其他Skill的协作

### 与 code-review 的协作
- `development-assistance` 更新代码后，触发 `code-review` 进行审查
- `code-review` 审查后，如有问题则反馈给 `development-assistance` 继续修复
- 此迭代过程最多进行3轮

### 与 documentation 的协作
- 当用户选择"修复结束"后，触发 `documentation` skill
- `documentation` 负责更新项目文档和任务文档

## 注意事项

- 始终使用术语表中的标准术语
- 代码遵循项目编码规范
- 优先参考现有代码风格
- 保持与游戏策划案的一致性
- 每次修复迭代必须经过代码审查
- 审查通过后必须呈现两个固定选项让用户选择
- 维护清晰的状态管理，确保工作流正确流转