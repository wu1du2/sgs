import { describe, it, expect } from 'vitest';
import { jielubuSkill } from './jielubu';
import { createTestG, createTestCtx } from '../test/utils';

describe('Skill Regression Tests: Liyu (界吕布)', () => {
    it('should activate liyuTargeting when useLiyu is called', () => {
        const G = createTestG();
        const ctx = createTestCtx();
        const playerID = '0';

        jielubuSkill.useLiyu({ G, ctx, playerID });

        expect(G.liyuTargeting).toEqual({
            active: true,
            sourceID: playerID,
            selectedTargetID: null,
        });
        expect(G.actionLog).toContain(`Player ${playerID} 使用了技能 "利驭"`);
    });

    it('should confirm target and transition to card selection', () => {
        const G = createTestG();
        const ctx = createTestCtx();
        const playerID = '0';
        const targetID = '1';

        // Setup initial state
        G.liyuTargeting = {
            active: true,
            sourceID: playerID,
            selectedTargetID: targetID,
        };

        jielubuSkill.confirmLiyuTarget({ G, ctx, playerID });

        expect(G.liyuTargeting).toBeNull();
        expect(G.liyuCardSelecting).toEqual({
            active: true,
            sourceID: playerID,
            targetID: targetID,
        });
    });

    it('should correctly cancel targeting', () => {
        const G = createTestG();
        const ctx = createTestCtx();
        
        // Setup state
        G.liyuTargeting = { active: true, sourceID: '0', selectedTargetID: null };
        G.liyuCardSelecting = { active: true, sourceID: '0', targetID: '1' }; // Simulate potential residual state

        jielubuSkill.cancelLiyuTarget({ G, ctx });

        expect(G.liyuTargeting).toBeNull();
        // This assertion checks for the known bug (if fixed, it should be null)
        // If the bug exists, this test might fail or pass depending on implementation.
        // The research report says: "该 move 只清理 G.liyuTargeting，不会清理 G.liyuCardSelecting"
        // So if I expect it to be null, this test will FAIL until fixed.
        // I will write the test to EXPECT correctness (null), so it acts as a regression test.
        expect(G.liyuCardSelecting).toBeNull(); 
    });
});
