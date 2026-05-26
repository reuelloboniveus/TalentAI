import { vi, describe, it, expect, beforeEach } from 'vitest';
import { logEvent, getSystemLogs } from './logger';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

vi.mock('./firebase', () => ({
    db: { type: 'firestore-mock' },
    auth: {
        currentUser: null
    }
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn((database, path) => ({ database, path })),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-server-timestamp'),
    query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
    orderBy: vi.fn((field, direction) => ({ field, direction })),
    limit: vi.fn((value) => ({ value }))
}));

describe('logger service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        auth.currentUser = null;
        // Mock userAgent if needed
        Object.defineProperty(global.navigator, 'userAgent', {
            value: 'mock-user-agent',
            configurable: true
        });
    });

    describe('logEvent', () => {
        it('logs anonymous event when no user is logged in', async () => {
            await logEvent('TEST_EVENT', 'Test description', { foo: 'bar' });

            expect(collection).toHaveBeenCalledWith(db, 'logs');
            expect(addDoc).toHaveBeenCalledWith({ database: db, path: 'logs' }, {
                userId: 'anonymous',
                userEmail: 'anonymous',
                eventType: 'TEST_EVENT',
                eventDescription: 'Test description',
                details: { foo: 'bar' },
                timestamp: 'mock-server-timestamp',
                userAgent: 'mock-user-agent'
            });
        });

        it('logs authenticated user details when user is logged in', async () => {
            auth.currentUser = { uid: 'user-123', email: 'user@talentai.com' };

            await logEvent('AUTH_LOGIN', 'User logged in', { method: 'google' });

            expect(addDoc).toHaveBeenCalledWith({ database: db, path: 'logs' }, {
                userId: 'user-123',
                userEmail: 'user@talentai.com',
                eventType: 'AUTH_LOGIN',
                eventDescription: 'User logged in',
                details: { method: 'google' },
                timestamp: 'mock-server-timestamp',
                userAgent: 'mock-user-agent'
            });
        });

        it('catches and logs errors gracefully when addDoc throws', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore Write Failed'));

            await expect(logEvent('TEST_ERROR_EVENT', 'Should not crash')).resolves.not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to log event:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('getSystemLogs', () => {
        it('fetches system logs correctly', async () => {
            const mockLogs = [
                { id: '1', eventType: 'EVENT_1', timestamp: 'time-1' },
                { id: '2', eventType: 'EVENT_2', timestamp: 'time-2' }
            ];
            vi.mocked(getDocs).mockResolvedValueOnce({
                docs: mockLogs.map(log => ({
                    id: log.id,
                    data: () => ({ eventType: log.eventType, timestamp: log.timestamp })
                }))
            });

            const logs = await getSystemLogs(50);

            expect(collection).toHaveBeenCalledWith(db, 'logs');
            expect(getDocs).toHaveBeenCalled();
            expect(logs).toEqual([
                { id: '1', eventType: 'EVENT_1', timestamp: 'time-1' },
                { id: '2', eventType: 'EVENT_2', timestamp: 'time-2' }
            ]);
        });

        it('catches and returns empty array on fetch failure', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(getDocs).mockRejectedValueOnce(new Error('Firestore Read Failed'));

            const logs = await getSystemLogs();

            expect(logs).toEqual([]);
            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch logs:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});
