/**
 * API types for Authentication and User management
 */
import type { TUser } from '../entities/user.types';
/**
 * Request payload for user login
 */
export interface TLoginRequest {
    email: string;
    password?: string;
    id_token?: string;
}
/**
 * Response payload for successful login
 */
export interface TLoginResponse {
    token: string;
    user: TUser;
}
/**
 * Request payload for user registration
 */
export interface TRegisterRequest {
    email: string;
    password?: string;
    name?: string;
    region: 'us' | 'cn';
}
/**
 * Response payload for successful registration
 */
export interface TRegisterResponse {
    user: TUser;
}
/**
 * Request payload for updating user preferences
 */
export interface TUpdateUserPreferencesRequest {
    preferences: Record<string, any>;
}
//# sourceMappingURL=user.api.types.d.ts.map