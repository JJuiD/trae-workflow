---
name: "documentation"
description: "Updates project documentation to match code. Invoke when user needs to update docs after development is complete."
---

# 文档管理

此Skill负责在全部开发完成后，根据当前Git分支的最终代码内容，更新项目中对应的技术文档、API文档和使用说明，确保文档与代码实现保持一致。

## 触发条件

当 `code-review` 审查通过后（状态为"待文档"），此Skill自动触发：
- `code-review` 审查无问题
- 用户要求更新文档
- 开发完成后需要整理文档

## 职责范围

- 根据当前Git分支的最终代码内容更新文档
- 更新技术文档
- 更新API文档
- 更新使用说明
- 确保文档与代码实现一致

## 执行流程

### 1. 获取最终代码

获取当前Git分支的最终代码内容：
```bash
git diff --name-only
git diff --stat
```

### 2. 分析代码变更

分析新增和修改的代码：
- 新的模块和功能
- 修改的接口
- 新增的API
- 配置变更

### 3. 确定需要更新的文档

根据代码变更确定需要更新的文档：
- 技术文档
- API文档
- 使用说明
- 开发指南

### 4. 更新文档内容

#### 技术文档
- 更新模块设计说明
- 更新架构图（如有）
- 更新数据流说明

#### API文档
- 更新接口定义
- 更新参数说明
- 更新返回值说明
- 更新示例代码

#### 使用说明
- 更新操作指南
- 更新配置说明
- 更新常见问题

#### 任务文档 (plans/)
- 根据当前分支完成的内容更新对应任务文档
- 记录完成状态（已完成/部分完成）
- 记录实际完成的功能点
- 添加完成时间戳

### 5. 验证文档一致性

确保：
- 代码注释与文档描述一致
- API文档与实现一致
- 术语使用统一
- 文档格式规范

### 6. 更新任务状态

更新 `e:\project\trae-workflow\.trae\rules\development-plan.md`：
- 状态更新为"已完成"
- 记录完成时间

## 状态流转

| 状态 | 说明 |
|------|------|
| 待文档 | 审查通过，等待 documentation 更新文档 |
| 文档更新中 | 正在更新文档 |
| 已完成 | 全部开发工作完成 |

## 文件路径

| 文件 | 路径 |
|------|------|
| 项目文档 | `e:\project\trae-workflow\docs` |
| 规则文档 | `e:\project\trae-workflow\.trae\rules` |
| 任务文档 | `e:\project\trae-workflow\plans\{任务名称}.md` |
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |

## 注意事项

- 文档必须与代码实现保持一致
- 使用术语表中的标准术语
- 保持文档简洁明了
- 及时更新避免文档过期
- 总结时更新对应的 `plans/` 目录下的任务文档，记录完成状态和完成内容