# Bug Report: Sima Zhao - Qiantun Deadlock

## Description
The skill `qiantun` (谦吞) for Sima Zhao requires all players to acknowledge the revealed hand cards before proceeding to the "pindian" (compare cards) stage.
```javascript
const all = Object.keys(G.players || {}).every(id => q.show.acknowledged[id]);
if (!all) return;
```
This logic causes a deadlock if any player (other than the skill user or target) is disconnected, AFK, or if the UI does not provide an acknowledgement button for them.

## Location
- File: [src/skills/simazhao.js](file:///Users/bytedance/Documents/trae_projects/card-game/src/skills/simazhao.js)
- Function: `simazhaoQiantunAcknowledge`

## Impact
Game halts indefinitely during Sima Zhao's turn if any player fails to click confirm.

## Fix
Modified the logic to only require acknowledgement from the source player (Sima Zhao). This ensures the active player controls the flow.

```javascript
// Only the source player (Sima Zhao) needs to acknowledge
if (playerID !== q.sourceID) return;
```

## Verification
- Code review confirms that the dependency on `Object.keys(G.players).every(...)` is removed.
- The state transition now happens immediately upon the source player's action.
