---
name: "code-review"
description: "Reviews code quality and provides feedback. Invoke when user asks for code review or after code generation."
---

# 代码审查

此Skill用于在 `development-assistance` 模块更新代码后，对整个分支的代码进行全面审查，检查代码质量、规范符合性和功能实现准确性，并将审查结果反馈给 `development-assistance` 模块进行优化。

## 触发条件

当用户提出以下场景时触发：
- 用户请求代码审查
- `development-assistance` 更新代码后需要审查
- 用户需要合并前的代码检查

## 职责范围

- 对整个分支的代码进行全面审查
- 检查代码质量
- 检查规范符合性
- 检查功能实现准确性
- 将审查结果反馈给 `development-assistance` 进行优化

## 执行流程

### 1. 获取当前分支代码

获取当前Git分支的最新代码变更：
```bash
git diff --name-only
git diff --stat
```

### 2. 代码审查

逐文件审查代码变更，重点关注：
- 新增文件的质量
- 修改文件的变更内容
- 删除文件的影响

#### 审查维度

##### 代码质量
- 代码结构和组织
- 命名规范一致性
- 代码可读性
- 注释完整性

##### 规范符合性
- 符合项目编码规范
- 合理的抽象层次
- 适当的模块化
- 错误处理完善

##### 功能实现
- 功能是否与需求匹配
- 术语使用是否规范
- 游戏机制实现是否正确

##### 潜在问题
- 逻辑错误
- 边界条件处理
- 性能问题
- 安全漏洞

### 3. 生成审查报告

```markdown
## 代码审查报告

### 审查范围
- 分支：xxx
- 文件数：X个新增，X个修改

### 优点
- 优点1
- 优点2

### 问题与建议
- [严重] 问题描述 → 建议修复方式
- [中等] 问题描述 → 建议改进方式
- [轻微] 问题描述 → 可选优化建议

### 与需求一致性
- ✅ 一致：xxx
- ⚠️ 需确认：xxx

### 总体评价
评价和后续建议
```

### 4. 问题处理流程

#### 4.1 严重问题处理

对于审查中发现的**严重问题**（如安全漏洞、逻辑错误导致游戏无法正常运行），由系统**自动修复**：
- 直接在当前分支修改代码
- 提交修复
- 生成修复报告

#### 4.2 非严重问题处理

对于**非严重问题**（中等/轻微），将审查报告呈现给用户，由用户对代码进行全面检查：
- 用户检查代码实现
- 如发现其他不规范之处，记录需要修改的内容
- 通过编辑 `development-assistance` skill 触发相应更改

#### 4.3 用户检查流程

用户检查完成后：
1. 用户根据审查报告对代码进行全面检查
2. 如需修改规范，编辑 `e:\project\trae-workflow\.trae\skills\development-assistance\SKILL.md`
3. 如需修复代码，向 assistant 说明需要修复的内容
4. 修复完成后，assistant 提交代码并重新触发审查

### 5. 更新任务状态

更新 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 严重问题已自动修复：状态更新为"待用户检查"
- 非严重问题：状态更新为"待用户检查"
- 无问题：状态更新为"待文档"

### 6. 总结与文档更新

在用户完成所有代码检查并确认无需进一步修改后：
1. 总结本次审查发现的通用问题模式
2. 提炼代码规范与最佳实践
3. 将通用规范写入 `e:\project\trae-workflow\.trae\rules\coding-rule.md`
4. 将最佳实践写入 `e:\project\trae-workflow\docs\技术方案.md`
5. 继续执行 documentation 任务

## 审查迭代

审查迭代最多进行3轮：
- 第1轮审查：全面审查
- 第2轮审查：复查修复的问题
- 第3轮审查：最终确认

每轮审查后：
- 如问题修复完成，状态更新为"待文档"
- 如仍有问题，继续反馈
- 3轮后仍有严重问题，报告给用户决定

## 状态流转

| 状态 | 说明 |
|------|------|
| 待审查 | 代码已生成，等待审查 |
| 审查中 | 正在进行代码审查 |
| 待用户检查 | 审查完成，等待用户检查代码 |
| 审查迭代 | 审查发现问题，返回 development-assistance 优化 |
| 待文档 | 审查通过，等待 documentation 更新文档 |

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 进行中的任务目录 | `e:\project\trae-workflow\plans` |
| 术语表 | `e:\project\trae-workflow\docs\术语表.md` |
| 编码规范 | `e:\project\trae-workflow\.trae\rules\coding-rule.md` |
| 技术方案 | `e:\project\trae-workflow\docs\技术方案.md` |

## 注意事项

- 使用术语表中的标准术语描述问题
- 问题分级明确：严重/中等/轻微
- 提供具体的修复建议
- 尊重开发者的实现选择，对合理变体给予认可
- 严重问题自动修复，非严重问题由用户检查决定