# Bug Report: Li Yan - Li Mu Invalid Card Selection

## Description
The skill `limu` (立牧) for Li Yan (刘焉) allows the player to use a **Diamond** (方块) card as Indulgence (乐不思蜀) on themselves.
However, the previous implementation in `src/Game.js` (`liMuConfirm`) did not validate the suit of the selected card, allowing players to use ANY card (Spades, Hearts, Clubs) as Indulgence.

## Location
- File: `src/Game.js` (Old implementation)
- Function: `liMuConfirm`

## Impact
Players could use any card to activate the skill, violating the skill description and game balance.

## Fix
1.  Implemented the skill logic in `src/skills/liuyan.js` following the project's isolation rule.
2.  Added validation logic to ensure the selected card has the 'Diamond' (or '♦') suit.
3.  Refactored `src/Game.js` to use the new implementation.
4.  Updated `src/Board.jsx` to filter displayed cards in the selection modal.

## Verification
- Created `src/skills/liuyan_bug.test.js` which reproduced the bug (test failed when using old logic).
- Created `src/skills/liuyan_fix.test.js` which verified the fix:
    - Allows Diamond cards.
    - Rejects non-Diamond cards.
