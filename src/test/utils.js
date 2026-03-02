// Mock random implementation for deterministic testing
export const mockRandom = {
    Number: () => 0.5, // Default to 0.5
    Shuffle: (arr) => [...arr], // No shuffle by default
    Die: (n) => 1, // Always roll 1
};

// Helper to create a basic G state
export const createTestG = (playersCount = 3) => {
    const players = {};
    const hands = {};
    const generalOptions = {};
    const generalChangeUsed = {};
    
    for (let i = 0; i < playersCount; i++) {
        const pid = String(i);
        players[pid] = {
            general: null,
            hp: 4,
            hpMax: 4,
            armor: 0,
            is_turned_over: false,
            equipments: { weapon: null, armor: null, plusOne: null, minusOne: null },
            judges: { bing: null, le: null, dian: null },
            role: 'neutral',
            score: 0,
        };
        hands[pid] = [];
        generalOptions[pid] = [];
        generalChangeUsed[pid] = [false, false, false];
    }

    return {
        players,
        hands,
        deck: [],
        discardPile: [],
        actionLog: [],
        generalOptions,
        generalChangeUsed,
        // Add other necessary G fields as needed
        liyuTargeting: null,
        liyuCardSelecting: null,
        taoluan: null,
        mizhao: null,
    };
};

// Helper to create a basic ctx
export const createTestCtx = (currentPlayer = '0') => ({
    currentPlayer,
    numPlayers: 3,
    playOrder: ['0', '1', '2'],
    random: mockRandom,
    events: {
        endTurn: () => {},
        endPhase: () => {},
        setStage: () => {},
    },
});
