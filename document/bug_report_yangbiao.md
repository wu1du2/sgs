# Bug Report: Yang Biao - Yizheng Skill Limit

## Status
**INVALID / WORKING AS INTENDED**

## Description
The skill `yizheng` (义争) for the character Yang Biao (杨彪) is described as "limited to once per play phase" (出牌阶段限一次). Initially, it was thought that the lack of limit enforcement was a bug.

## Resolution
**The game design explicitly excludes phases and usage limits.**
- Rule: "No Phases (No Draw/Play/Discard phases)"
- Rule: "No Usage Limits (No 'once per turn')"

Therefore, the absence of a limit check in `yizheng` is **correct**. The player is responsible for following the card text honorably (face-to-face simulator style), or the game allows infinite use by design.

## Original Report
(Kept for history)
- File: [src/skills/yangbiao.js](file:///Users/bytedance/Documents/trae_projects/card-game/src/skills/yangbiao.js)
- Impact: Players can use the skill multiple times.
