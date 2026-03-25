# 中间塔防 - 项目结构规范

## 工作流调用

用户说"创建需求"时触发工作流：**新需求**直接由 `development-workflow` 创建分支；**迭代需求**则先由 `requirement-iteration` 分析现有功能，再由 `development-workflow` 创建分支；随后 `requirement-discussion` 明确需求后进入开发阶段，由 `development-assistance` 提供代码生成和问题排查支持，`code-review` 进行最多3轮迭代审查，最后 `documentation` 更新文档。

## 完整工作流步骤

### 阶段一：需求创建

| 步骤 | 操作 | 负责模块 | 输出 |
|------|------|----------|------|
| 1.1 | 判断需求类型（新需求/迭代需求） | development-workflow | 确定处理流程 |
| 1.2 | 迭代需求：分析现有功能 | requirement-iteration | 结构化任务信息 |
| 1.3 | 创建Git分支 | development-workflow | 新分支 |
| 1.4 | 创建开发计划文档 | development-workflow | plans/ 目录下的 .md 文件 |
| 1.5 | 更新开发进度 | development-workflow | development-plan.md |

### 阶段二：需求讨论

| 步骤 | 操作 | 负责模块 | 输出 |
|------|------|----------|------|
| 2.1 | 获取当前开发计划 | requirement-discussion | 当前任务信息 |
| 2.2 | 读取任务文档 | requirement-discussion | 任务详情 |
| 2.3 | 理解用户需求 | requirement-discussion | 需求分析 |
| 2.4 | 提供结构化选项 | requirement-discussion | 选项列表 |
| 2.5 | 更新任务文档 | requirement-discussion | 更新的任务文档 |
| 2.6 | 用户说"开始开发" → 设置状态 | requirement-discussion | 状态流转为"开发中" |

### 阶段三：开发实现

| 步骤 | 操作 | 负责模块 | 输出 |
|------|------|----------|------|
| 3.1 | 理解当前任务 | development-assistance | 任务目标 |
| 3.2 | 生成代码 | development-assistance | 代码文件 |
| 3.3 | 更新代码 | development-assistance | Git提交 |
| 3.4 | 更新任务文档 | development-assistance | 更新的任务文档 |
| 3.5 | 触发代码审查 | development-assistance | 状态流转为"待审查" |

### 阶段四：代码审查

| 步骤 | 操作 | 负责模块 | 输出 |
|------|------|----------|------|
| 4.1 | 获取当前分支代码 | code-review | 代码变更列表 |
| 4.2 | 执行代码审查 | code-review | 审查报告 |
| 4.3 | 严重问题：自动修复并提交 | code-review | 修复提交 |
| 4.4 | 非严重问题：呈现给用户 | code-review | 审查报告 |
| 4.5 | 用户检查代码 | 用户 | 检查结果 |
| 4.6 | 修复问题（如有） | development-assistance | 修复提交 |
| 4.7 | 更新编码规范（如有新增） | code-review | 更新的 coding-rule.md |
| 4.8 | 迭代审查（最多3轮） | code-review | 审查结论 |
| 4.9 | 审查通过 | code-review | 状态流转为"待文档" |

### 阶段五：文档更新

| 步骤 | 操作 | 负责模块 | 输出 |
|------|------|----------|------|
| 5.1 | 获取最终代码 | documentation | 代码变更 |
| 5.2 | 分析代码变更 | documentation | 变更分析 |
| 5.3 | 确定需更新的文档 | documentation | 文档列表 |
| 5.4 | 更新文档内容 | documentation | 更新的文档 |
| 5.5 | 验证文档一致性 | documentation | 验证结果 |
| 5.6 | 任务完成 | documentation | 状态流转为"已完成" |

## 决策点

| 决策点 | 条件 | 结果 |
|--------|------|------|
| 需求类型判断 | 用户说明是新功能 | 直接进入开发工作流 |
| 需求类型判断 | 用户说明是修改现有功能 | 先执行 requirement-iteration |
| 代码问题严重性 | 问题导致游戏无法运行 | 自动修复 |
| 代码问题严重性 | 问题为中等/轻微 | 用户检查决定 |
| 审查迭代 | 3轮内问题修复完成 | 进入文档更新 |
| 审查迭代 | 3轮后仍有严重问题 | 报告给用户决定 |

## 状态定义

| 状态 | 说明 |
|------|------|
| 策划中 | 需求已创建，等待详细讨论 |
| 开发中 | 需求已明确，开始编码实现 |
| 待审查 | 代码已生成，等待 code-review 审查 |
| 待用户检查 | 审查完成，等待用户检查代码 |
| 审查迭代 | 审查发现问题，返回 development-assistance 优化 |
| 待文档 | 审查通过，等待 documentation 更新文档 |
| 已完成 | 全部开发工作完成 |

## 集成要求

### Skill 调用关系

```
requirement-iteration → development-workflow → requirement-discussion
                                                    ↓
                                            development-assistance
                                                    ↓
                                               code-review
                                                    ↓
                                            documentation
```

### 文件路径约定

| 类型 | 路径 |
|------|------|
| 开发进度记录 | `e:\project\trae-workflow\.trae\rules\development-plan.md` |
| 编码规范 | `e:\project\trae-workflow\.trae\rules\coding-rule.md` |
| 开发计划目录 | `e:\project\trae-workflow\plans` |
| 项目文档 | `e:\project\trae-workflow\docs` |
| 源代码 | `e:\project\trae-workflow\MidTowerDefense\src` |

## 目录结构

```
MidTowerDefense/
├── docs/                      # 项目文档（游戏策划案、API文档等）
├── src/                       # 源代码
├── assets/                    # 游戏资源（图片、音频、字体等）
├── config/                    # 配置文件（游戏平衡参数、网络配置等）
├── test/                      # 测试代码
```

## 模块规范

### 命名约定
- **目录名称**：小写字母 + 下划线（例如 `game_entity`）
- **文件名称**：小写字母 + 下划线（例如 `tower_attack.py`）
- **类名称**：PascalCase 大驼峰命名（例如 `TowerBase`）
- **函数名称**：小写字母 + 下划线（例如 `calculate_damage`）
- **变量名称**：小写字母 + 下划线（例如 `tower_level`）

### 模块职责
- `src/game/` - 核心游戏逻辑（实体、系统、地图）
- `src/network/` - 多人联机与房间管理
- `src/ui/` - 用户界面渲染与交互

## 开发规范
- 代码注释：关键逻辑处添加中文注释，说明意图和实现方式
- 代码风格：遵循项目编码规范
- 提交前检查：确保代码符合规范

## Git 规范
- 分支命名：`feature/功能名`、`bugfix/问题描述`、`hotfix/紧急修复`
- 提交信息：使用中文描述，格式为 `[类型] 简短描述`
  - 类型：新增、优化、修复、文档、重构
- 代码审查：合并前需至少一名开发者 review 通过

## 资源管理
- 资源文件：使用有意义的英文名称，如 `tower_basic.png`
- 资源更新：版本号递增，保留历史版本于 `assets/archive/`
- 资源引用：通过相对路径引用，便于项目迁移

## 构建与部署
- 开发环境：使用 `npm run dev` 启动本地开发服务器
- 生产构建：使用 `npm run build` 生成优化后的静态文件
- 版本发布：遵循语义化版本号（主版本.次版本.修订号）

## 代码审查
- 审查重点：代码逻辑、命名规范、安全隐患、性能考虑
- 审查频率：每次 Pull Request 都需进行审查