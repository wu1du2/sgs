# 司马昭技能实现细节（plan3）
本计划仅描述实现细节与落点，不直接修改代码。目标是为司马昭的五个技能提供可执行的实现方案与数据结构设计，符合当前项目“面杀模拟器”结构与现有交互方式。

## 0. 接入位置总览
- 技能逻辑文件：新增 `src/skills/simazhao.js`，导出 `simazhaoSkill`。
- 逻辑接入：在 `src/Game.js` 引入并在 `moves` 中挂载。
- UI 接入：在 `src/Board.jsx` 的 `onSkillClick` 中加入 5 个技能入口，并在武将区域展示按钮与状态。
- 测试名单：将“司马昭”加入 `TESTING_GENERAL_LIST` 方便验证。

## 1. 数据结构与公共工具
### 1.1 新增状态字段（players）
- `simazhaoHoldCards`: array，用于记录被威肆扣置的牌（按目标分组存储，结构见下）。

### 1.2 新增状态字段（G）
- `simazhaoXiezhen`: 挟征状态机对象  
  - `active`, `stage`, `sourceID`, `targetIDs`, `version`, `damageDealt`
- `simazhaoQiantun`: 谦吞状态机对象  
  - `active`, `stage`, `sourceID`, `targetID`, `revealedIds`, `revealedCards`, `result`
- `simazhaoWeisi`: 威肆状态机对象  
  - `active`, `stage`, `sourceID`, `targetID`, `lockedCards`
- `simazhaoDangyiPrompt`: 造成伤害前的可选加伤提示  
  - `active`, `sourceID`, `targetID`, `baseDamage`, `resolved`

### 1.3 公共 helper（放在 simazhao.js 内）
- `canUseSimazhaoSkill(G, playerID, skillName)`：统一判定是否能发动（身份、回合标记、限定技）。
- `applyDamageBySource(G, random, sourceID, targetID, baseDamage, reason)`：伤害入口，支持荡异加伤。
- `randomTakeOneHandCard(G, random, targetID)`：从目标手牌随机取 1 张并返回。
- `returnHeldCards(G, holderID, targetID)`：在“回合结束”或手动触发时归还威肆扣置牌。

## 2. 挟征（每局一次）
### 2.1 触发方式
- 由于项目未实现“结束阶段”，挟征以技能按钮形式手动发动；仍保持“每局一次”限制。

### 2.3 结算流程
1) 选择目标数量：在斗地主模式下允许选 1～2 名其他角色。
2) 每名目标随机将 1 张手牌置于牌堆顶（使用 `ctx.random` 选择手牌索引）。
3) 视为对目标使用“兵临城下”：  
   - 由于项目缺少该牌效果，定义“项目内等价结算”：亮出牌堆顶 4 张牌。高亮其中的杀（火杀、雷杀），展示5s，之后杀进入弃牌堆。
   - 结算后未使用的牌按原顺序放回牌堆顶。


## 3. 谦吞（魏势力技）
### 3.1 触发方式
- 出牌阶段限一次，按钮触发

### 3.2 结算流程（含拼点）
1) 选择目标（有手牌的其他角色）。
2) 目标选择并展示至少 1 张手牌（存入 `revealedIds` 与 `revealedCards`）。
3) 发起拼点：复用 `initiatePinDian`，但目标只能从已展示牌中选拼点牌。  
   - 在 `G.pindian` 中追加 `targetAllowedIds`，UI 侧过滤可选牌。
4) 拼点结束后按结果取牌：  
   - 司马昭胜：获得目标“展示的两张牌”（不足则全取，超过则随机获得）。  
   - 司马昭未胜：获得目标“未展示的两张牌”（不足则全取，超过则随机获得））。  
5) “展示所有手牌”，所有玩家看到一个只读的展示框，展示司马昭所有手牌，5s之后自动消失。司马昭的所有手牌记录log。

## 4. 威肆（晋势力技）
### 4.1 触发方式
- 出牌阶段限一次，按钮触发；

### 4.2 扣置与决斗结算
1) 选择一名其他角色为目标。
2) 目标可选择任意数量手牌扣置于武将牌上（进入 `G.simazhaoWeisi.lockedCards` 并从其手牌移除）。
3) 视为对其使用【决斗】。司马昭新增两个按钮，获取/取消。
4) 若点击获取：司马昭获得目标 1 张随机手牌（斗地主模式规则）。
5) 无论点击获取/取消，从G.simazhaoWeisi.lockedCards归还手牌。

### 4.3 归还扣置牌
- 参照“破军”做法，提供手动归还按钮或在“回合结束按钮”触发 `returnHeldCards`。
- 归还时将扣置牌全部返还目标手牌，并清理 `lockedCards`。

## 5. 昭凶（限定技）
### 5.1 触发方式
- 点击发动

### 5.2 结算流程
- `simazhaoFaction` 变更为 `'晋'`。
- 标记 `simazhaoZhaoxiongUsed = true`。

## 6. 荡异（主公技，持恒技）
### 6.1 
初始显示为荡异(0/2)。点击一次，标记为荡异(1/2)，再次点击为荡异(2/2)。全体玩家可见。

## 7. UI 交互与按钮
- 技能按钮：挟征、谦吞、威肆、昭凶、荡异统一入口。
- 目标选择与选牌弹窗：复用现有 `selectCard` 与 `pindian` UI，新增“限制可选卡牌”的过滤逻辑。

