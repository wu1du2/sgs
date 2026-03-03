---
name: "card-game-dev-patterns"
description: "Best practices for implementing skills in the card game, covering UI handling, UX patterns, and testing flows. Invoke when implementing or fixing skills."
---

# Card Game Development Patterns

This skill documents the patterns and best practices learned from implementing card game skills.

## UI Interaction (Board.jsx)
### Handling Dynamic Skill Names
Skills often have dynamic suffixes in the UI (e.g., `权计(1)`, `应援 (杀,闪)`).
- **Problem**: Exact string matching `if (skillName === '权计')` fails when the label changes.
- **Solution**: Always strip suffixes before matching.
  ```javascript
  const onSkillClick = (rawSkillName) => {
    // 1. Sanitize
    const skillName = String(rawSkillName || '').replace(/(?:\s|\u200B|\u200C|\u200D|\uFEFF)/g, '');
    
    // 2. Strip Suffix (count or args)
    const baseSkillName = skillName.replace(/[\(（].*[\)）]$/, ''); 
    
    // 3. Match Logic
    if (baseSkillName === '权计') { 
      // ... 
    }
  };
  ```

## UX Patterns
### Streamlined Activation
- **Principle**: Reduce clicks for frequent actions.
- **Pattern**: 
  - **Avoid**: `window.confirm` for standard skill activations (e.g., "Do you want to use Skill X?").
  - **Prefer**: Direct execution via `moves.skillNameAutoStart()`.
  - **Exception**: Irreversible negative actions (e.g., "Skip Turn", "Lose Health") may still need confirmation.

## Testing Patterns
### Testing Complex Flows
For skills with multiple stages (Start -> Select -> Confirm):
1.  **File Naming**: Create `src/skillname_flow.test.js`.
2.  **Test Structure**:
    ```javascript
    test('full flow', () => {
      // 1. Initialize
      const { G, ctx } = InitializeGame({ ... });
      
      // 2. Trigger Start
      game.moves.skillStart(G, ctx, ...);
      expect(ctx.stage).toBe('select_target');
      
      // 3. Simulate Selection
      G.skillState.selected = [...];
      
      // 4. Trigger Confirm
      game.moves.skillConfirm(G, ctx);
      
      // 5. Verify Final State
      expect(G.hands[0]).toHaveLength(expected);
    });
    ```
