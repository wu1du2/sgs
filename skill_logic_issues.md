# 技能逻辑检查报告

经过对代码库的详细检查，发现以下逻辑问题和潜在风险：

## 1. 关键逻辑错误 (Critical)

### 刘焉 - 立牧 (src/skills/liuyan.js)
**状态**: ✅ 已修复
**问题描述**: `liuyanLimuSelectCard` 和 `liuyanLimuConfirm` 函数中，对“方块”花色的判断使用了英文单词 `'Diamond'`，而系统内部数据统一使用符号 `'♦'`。
**修复内容**: 将所有 `=== 'Diamond'` 改为 `=== '♦'`。并通过 `src/skills/liuyan_fix.test.js` 验证通过。

## 2. 潜在风险 (Potential Risks)

### 神赵云 - 龙魂 (src/Game.js)
**状态**: ✅ 已修复
**问题描述**: `confirmLongHunCard` 函数在弃置目标手牌时，依赖于手牌数组的索引 (`index`)。
**修复内容**: 
1. 修改 `src/Board.jsx` 中的 `CardSelectionModal`，在选择时传递卡牌 `id`。
2. 修改 `src/Game.js` 中的 `confirmLongHunCard`，优先使用 `id` 查找并弃置卡牌，仅在无 `id` 时回退到索引查找。
3. 新增测试 `src/skills/shenzhaoyun_fix.test.js` 验证修复。

## 3. 代码一致性 (Consistency)

- **花色表示**: 整个项目应统一使用 `src/sgs_data.js` 中定义的符号 (`♠`, `♥`, `♣`, `♦`)，避免使用英文单词。目前仅在 `liuyan.js` 中发现此不一致。

## 4. 其他观察

- 大多数技能正确使用了 `G` 对象进行状态更新。
- 核心游戏逻辑 (`src/Game.js`) 中的伤害结算和卡牌处理逻辑未发现明显的空指针异常风险。
- **杨彪 - 义争**: 经确认，游戏无回合概念，无限次发动符合设计预期。
