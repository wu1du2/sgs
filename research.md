# 调研范围与目标
本报告覆盖仓库 `card-game/` 全目录与关键流程，重点聚焦“通知系统”与“任务调度/多阶段流程”（即游戏内行动流程的状态机与取消逻辑）。文档除代码外全部使用中文。

# 目录结构与职责概览
- configs/
  - generals.json：武将配置数据，字段包含 id/name/enable/技能描述/头像等。游戏启动时仅筛选 enable=true 的武将进入可选池。
- public/
  - images/：武将与背景资源，供前端展示；card-back.png 等卡背资源。
- src/
  - main.jsx：前端入口，渲染 App。
  - App.jsx：房间/座位选择、客户端创建与 Socket 连接。
  - Game.js：核心规则与状态机，包含 setup/turn/moves，贯穿通知与多阶段动作。
  - Board.jsx：主要 UI/交互层，处理选择、弹窗、行动确认，以及日志展示。
  - skills/：武将技能实现，包含多阶段选择与取消入口。
  - sgs_data.js：卡牌数据源。
- server.js：boardgame.io 服务器入口 + 静态资源服务 + 简单 API。

# 数据与初始化逻辑
Game.js 在启动时从 configs/generals.json 读取武将数据并过滤 `enable=true` 的武将生成 `ENABLED_GENERALS`。随后在 `setup` 阶段初始化牌堆、手牌、玩家状态、各类多阶段流程的“选择状态”等。此处是全局流程的基础状态定义区。

# 通知系统详解
## 核心理念
仓库中没有传统意义上的系统级“通知中心”或推送服务，通知主要体现在游戏内“行动日志/提示”，即把关键事件写入 `G.actionLog`，并在前端实时展示。

## 生成位置（后端逻辑层）
通知内容主要由 Game.js 与部分技能文件在逻辑执行时写入：
- 典型写入位置：出牌、判定、摸牌、技能触发、拼点、装备变化等。
- 载体是 `G.actionLog` 数组，记录为字符串。没有多语言或格式化对象，渲染时按文本处理。

## 展示位置（前端 UI 层）
Board.jsx 提供两类日志 UI：
1. ActionTicker（即时提示条）
   - 只显示最新一条日志。
   - 触发条件：`logs` 变更时更新展示内容。
   - 不再使用超时自动隐藏逻辑，消息将保持直到下一条日志覆盖。
2. ActionLog（行动日志）
   - 三种视图：最小化、普通、展开。
   - 展开模式使用 Portal 覆盖全屏，支持滚动查看历史。

## 文本高亮与解析机制
ActionTicker 与 ActionLog 都会从 `SGS_CARDS` 中提取卡牌名，然后用正则匹配：
- 卡牌名被高亮为金色；
- 花色符号（♠♥♣♦）按自定义颜色高亮；
因此通知内容既承担事件描述，也承担“可视化关键词”的作用。

## 结论
“通知系统”是一个轻量级、以日志为中心的即时反馈机制：逻辑层记录文本，UI 层以高亮渲染增强可读性；没有独立消息队列或推送通道。

# 任务调度/多阶段流程机制
## 总体架构
这里的“任务调度”不是定时器或后台任务，而是**游戏行动的多阶段状态机**：
- boardgame.io 的 `activePlayers: { all: 'play' }` 使所有玩家始终处于可行动状态；
- 游戏流程通过 `G.phase` 与大量 `*Select`/`pendingEffect` 状态进行调度与阻塞；
因此调度逻辑完全由状态机驱动。

## 关键状态结构
以下是调度核心状态（部分示例）：
- `pendingEffect`：卡牌需要确认效果时的等待状态（顺手牵羊/过河拆桥/火攻/借刀杀人）。
- `selectCard`：选择目标牌的阶段。
- `fireAttackShowCard`：火攻展示牌阶段。
- `harvestCountSelect` + `harvestCards`：五谷丰登流程。
- 大量技能选择状态：`poxiSelect`、`kangkaiSelect`、`liyuTargeting`、`liyuCardSelecting`、`congjianSelect` 等。

## 典型流程示例（以顺手牵羊为例）
1. 出牌 → Game.js 将卡牌从手牌移除并写入 actionLog。
2. 生成 `pendingEffect`，等待玩家确认“生效/失效”。
3. 确认后进入 `selectCard`，要求选择目标牌。
4. 选择完成后执行效果并清理 `selectCard`。
5. 若取消，则调用 `cancel_select_card` 清空选择状态并推进后续流程。

## 流程推进与阻塞机制
对于“滔乱/灭吴/佐幸”等嵌套流程，存在一组推进函数：
- `advanceTaoluanAfterResolution`
- `advanceMiewuAfterResolution`
- `advanceZuoxingAfterResolution`

这三者会在以下条件都解除后推进下一阶段：
- `pendingEffect` 不激活
- `selectCard` 不激活
- `fireAttackShowCard` 不激活
- `harvestCountSelect` 不激活
- `harvestCards` 为空

这意味着任何未清理的选择状态都可能阻塞或错位后续行动。

# 取消逻辑与潜在缺陷
## 已定位的确定性缺陷
### 利驭流程取消失效
问题表现：利驭进入“选牌阶段”后，点击取消不会清理选牌状态，导致该任务仍被视为进行中，后续仍可被确认执行。

问题成因：
- 前端 CardSelectionModal 的取消按钮调用的是 `moves.cancelLiyuTarget()`；
- 该 move 只清理 `G.liyuTargeting`，**不会清理 `G.liyuCardSelecting`**；
因此取消目标阶段可以生效，但取消选牌阶段无效。

关联位置：
- Board.jsx：利驭选牌弹窗取消逻辑（`onCancel={() => moves.cancelLiyuTarget()}`）
- jielubu.js：`cancelLiyuTarget` 仅重置 `G.liyuTargeting`

影响结论：这是一个典型的“取消未生效 → 任务仍继续”的问题，与“任务本应取消却仍执行”的症状高度一致。

## 其他取消路径核查结论
本仓库内的其他取消入口（如 `cancel_select_card`、`cancelPoxi`、`cancelKangkai`、`baoxinYimouCancel`、`cancelFireAttackShowCard` 等）均有对应的状态清理逻辑，并且能触发必要的推进函数，未发现同级别的取消失效问题。

# 建议修复方向（仅描述，不改代码）
为利驭流程新增独立取消逻辑（例如 `cancelLiyuCardSelection`），或让 `cancelLiyuTarget` 同时清理 `liyuCardSelecting`。并在前端弹窗取消按钮调用正确的取消 move。此举可保证“取消即终止”的一致性。

# 总结
- 本仓库的“通知系统”是以 `G.actionLog` 为核心的行动日志机制，前端通过 ActionTicker 与 ActionLog 双通道展示，并对卡牌名/花色进行高亮渲染。
- “任务调度”由 boardgame.io + 自定义状态机实现，关键调度状态集中在 Game.js 的 `pendingEffect` 与众多 `*Select` 结构。
- 已定位一处明确的取消失效缺陷：利驭流程取消未清理选牌状态，导致任务仍可继续执行。该问题与用户反馈的“取消后仍执行”高度一致。
