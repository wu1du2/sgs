---
name: "game-ui-optimization"
description: "Optimizes game UI interactions in React/boardgame.io. Use when refactoring buttons, handling state toggles, or improving user experience by reducing clicks."
---

# Game UI Optimization Patterns

This skill provides patterns for optimizing user interactions and state management in `boardgame.io` based React applications, derived from fixes for character skills like "Xu You" (许攸) and "Shen Zhao Yun" (神赵云).

## 1. Dynamic Button Labels
Update button text dynamically to reflect the current state or available resources. This provides immediate feedback without needing to open modals.

**Example (State Toggle):**
```javascript
// Display "Skill(StateA)" or "Skill(StateB)"
const state = player.skillState || 'default';
return `SkillName(${state === 'A' ? 'StateA' : 'StateB'})`;
```

**Example (Resource Count/Detail):**
```javascript
// Display "Skill(CardName)" if resources exist
if (player.resource && player.resource.length > 0) {
    const item = player.resource[0];
    return `SkillName(${item.name})`;
}
return `SkillName`;
```

## 2. Direct Action Optimization (Click Reduction)
If a skill has a deterministic action under certain conditions (e.g., only one target, or specific resource available), execute the move directly instead of showing a selection modal.

**Pattern:**
```javascript
if (skillName.startsWith('MySkill')) {
    // Check condition for direct execution
    if (G.players[playerID].resource && G.players[playerID].resource.length > 0) {
         // Directly execute the move
         moves.useSkillDirectly();
    } else {
         // Fallback to modal or other logic
         setShowModal(true);
    }
    return;
}
```

## 3. Cyclic State Toggling
Ensure state transitions cycle correctly (A -> B -> A). Avoid resetting to a fixed state unless intended.

**Correct Logic:**
```javascript
const currentState = G.players[playerID].state || 'A';
if (currentState === 'A') {
    G.players[playerID].state = 'B';
} else {
    G.players[playerID].state = 'A'; // Ensure return to A
}
```

## 4. State Cleanup on Activation
When a skill activation implies a fresh start (e.g., re-selecting options), clear any previous temporary state or selections at the start of the move function.

**Example:**
```javascript
mySkillMove: ({ G, playerID }) => {
    // Clear previous selections
    G.players[playerID].selectedOptions = [];
    
    // Proceed with logic
    // ...
}
```

## 5. Avoid Race Conditions in Move Chains
When a UI interaction involves multiple steps (e.g., Select -> Confirm), avoid relying on intermediate state stored in `G` if the steps happen sequentially in the same client-side event loop or if network latency might cause desync.

**Problem:**
Calling `moves.selectCard(card)` then `moves.confirmCard()` immediately. `confirmCard` might run before the state update from `selectCard` is reflected if logic depends on reading back from `G`.

**Solution:**
Pass data directly to the final move function.

**Bad:**
```javascript
// Client
moves.selectCard(card);
moves.confirmCard(); // Reads G.selectedCard

// Server
confirmCard: ({ G }) => {
    const card = G.selectedCard; // Might be null or old value
    // ...
}
```

**Good:**
```javascript
// Client
moves.confirmCard(card);

// Server
confirmCard: ({ G }, directCard) => {
    const card = directCard || G.selectedCard;
    // ...
}
```
