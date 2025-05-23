import { PrismaClient, users as UserModel } from '@prisma/client'; // Assuming Prisma client is generated and available
import { DatabaseService } from '../index'; // Adjust path if DatabaseService is elsewhere

export interface CreateUserData {
  email: string;
  name?: string; // Changed from username to match schema
  password_hash: string;
  region?: string; // Made optional since it has a default
  preferences?: any; // Optional JSON field
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor(private databaseService: DatabaseService) {
    this.prisma = databaseService.prisma;
  }

  async createUser(data: CreateUserData): Promise<UserModel> {
    if (!data.email || !data.password_hash) {
      throw new Error('Missing required fields for user creation: email, password_hash.');
    }
    try {
      const user = await this.prisma.users.create({
        data: {
          email: data.email,
          name: data.name,
          hashed_password: data.password_hash,
          region: data.region || 'us', // Use default if not provided
          preferences: data.preferences,
          // account_status will default to 'active' as per schema
        },
      });
      return user;
    } catch (error: any) {
      if (error.code === 'P2002') { // Unique constraint violation
        // Could check error.meta.target to see which field caused it (e.g., ['email'])
        throw new Error(`User with this email already exists.`);
      }
      console.error("Error creating user:", error);
      throw new Error("Could not create user.");
    }
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    if (!email) return null;
    try {
      return await this.prisma.users.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error(`Error finding user by email ${email}:`, error);
      throw new Error("Could not find user by email.");
    }
  }

  async findUserById(id: string): Promise<UserModel | null> {
    if (!id) return null;
    try {
      return await this.prisma.users.findUnique({
        where: { user_id: id },
      });
    } catch (error) {
      console.error(`Error finding user by id ${id}:`, error);
      throw new Error("Could not find user by id.");
    }
  }

  // Optional: Add other methods as needed, e.g., updateUser, deleteUser
} 