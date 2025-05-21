/**
 * PostgreSQL Client Wrapper for 2dots1line V4
 * Provides a singleton pattern for Prisma client access
 */

import { PrismaClient, Prisma } from '@prisma/client';
// import { PrismaClient } from '@prisma/client'; // Comment out the standard import
// import { PrismaClient } from '../../../../node_modules/.prisma/client'; // Corrected Direct import

// interface ExtendedPrismaClient extends PrismaClient {
//   isConnected: boolean;
// }

class PrismaClientWrapper {
  // private static instance: ExtendedPrismaClient | null = null;
  private static instance: PrismaClient | null = null; // Changed to PrismaClient
  private static connectionPromise: Promise<void> | null = null;
  private static lastError: Error | null = null;
  private static isConnectedFlag: boolean = false; // Separate flag

  /**
   * Get the singleton Prisma client instance
   * Will initialize the client if it doesn't exist
   */
  public static getInstance(): PrismaClient { // Changed return type
    if (!this.instance) {
      console.info('Creating new PrismaClient instance');
      
      const prismaCore = new PrismaClient({
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

  public static getLastError(): Error | null {
    return this.lastError;
  }

  public static isConnected(): boolean {
    // return this.instance?.isConnected ?? false;
    return this.isConnectedFlag;
  }

  /**
   * Get the managed Prisma client instance (instance method)
   */
  public getClient(): PrismaClient {
    if (!PrismaClientWrapper.instance) {
        PrismaClientWrapper.getInstance(); // ensure it's initialized
    }
    // Type assertion needed if instance can be null and a method expects non-null
    return PrismaClientWrapper.instance!;
  }
  
  /**
   * Connect to the database
   */
  private static async connect(client: PrismaClient): Promise<void> { // Changed param type
    try {
      const startTime = Date.now();
      await client.$connect();
      const duration = Date.now() - startTime;
      
      // client.isConnected = true;
      this.isConnectedFlag = true;
      this.lastError = null;
      
      console.info(`PrismaClient connected to database in ${duration}ms`);
    } catch (error) {
      // client.isConnected = false;
      this.isConnectedFlag = false;
      this.lastError = error as Error;
      
      console.error('PrismaClient failed to connect:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect from the database
   */
  public static async disconnect(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.$disconnect();
        // if (this.instance) { // Check again as it could be nulled by another thread/reset
        //     (this.instance as ExtendedPrismaClient).isConnected = false;
        // }
        this.isConnectedFlag = false;
        console.info('PrismaClient disconnected successfully');
      } catch (error) {
        console.error('Error disconnecting PrismaClient:', error);
      }
    } else {
      console.warn('PrismaClient disconnect called but no instance exists.');
    }
  }
  
  /**
   * Setup event listeners for telemetry
   */
  private static setupEventListeners(prisma: PrismaClient): void {
    // Using 'query' event for diagnostic purposes.

    try {
      // prisma.$on('query', (e: Prisma.QueryEvent) => { // Known Build Issue TS2345: Param type resolves to 'never'
      //   console.log('Query Event Received:', e);
      // });
      console.warn("Prisma query event listener is temporarily disabled due to a known build issue (TS2345)."); // Kept disabled
    } catch (error) {
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
  public static async healthCheck(): Promise<{ healthy: boolean; error: string | null; latency?: number }> {
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
      await this.instance.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      return {
        healthy: true,
        error: null,
        latency,
      };
    } catch (error: any) {
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

// Export the client wrapper for more advanced usage
export { PrismaClientWrapper };

// Ensure the global export 'prisma' is of the correct type
// export const prisma: ExtendedPrismaClient = PrismaClientWrapper.getInstance();
export const prisma: PrismaClient = PrismaClientWrapper.getInstance(); // Changed type
export const disconnectPrisma = PrismaClientWrapper.disconnect.bind(PrismaClientWrapper);
export const prismaHealthCheck = PrismaClientWrapper.healthCheck.bind(PrismaClientWrapper); 