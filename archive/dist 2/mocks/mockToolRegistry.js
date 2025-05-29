"use strict";
/**
 * Mock Tool Registry implementation for testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockToolRegistry = exports.MockToolRegistry = exports.ToolExecutionError = void 0;
class ToolExecutionError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ToolExecutionError';
        this.status = 'error';
        this.details = details;
    }
}
exports.ToolExecutionError = ToolExecutionError;
class MockToolRegistry {
    async executeTool(name, input) {
        console.log(`[MOCK TOOL] Executing tool "${name}" with input:`, input);
        // Simulate a successful tool execution
        return {
            status: 'success',
            result: {
                message: `Tool ${name} executed successfully with input: ${JSON.stringify(input)}`,
                tool_name: name,
                timestamp: new Date().toISOString(),
            },
        };
    }
    getAllToolManifestsForLLM() {
        // Return empty array for simplicity in testing
        return [];
    }
}
exports.MockToolRegistry = MockToolRegistry;
// Export a singleton instance of the mock tool registry
exports.mockToolRegistry = new MockToolRegistry();
