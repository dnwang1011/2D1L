/**
 * Error-related type definitions
 */
/**
 * Base error interface
 */
export interface IBaseError {
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: Record<string, any>;
}
/**
 * Error categories
 */
export declare enum ErrorCategory {
    VALIDATION = "validation",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    NOT_FOUND = "not_found",
    CONFLICT = "conflict",
    SERVER = "server",
    EXTERNAL = "external"
}
/**
 * Standard error codes
 */
export declare enum ErrorCode {
    INVALID_INPUT = "invalid_input",
    MISSING_FIELD = "missing_field",
    MALFORMED_DATA = "malformed_data",
    INVALID_CREDENTIALS = "invalid_credentials",
    EXPIRED_TOKEN = "expired_token",
    INVALID_TOKEN = "invalid_token",
    INSUFFICIENT_PERMISSIONS = "insufficient_permissions",
    FORBIDDEN = "forbidden",
    RESOURCE_NOT_FOUND = "resource_not_found",
    DUPLICATE_RESOURCE = "duplicate_resource",
    RESOURCE_LOCKED = "resource_locked",
    INTERNAL_ERROR = "internal_error",
    DATABASE_ERROR = "database_error",
    SERVICE_UNAVAILABLE = "service_unavailable",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    EXTERNAL_SERVICE_ERROR = "external_service_error"
}
//# sourceMappingURL=index.d.ts.map