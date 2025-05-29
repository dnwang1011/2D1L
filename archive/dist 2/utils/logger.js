"use strict";
/**
 * Simple console-based logger for testing purposes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const logger = {
    debug: (data, message) => console.debug(message || '', data),
    info: (data, message) => console.info(message || '', data),
    warn: (data, message) => console.warn(message || '', data),
    error: (data, message) => console.error(message || '', data),
};
exports.default = logger;
