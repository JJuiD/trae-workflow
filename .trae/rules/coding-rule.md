---
alwaysApply: false
description: Follow these guidelines when writing code
---
# Coding Guidelines

## Performance

### 避免不必要的对象复制或克隆
- 优先使用引用传递而非值传递
- 在需要修改场景使用可变对象，不需要修改时使用不可变对象
- 谨慎使用深度拷贝，仅在明确需要独立副本时使用
- 示例：
  ```python
  # 不推荐：每次调用都创建新列表
  def get_enemies(enemies_list):
      return enemies_list.copy()

  # 推荐：直接返回引用或使用生成器
  def get_enemies(enemies_list):
      return enemies_list
  ```

---

## Code Structure

### 避免多层嵌套，提前返回
- 使用卫语句（guard clauses）处理提前退出条件
- 嵌套层级控制在 3 层以内
- 示例：
  ```python
  # 不推荐：多层嵌套
  def process_tower(tower):
      if tower is not None:
          if tower.is_active:
              if tower.has_target:
                  tower.attack()

  # 推荐：提前返回，逻辑清晰
  def process_tower(tower):
      if tower is None:
          return
      if not tower.is_active:
          return
      if not tower.has_target:
          return
      tower.attack()
  ```

---

## Naming Conventions

### 使用有意义的、描述性的名称
- 变量和函数名称应清晰表达其用途
- 避免使用模糊的名称如 `data`、`temp`、`tmp`

### 遵循项目或语言的命名规范
- 目录名：`lowercase_with_underscores`
- 文件名：`lowercase_with_underscores`
- 类名：`PascalCase`
- 函数名：`lowercase_with_underscores`
- 变量名：`lowercase_with_underscores`

### 避免缩写和单字母变量
- 不使用无意义的缩写（如 `btn` 应为 `button`）
- 单字母变量仅在约定俗成的场景使用（如循环中的 `i`、`j`）

---

## Code Organization

### 相关代码放在一起
- 相关函数组织在同一模块或类中
- 按职责划分代码模块

### 函数只做一件事
- 每个函数保持单一职责
- 函数长度控制在合理范围内（建议不超过 50 行）

### 保持适当的抽象层次
- 避免在同一函数中混合不同层次的逻辑
- 高层函数调用低层函数，形成清晰的调用链

---

## Comments and Documentation

### 注释应该解释为什么，而不是做什么
- 代码本身应具有自解释性
- 注释用于说明业务逻辑、决策原因或复杂算法
- 示例：
  ```python
  # 不推荐：注释说明做什么（冗余）
  # 遍历敌人列表
  for enemy in enemies:
      enemy.take_damage(damage)

  # 推荐：注释解释为什么
  # 使用较慢的迭代方式以支持游戏中途修改敌人列表
  for enemy in list(enemies):
      enemy.take_damage(damage)
  ```

### 为公共 API 提供清晰的文档
- 模块、类、函数的文档字符串（docstring）说明用途、参数和返回值
- 使用项目指定的文档格式（如 Sphinx、Markdown）

### 更新注释以反映代码变化
- 代码变更后同步更新相关注释
- 删除无用的或过时的注释
