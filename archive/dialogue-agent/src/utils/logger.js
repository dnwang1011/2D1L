"use strict";
/**
 * Simple console-based logger for testing purposes
 */
Object.defineProperty(exports, "__esModule", { value: true });
var logger = {
    debug: function (data, message) { return console.debug(message || '', data); },
    info: function (data, message) { return console.info(message || '', data); },
    warn: function (data, message) { return console.warn(message || '', data); },
    error: function (data, message) { return console.error(message || '', data); },
};
exports.default = logger;
