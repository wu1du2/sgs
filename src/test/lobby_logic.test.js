import { describe, it, expect } from 'vitest';
import { CardGame } from '../Game';
import { createTestG, mockRandom } from './utils';

describe('Lobby Logic', () => {
    it('should toggle ready status', () => {
        const G = createTestG();
        G.readyPlayers = [];
        G.phase = 'lobby';
        const playerID = '0';

        const move = CardGame.moves.toggleReady.move || CardGame.moves.toggleReady;
        
        // Toggle On
        move({ G, playerID, random: mockRandom });
        expect(G.readyPlayers).toContain(playerID);
        expect(G.readyPlayers.length).toBe(1);

        // Toggle Off
        move({ G, playerID, random: mockRandom });
        expect(G.readyPlayers).not.toContain(playerID);
        expect(G.readyPlayers.length).toBe(0);
    });

    it('should handle multiple players ready', () => {
        const G = createTestG();
        G.readyPlayers = [];
        G.phase = 'lobby';
        
        const move = CardGame.moves.toggleReady.move || CardGame.moves.toggleReady;
        
        move({ G, playerID: '0', random: mockRandom });
        move({ G, playerID: '1', random: mockRandom });
        
        expect(G.readyPlayers).toContain('0');
        expect(G.readyPlayers).toContain('1');
        expect(G.readyPlayers.length).toBe(2);
        expect(G.phase).toBe('lobby'); // Not started yet
    });

    it('should auto-start game when all 3 players are ready', () => {
        const G = createTestG();
        G.readyPlayers = [];
        G.phase = 'lobby';
        
        const move = CardGame.moves.toggleReady.move || CardGame.moves.toggleReady;
        
        move({ G, playerID: '0', random: mockRandom });
        move({ G, playerID: '1', random: mockRandom });
        move({ G, playerID: '2', random: mockRandom });
        
        expect(G.readyPlayers.length).toBe(3);
        expect(G.phase).toBe('selection');
        expect(Object.keys(G.generalOptions).length).toBeGreaterThan(0);
    });

    it('should clear userId and ready status on leaveRoom', () => {
        const G = createTestG();
        const playerID = '0';
        G.players[playerID].userId = 'UserA';
        G.readyPlayers = [playerID];

        const leaveMove = CardGame.moves.leaveRoom.move || CardGame.moves.leaveRoom;
        
        leaveMove({ G, playerID });

        expect(G.players[playerID].userId).toBeNull();
        expect(G.readyPlayers).not.toContain(playerID);
    });

    it('should set userId correctly', () => {
        const G = createTestG();
        const playerID = '0';
        G.players[playerID].userId = null;

        const setUserIdMove = CardGame.moves.setUserId.move || CardGame.moves.setUserId;
        
        setUserIdMove({ G, playerID }, 'UserB');
        
        expect(G.players[playerID].userId).toBe('UserB');
    });

    it('should NOT overwrite userId if seat is already taken (First come, first served)', () => {
        const G = createTestG();
        const playerID = '0';
        G.players[playerID].userId = 'OriginalUser';

        const setUserIdMove = CardGame.moves.setUserId.move || CardGame.moves.setUserId;
        
        // Attempt to overwrite with new user
        setUserIdMove({ G, playerID }, 'NewUser');
        
        // Should still be OriginalUser
        expect(G.players[playerID].userId).toBe('OriginalUser');
    });
});
