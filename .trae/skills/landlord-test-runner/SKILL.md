---
name: "landlord-test-runner"
description: "Run the specialized test for verifying landlord general options. Invoke when user wants to verify landlord logic or run landlord tests."
---

# Landlord Test Runner

This skill runs the specific test case that verifies the landlord receives extra general options upon bidding.

## Usage

When you invoke this skill, it will execute the following command:

```bash
npx vitest run src/test/landlord_generals.test.js
```

## Purpose

Use this skill to:
1.  Verify that the "Landlord gets 2 extra general options" feature is working correctly.
2.  Ensure no regressions in the landlord assignment logic.
3.  Check if the game state correctly transitions and updates player roles and options.

## Test Logic Overview

The test script (`src/test/landlord_generals.test.js`) performs these steps:
1.  Initializes a 3-player game client.
2.  Simulates all players clicking "Ready".
3.  Verifies the initial phase is 'selection' and all players have 3 general options.
4.  Identifies the current bidder and simulates a bid of 300 to claim landlord.
5.  Verifies that the landlord now has 5 general options (3 initial + 2 extra).
6.  Verifies other players still have 3 options.

## Notes

- This test uses `boardgame.io/client` and `vitest`.
- It is a focused integration test for this specific feature.
