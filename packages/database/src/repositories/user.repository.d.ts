import { users as UserModel } from '@prisma/client';
import { DatabaseService } from '../index';
export interface CreateUserData {
    email: string;
    name?: string;
    username?: string;
    password_hash: string;
    region?: string;
    preferences?: any;
}
export declare class UserRepository {
    private databaseService;
    private prisma;
    constructor(databaseService: DatabaseService);
    createUser(data: CreateUserData): Promise<UserModel>;
    findUserByEmail(email: string): Promise<UserModel | null>;
    findUserById(id: string): Promise<UserModel | null>;
    findUserByName(name: string): Promise<UserModel | null>;
    /**
     * Delete user by ID (hard delete from database)
     * Note: In production, consider soft delete by setting account_status to 'deleted'
     */
    deleteUser(id: string): Promise<UserModel | null>;
    /**
     * Soft delete user by setting account_status to 'deleted'
     * Recommended for production to maintain data integrity
     */
    softDeleteUser(id: string): Promise<UserModel | null>;
}
//# sourceMappingURL=user.repository.d.ts.map