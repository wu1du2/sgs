---
name: "project-maintenance"
description: "处理项目维护任务。当遇到自动化测试进程卡死、无法退出，或需要安全清理/删除文件时调用。"
---

# Project Maintenance Skill

此技能包含处理常见项目维护问题的最佳实践和操作指南。

## 1. 自动化测试配置修复 (Test Configuration Fix)

当 AI 自动化测试执行后卡在 "Watching for file changes..." 状态无法自动退出时，使用此功能。

**操作步骤**:
1. 检查 `package.json` 中的 `test` 脚本。
2. 修改配置以关闭默认的 watch 模式：
   - **Vitest**: 将 `"test": "vitest"` 修改为 `"test": "vitest run"`
   - **Jest**: 将 `"test": "jest"` 修改为 `"test": "jest --watch=false"`
3. 验证修改：重新运行测试，确保进程能自动结束。

## 2. 安全文件删除 (Safe File Deletion)

为防止误删重要文件，禁止直接使用 `rm` 命令删除文件，应将其移动到 `.trash` 目录。

**操作步骤**:
1. **初始化环境**:
   - 创建回收站目录：`mkdir -p .trash`
   - 配置忽略规则：在 `.gitignore` 中添加 `.trash`
2. **执行删除**:
   - 使用移动命令替代删除：`mv <file_path> .trash/`
   - 例如：`mv src/temp.js .trash/`

## 3. 使用场景示例

- **用户请求**: "测试运行完卡住了怎么办？" -> 调用此技能检查 `package.json`。
- **用户请求**: "删除这个临时文件" -> 调用此技能将文件移动到 `.trash`。
- **自动检测**: 发现测试脚本未配置自动退出参数时，主动建议修改。
