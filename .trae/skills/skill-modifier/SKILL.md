---
name: "skill-modifier"
description: "用于修改现有的 skills 定义。当用户想要更新、修复或调整现有技能的功能或描述时调用此技能。"
---

# Skill Modifier

此技能用于修改 `.trae/skills/` 目录下已存在的 Skill 定义文件 (`SKILL.md`)。

## 何时使用

**必须** 在以下情况下立即调用此技能作为第一步行动：
- 用户想要修改一个现有技能 (Modify an existing skill)
- 用户想要更新技能的描述或功能 (Update skill description/functionality)
- 用户想要修复技能中的错误 (Fix errors in a skill)

## 修改步骤

1. **定位技能文件**: 
   - 确定要修改的技能名称 `<skill-name>`。
   - 对应的文件路径为 `.trae/skills/<skill-name>/SKILL.md`。

2. **读取现有内容**:
   - 使用 `Read` 工具读取该文件的当前内容，以了解现有结构和 frontmatter。

3. **规划修改**:
   - 确定需要修改的部分（例如 `description` 字段、正文说明、示例代码等）。
   - 确保修改后的内容仍然符合 `SKILL.md` 的格式规范（包含正确的 frontmatter）。

4. **执行修改**:
   - 使用 `Write` 工具（如果重写整个文件）或 `SearchReplace` 工具（如果仅修改部分内容）来更新文件。

## 示例

假设要修改 "code-reviewer" 技能的描述：

1. 读取 `.trae/skills/code-reviewer/SKILL.md`。
2. 将 `description` 从 "代码审查工具" 修改为 "高级代码审查工具，支持多种语言"。
3. 保存文件。

## 注意事项

- 修改 `description` 时，务必保留触发条件说明（"何时调用"），以免影响模型对技能的选择。
- 确保 `name` 字段与目录名保持一致。
