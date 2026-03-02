---
name: "read-before-coding"
description: "⚠️ 任何代码改动前必须调用！包含项目核心开发准则、架构逻辑与强制性规范。"
---

# READ BEFORE CODING - Development Standards

此技能是本项目的**强制性阅读材料**。在进行任何代码修改、功能添加或重构之前，必须调用此技能以确保符合项目的架构和开发规范。

## 何时使用

**必须** 在以下所有场景作为**第一步**调用：
- **任何代码修改前** (Before ANY code modification)
- 用户要求实现新功能 (Implement new feature)
- 用户要求修复 Bug (Fix bug)
- 用户询问代码逻辑或架构 (Ask about logic/architecture)

## 核心游戏机制 (Core Game Mechanics) - CRITICAL

**本游戏为“面杀模拟器”，规则与标准三国杀不同：**

1.  **无阶段限制 (No Phases)**: 
    - 游戏**没有**判定阶段、摸牌阶段、出牌阶段、弃牌阶段等概念。
    - **严禁**在代码中实现阶段检查（如 `if (ctx.phase !== 'play')`）。
    - 玩家可以在任何时候进行任何操作（只要符合当前 UI 交互逻辑）。

2.  **无次数限制 (No Usage Limits)**:
    - 技能和卡牌**没有**“每回合限一次”或“出牌阶段限一次”的限制。
    - **严禁**在代码中添加次数计数器或限制检查（如 `limit: 1` 或 `usedThisTurn`）。
    - 除非用户明确要求“强制限制次数”，否则默认无限使用。

3.  **极简实现原则 (Minimal Implementation)**:
    - **如果一个技能效果可以通过基本操作（如：手动摸牌、手动弃牌、手动判定）模拟实现，则不需编写复杂的代码逻辑。**
    - 仅实现那些**无法**通过基本操作完成的特殊机制（如：改变卡牌属性、复杂的卡牌转移、特殊标记）。
    - 优先依赖玩家之间的口头沟通和手动操作（面杀模拟器精神）。

## 核心开发铁律 (Critical Rules)

基于 `STARTUP_INSTRUCTIONS.md`, `DEVELOPMENT_RULES.md` 和 `research.md`：

1.  **非破坏性 (Non-destructive)**: 
    - **严禁**修改或删除现有逻辑、变量名和选牌框。
    - 新功能必须是**增量**的 (Incremental)。
    - 如果必须修改现有逻辑，需提前说明原因。

2.  **独立实现 (Isolation)**: 
    - 所有新技能必须在 `src/skills/` 目录下创建独立的 `.js` 文件。
    - **严禁**复用旧模块逻辑，确保新功能的独立性。

3.  **随机数安全 (Deterministic Randomness)**: 
    - **必须**使用 `ctx.random` (如 `ctx.random.Number()`)。
    - **严禁**使用 `Math.random()`，以防止客户端与服务端状态不一致。

4.  **配置忽略 (Ignore Config Descriptions)**: 
    - 开发技能时，**忽略** `generals.json` 中的 `skills_description` 字段。
    - 必须严格遵照用户的自然语言指令。

5.  **测试要求 (Testing)**: 
    - 新武将必须加入 `src/Game.js` 的 `TESTING_GENERAL_LIST` 常量中。

6.  **任务调度与取消 (Scheduling & Cancellation)**:
    - 项目使用**确定性状态机** (Deterministic State Machine) 进行任务调度。
    - **风险**: 必须确保 `move` (特别是取消操作) 能够完整清理当前阻塞状态 (如 `pendingEffect`, `*Select`)。
    - 参考 `research.md` 中的取消逻辑缺陷分析，避免重蹈覆辙。

7.  **服务端校验 (Server-Side Validation)**:
    - **严禁**仅依赖前端 UI 过滤。
    - 如果技能要求特定的卡牌属性（如“仅限方块牌”、“仅限黑色牌”），**必须**在 `move` 函数中再次检查 `card.suit`、`card.color` 或 `card.type`。
    - 如果校验失败，应拒绝执行并记录错误日志（`G.actionLog`）。

8.  **遗留代码迁移 (Legacy Migration)**:
    - 如果修改的功能位于 `src/Game.js` 的旧代码块中，**必须**将其重构并迁移到 `src/skills/` 下的独立文件中。
    - 保持 `src/Game.js` 的整洁，只保留核心框架和通用逻辑。

## 项目架构 (Architecture)

- **前端**: React (`src/Board.jsx`, `src/App.jsx`)
- **后端逻辑**: boardgame.io (`src/Game.js`, `src/skills/*.js`)
- **启动命令**: `npm run build && npm run start`

### 核心文件职责
- `src/Game.js`: 定义 `G` (状态), `moves` (动作), `turn` (流程)。
- `src/Board.jsx`: UI 渲染，处理点击事件并 dispatch moves。
- `src/skills/*.js`: 独立的武将技能逻辑实现。

## 执行步骤 (Execution Steps)

1.  **调用此技能**: 阅读上述规则。
2.  **定位文件**: 根据功能需求定位 `src/skills/` 或 `src/Game.js`。
3.  **检查准则**: 确认修改是否违反“非破坏性”或“随机数”规则。
4.  **实现逻辑**: 编写代码。
5.  **更新测试**: 修改 `TESTING_GENERAL_LIST`。

## 示例

**场景**: 用户要求“实现一个新的武将技能”。

1.  调用 `read-before-coding`。
2.  确认规则：在 `src/skills/` 新建文件，不复用旧逻辑，使用 `ctx.random`。
3.  实现逻辑、引入 `Game.js`、接入 `Board.jsx`。
4.  将武将名加入 `TESTING_GENERAL_LIST`。
