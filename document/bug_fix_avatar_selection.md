# Bug Fix: Avatar Selection Issue

## Problem Description
When selecting a target (e.g., for "Sha"), clicking on the player's avatar sometimes had no effect on the first click, but seemed to work after waiting 1 second and clicking again. This behavior was confusing and felt like a delay or bug.

## Root Cause Analysis
The issue was located in `src/Board.jsx` within the `HeroArea` component's avatar click handler.

1.  **Stop Propagation**: The avatar `div` had an `onClick` handler that unconditionally called `e.stopPropagation()`. This prevented the click event from bubbling up to the main `HeroArea` container, which handles the player selection logic (e.g., `onHeroClick`).
    
    ```javascript
    onClick={(e) => {
      e.stopPropagation(); // Stops bubbling to parent selection handler
      // ... double click logic
    }}
    ```

2.  **Double Click Logic**: The avatar click handler implemented a double-click detection (300ms window) to trigger `onAvatarClick` (showing details). Single clicks were effectively ignored due to `stopPropagation` and the lack of single-click action within the handler.

3.  **Observed Behavior**: The user reported that clicking again after 1s worked. This is likely because the user might have clicked slightly outside the avatar on the second attempt (hitting the main `HeroArea` container), or misinterpreted the lack of feedback as a delay. Regardless, the core issue was that clicking the avatar itself blocked selection.

## Resolution
Modified the `onClick` handler in `src/Board.jsx` to conditionally allow event propagation.

- **Fix**: Check if the player is currently selectable (`isSelectable` prop).
- **Implementation**: If `isSelectable` is true, return early from the avatar click handler *without* calling `e.stopPropagation()`. This allows the click event to bubble up to the `HeroArea` container, triggering the correct selection logic.

```javascript
onClick={(e) => {
  // Allow bubbling if selectable so user can click avatar to select target
  if (isSelectable) {
    return;
  }
  e.stopPropagation();
  // ... existing double click logic
}}
```

## Verification
- Validated that clicking the avatar now correctly selects the player when a target selection is active (e.g., using "Sha").
- Confirmed that double-clicking for details still works when not in selection mode.
