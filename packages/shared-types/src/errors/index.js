"use strict";
/**
 * Error-related type definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.ErrorCategory = void 0;
/**
 * Error categories
 */
var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["AUTHORIZATION"] = "authorization";
    ErrorCategory["NOT_FOUND"] = "not_found";
    ErrorCategory["CONFLICT"] = "conflict";
    ErrorCategory["SERVER"] = "server";
    ErrorCategory["EXTERNAL"] = "external";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
/**
 * Standard error codes
 */
var ErrorCode;
(function (ErrorCode) {
    // Validation errors
    ErrorCode["INVALID_INPUT"] = "invalid_input";
    ErrorCode["MISSING_FIELD"] = "missing_field";
    ErrorCode["MALFORMED_DATA"] = "malformed_data";
    // Authentication errors
    ErrorCode["INVALID_CREDENTIALS"] = "invalid_credentials";
    ErrorCode["EXPIRED_TOKEN"] = "expired_token";
    ErrorCode["INVALID_TOKEN"] = "invalid_token";
    // Authorization errors
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "insufficient_permissions";
    ErrorCode["FORBIDDEN"] = "forbidden";
    // Not found errors
    ErrorCode["RESOURCE_NOT_FOUND"] = "resource_not_found";
    // Conflict errors
    ErrorCode["DUPLICATE_RESOURCE"] = "duplicate_resource";
    ErrorCode["RESOURCE_LOCKED"] = "resource_locked";
    // Server errors
    ErrorCode["INTERNAL_ERROR"] = "internal_error";
    ErrorCode["DATABASE_ERROR"] = "database_error";
    // External errors
    ErrorCode["SERVICE_UNAVAILABLE"] = "service_unavailable";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "external_service_error";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=index.js.map