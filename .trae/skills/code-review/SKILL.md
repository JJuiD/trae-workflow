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

### 4. 反馈给 development-assistance

将审查结果反馈给 `development-assistance`：
- 严重问题：必须修复
- 中等问题：建议修复
- 轻微问题：可选优化

### 5. 更新任务状态

更新 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 如有问题：状态更新为"审查迭代"
- 如无问题：状态更新为"待文档"

## 审查迭代

审查迭代最多进行3轮：
- 第1轮审查：全面审查
- 第2轮审查：复查修复的问题
- 第3轮审查：最终确认

每轮审查后：
- 如问题修复完成，状态更新为"待文档"
- 如仍有问题，继续反馈给 `development-assistance`
- 3轮后仍有严重问题，报告给用户决定

## 状态流转

| 状态 | 说明 |
|------|------|
| 待审查 | 代码已生成，等待审查 |
| 审查中 | 正在进行代码审查 |
| 审查迭代 | 审查发现问题，返回 development-assistance 优化 |
| 待文档 | 审查通过，等待 documentation 更新文档 |

## 文件路径

| 文件 | 路径 |
|------|------|
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 进行中的任务目录 | `e:\project\trae-workflow\plans` |
| 术语表 | `e:\project\trae-workflow\docs\术语表.md` |
| 编码规范 | `e:\project\trae-workflow\.trae\rules\coding-rule.md` |

## 注意事项

- 使用术语表中的标准术语描述问题
- 问题分级明确：严重/中等/轻微
- 提供具体的修复建议
- 尊重开发者的实现选择，对合理变体给予认可