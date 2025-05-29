"use strict";
/**
 * Mock database clients for testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPrismaClient = exports.mockRedisClient = exports.MockPrismaClient = exports.MockRedisClient = void 0;
class MockRedisClient {
    constructor() {
        this.cache = {};
        this.ttls = {};
    }
    async get(key) {
        console.log(`[MOCK REDIS] Getting key: ${key}`);
        const now = Date.now();
        if (this.ttls[key] && this.ttls[key] < now) {
            // Key has expired
            delete this.cache[key];
            delete this.ttls[key];
            return null;
        }
        return this.cache[key] || null;
    }
    async set(key, value, options) {
        console.log(`[MOCK REDIS] Setting key: ${key}`);
        this.cache[key] = value;
        if (options && options.EX) {
            // Set TTL in milliseconds
            this.ttls[key] = Date.now() + (options.EX * 1000);
        }
        return true;
    }
}
exports.MockRedisClient = MockRedisClient;
class MockPrismaClient {
    constructor() {
        this.prisma = {
            conversation_messages: {
                findMany: async (query) => {
                    console.log(`[MOCK PRISMA] Finding conversation messages with query:`, query);
                    return []; // No existing messages
                },
                create: async (data) => {
                    console.log(`[MOCK PRISMA] Creating conversation message:`, data.data);
                    return data.data; // Return the data that was "created"
                },
            },
            conversations: {
                upsert: async (data) => {
                    console.log(`[MOCK PRISMA] Upserting conversation:`, data);
                    return {
                        conversation_id: data.create.conversation_id,
                        user_id: data.create.user_id,
                        created_at: data.create.created_at,
                        last_message_at: data.create.last_message_at,
                        message_count: data.create.message_count,
                    };
                },
            },
            $transaction: async (callback) => {
                console.log(`[MOCK PRISMA] Starting transaction`);
                return callback(this.prisma);
            },
        };
    }
}
exports.MockPrismaClient = MockPrismaClient;
// Export singleton instances of the mock clients
exports.mockRedisClient = new MockRedisClient();
exports.mockPrismaClient = new MockPrismaClient();
