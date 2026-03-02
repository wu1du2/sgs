---
name: "skill-creator"
description: "用于新建其他 skills。当用户想要创建新能力或扩展 Trae 功能时调用此技能。"
---

# Skill Creator

此技能用于在 `.trae/skills/` 目录下创建新的 Skill 定义。

## 何时使用

**必须** 在以下情况下立即调用此技能作为第一步行动：
- 用户想要创建一个新技能 (Create a new skill)
- 用户想要添加自定义能力 (Add custom capability)
- 用户询问如何创建技能 (How to create a skill)

**不要**：
- 仅解释如何创建而不调用此工具
- 手动编写文件而不通过此技能引导

## Skill 结构要求

一个有效的 Skill 需要满足以下条件：

1. **目录结构**: `.trae/skills/<skill-name>/`
2. **定义文件**: 在该目录下创建 `SKILL.md`

## SKILL.md 格式规范

```markdown
---
name: "<skill-name>"
description: "<简短描述：(1) 功能是什么 (2) 何时调用。限制在 200 字符以内>"
---

# <Skill Title>

<详细说明、使用指南和示例>
```

## 必填字段说明

| 字段 | 位置 | 说明 |
|-------|----------|-------------|
| `name` | frontmatter | 技能的唯一标识符 |
| `description` | frontmatter | **关键**: 必须包含 (1) 功能说明 AND (2) 触发条件。这将帮助模型决定何时使用该技能。 |
| `detail` | body | frontmatter 之后的正文内容 |

## 创建步骤

1. 询问用户技能名称和用途
2. **重要**: 生成 `description` 字段时，务必包含：
   - 功能 (Functionality)
   - **必须强调何时调用** (Trigger conditions)
   - 示例格式: "执行 X 功能。当 Y 发生或用户请求 Z 时调用。"
3. 创建目录: `.trae/skills/<skill-name>/`
4. 创建 `SKILL.md` 并包含正确的 frontmatter 和内容
5. 验证结构是否正确

## 示例

创建 "code-reviewer" 技能：

```bash
mkdir -p .trae/skills/code-reviewer
```

然后创建 `.trae/skills/code-reviewer/SKILL.md`:

```markdown
---
name: "code-reviewer"
description: "代码审查工具。当用户请求代码审查或提交合并前调用。"
---

# Code Reviewer

此技能用于审查代码并提供改进建议...
```
