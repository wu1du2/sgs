export const caochunSkill = {
    shanjia: {
        name: "缮甲",
        description: "出牌阶段开始时，你可以摸三张牌，然后弃置X张牌（X为你的装备区里的牌数且至多为3）。",
        /**
         * Shan Jia Action - Cycle through discard counts
         * @param {number} currentState - Current discard count (3, 2, 1, 0)
         * @returns {number} - Next discard count
         */
        cycleState: (currentState) => {
            if (currentState === null || currentState === undefined) {
                return 3;
            }
            return currentState === 0 ? 3 : currentState - 1;
        },
        /**
         * Get display name based on state
         * @param {number} state - Current discard count
         * @returns {string} - Display name
         */
        getDisplayName: (state) => {
            return state === null || state === undefined ? "缮甲弃牌3" : `缮甲弃牌${state}`;
        }
    }
};