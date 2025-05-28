"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.ToolRegistry = void 0;
__exportStar(require("./base-agent"), exports);
var tool_registry_1 = require("@2dots1line/tool-registry");
Object.defineProperty(exports, "ToolRegistry", { enumerable: true, get: function () { return tool_registry_1.ToolRegistry; } });
var database_1 = require("@2dots1line/database");
Object.defineProperty(exports, "DatabaseService", { enumerable: true, get: function () { return database_1.DatabaseService; } });
// Add other exports from the framework as they are created 
//# sourceMappingURL=index.js.map