---
name: "repo-tester"
description: "用于在代码改动后进行验证和测试。支持生成测试脚本、运行手动验证流程和检查代码规范。"
---

# Repository Tester & Verification Guide

此技能用于在代码修改后进行系统的验证和测试，确保改动符合预期且不破坏现有功能。

## 何时使用

**必须** 在以下情况下调用：
- 完成了一个功能开发或 Bug 修复 (Feature/Bugfix completed)
- 需要验证代码逻辑的正确性 (Verify logic correctness)
- 想要添加自动化测试或运行手动测试 (Add/Run tests)

## 测试策略 (Testing Strategy)

本项目支持 **自动化测试** (Vitest) 和 **手动验证**。

### 1. 自动化回归测试 (Automated Regression Testing)
- **运行测试**: `npm test`
- **测试文件**: 位于 `src/skills/*.test.js` 和 `src/game.test.js`。
- **编写新测试**:
  - 导入 `createTestG`, `createTestCtx` from `src/test/utils.js`。
  - 编写 `describe` / `it` 块验证逻辑。
  - 示例:
    ```javascript
    import { createTestG, createTestCtx } from '../test/utils';
    import { mySkill } from './mySkill';
    
    it('should work', () => {
        const G = createTestG();
        mySkill.doSomething({ G, ... });
        expect(G.someState).toBe(true);
    });
    ```

### 2. 手动验证 (Manual Verification)
对于 UI 交互和复杂的技能逻辑：

- **启动应用**: 运行 `npm run build && npm run start`。
- **配置测试环境**:
  - 修改 `src/Game.js` 中的 `TESTING_GENERAL_LIST`，将待测试的武将名加入列表。
- **场景模拟**:
  - 在浏览器中模拟玩家操作。
  - 验证 UI 反馈（选牌框、日志）。

### 3. 代码规范检查 (Linting)
- 运行 `npm run lint`。

## 执行步骤

1. **准备测试**:
   - 检查 `TESTING_GENERAL_LIST` 是否已更新。

2. **执行验证**:
   - **优先运行自动化测试**: `npm test`。
   - 如果是 UI/流程修改，进行手动测试。

3. **结果确认**:
   - 确认无报错、无逻辑漏洞。
   - 确认符合“非破坏性”原则。

## 示例

**场景**: 测试新武将“新许攸”的技能。

1. 调用 `repo-tester`。
2. 运行 `npm test` 确保无回归。
3. 提示用户将 "新许攸" 加入 `TESTING_GENERAL_LIST`。
4. 提示用户运行 `npm run start` 进行手动验证。
