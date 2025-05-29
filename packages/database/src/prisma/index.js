"use strict";
/**
 * PostgreSQL Client Wrapper for 2dots1line V4
 * Provides a singleton pattern for Prisma client access
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaHealthCheck = exports.disconnectPrisma = exports.prisma = exports.PrismaClientWrapper = void 0;
exports.createGrowthEvent = createGrowthEvent;
exports.getGrowthProfile = getGrowthProfile;
exports.getCardState = getCardState;
const client_1 = require("@prisma/client");
// import { PrismaClient } from '@prisma/client'; // Comment out the standard import
// import { PrismaClient } from '../../../../node_modules/.prisma/client'; // Corrected Direct import
// interface ExtendedPrismaClient extends PrismaClient {
//   isConnected: boolean;
// }
class PrismaClientWrapper {
    /**
     * Get the singleton Prisma client instance
     * Will initialize the client if it doesn't exist
     */
    static getInstance() {
        if (!this.instance) {
            console.info('Creating new PrismaClient instance');
            const prismaCore = new client_1.PrismaClient({
                log: [
                    { emit: 'event', level: 'query' },
                    { emit: 'event', level: 'error' },
                    { emit: 'event', level: 'info' },
                    { emit: 'event', level: 'warn' },
                ],
            });
            this.isConnectedFlag = false; // Initialize flag
            this.setupEventListeners(prismaCore);
            this.connectionPromise = this.connect(prismaCore);
            this.instance = prismaCore;
        }
        return this.instance;
    }
    static getLastError() {
        return this.lastError;
    }
    static isConnected() {
        // return this.instance?.isConnected ?? false;
        return this.isConnectedFlag;
    }
    /**
     * Get the managed Prisma client instance (instance method)
     */
    getClient() {
        if (!PrismaClientWrapper.instance) {
            PrismaClientWrapper.getInstance(); // ensure it's initialized
        }
        // Type assertion needed if instance can be null and a method expects non-null
        return PrismaClientWrapper.instance;
    }
    /**
     * Connect to the database
     */
    static async connect(client) {
        try {
            const startTime = Date.now();
            await client.$connect();
            const duration = Date.now() - startTime;
            // client.isConnected = true;
            this.isConnectedFlag = true;
            this.lastError = null;
            console.info(`PrismaClient connected to database in ${duration}ms`);
        }
        catch (error) {
            // client.isConnected = false;
            this.isConnectedFlag = false;
            this.lastError = error;
            console.error('PrismaClient failed to connect:', error);
            throw error;
        }
    }
    /**
     * Disconnect from the database
     */
    static async disconnect() {
        if (this.instance) {
            try {
                await this.instance.$disconnect();
                // if (this.instance) { // Check again as it could be nulled by another thread/reset
                //     (this.instance as ExtendedPrismaClient).isConnected = false;
                // }
                this.isConnectedFlag = false;
                console.info('PrismaClient disconnected successfully');
            }
            catch (error) {
                console.error('Error disconnecting PrismaClient:', error);
            }
        }
        else {
            console.warn('PrismaClient disconnect called but no instance exists.');
        }
    }
    /**
     * Setup event listeners for telemetry
     */
    static setupEventListeners(prisma) {
        // Using 'query' event for diagnostic purposes.
        try {
            // prisma.$on('query', (e: Prisma.QueryEvent) => { // Known Build Issue TS2345: Param type resolves to 'never'
            //   console.log('Query Event Received:', e);
            // });
            console.warn("Prisma query event listener is temporarily disabled due to a known build issue (TS2345)."); // Kept disabled
        }
        catch (error) {
            console.error("Error setting up 'query' event listener:", error);
        }
        // Reverting to 'beforeExit' if 'query' also fails, to keep original intent for when this is fixed
        // prisma.$on('beforeExit', async () => {
        //   console.log('Prisma client beforeExit event: Attempting to disconnect.');
        // });
    }
    /**
     * Check the connection health
     */
    static async healthCheck() {
        const startTime = Date.now(); // For latency calculation
        if (!this.instance) {
            return {
                healthy: false,
                error: 'Prisma client not initialized.',
            };
        }
        if (this.lastError) {
            return {
                healthy: false,
                error: `Prisma client connection previously failed: ${this.lastError.message}`,
            };
        }
        if (!this.isConnectedFlag) { // Use the direct flag
            return {
                healthy: false,
                error: 'Prisma client is not connected. Waiting for connection...',
            };
        }
        try {
            await this.instance.$queryRaw `SELECT 1`;
            const latency = Date.now() - startTime;
            return {
                healthy: true,
                error: null,
                latency,
            };
        }
        catch (error) {
            this.lastError = error;
            this.isConnectedFlag = false; // Update connection status on error
            const latency = Date.now() - startTime;
            return {
                healthy: false,
                error: `Prisma client failed to query database: ${error.message}`,
                latency,
            };
        }
    }
}
exports.PrismaClientWrapper = PrismaClientWrapper;
// private static instance: ExtendedPrismaClient | null = null;
PrismaClientWrapper.instance = null; // Changed to PrismaClient
PrismaClientWrapper.connectionPromise = null;
PrismaClientWrapper.lastError = null;
PrismaClientWrapper.isConnectedFlag = false; // Separate flag
// Ensure the global export 'prisma' is of the correct type
// export const prisma: ExtendedPrismaClient = PrismaClientWrapper.getInstance();
exports.prisma = PrismaClientWrapper.getInstance(); // Changed type
exports.disconnectPrisma = PrismaClientWrapper.disconnect.bind(PrismaClientWrapper);
exports.prismaHealthCheck = PrismaClientWrapper.healthCheck.bind(PrismaClientWrapper);
// V7 Event Sourcing Helper Functions
/**
 * Creates a new growth event.
 */
async function createGrowthEvent(data) {
    const { userId, ...eventData } = data;
    return exports.prisma.growth_events.create({
        data: {
            ...eventData,
            user: {
                connect: { user_id: userId },
            },
        },
    });
}
/**
 * Retrieves the aggregated growth profile for a user from the materialized view.
 */
async function getGrowthProfile(userId) {
    const profileData = await exports.prisma.$queryRaw(client_1.Prisma.sql `SELECT dim_key, score FROM mv_entity_growth WHERE user_id = ${userId}`);
    const profile = {};
    for (const item of profileData) {
        profile[item.dim_key] = (profile[item.dim_key] || 0) + item.score;
    }
    return profile;
}
/**
 * Retrieves the evolution state for a specific entity (card) from the view.
 */
async function getCardState(entityId, entityType, userId) {
    const result = await exports.prisma.$queryRaw(client_1.Prisma.sql `SELECT evolution_state, engaged_dimensions_count, connection_count, card_title 
               FROM v_card_evolution_state 
               WHERE entity_id = ${entityId} AND entity_type = ${entityType} AND user_id = ${userId}`);
    if (result.length > 0) {
        return result[0];
    }
    return null;
}
//# sourceMappingURL=index.js.map