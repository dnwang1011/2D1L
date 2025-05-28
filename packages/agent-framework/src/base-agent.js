"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    constructor(name, toolRegistry, databaseService) {
        this.availableTools = new Map();
        this.name = name;
        this.toolRegistry = toolRegistry;
        this.databaseService = databaseService;
        console.log(`Agent [${this.name}] initialized.`);
    }
    /**
     * Registers a tool for this agent to use.
     * This allows agents to have a curated list of tools from the main registry.
     */
    registerTool(tool) {
        if (this.availableTools.has(tool.name)) {
            console.warn(`Tool "${tool.name}" is already registered for agent "${this.name}". Overwriting.`);
        }
        this.availableTools.set(tool.name, tool);
        console.log(`Agent [${this.name}] registered tool: ${tool.name}`);
    }
    /**
     * Executes a registered tool by its name.
     */
    async executeTool(toolName, input, 
    // context might include things like userId for tool execution context
    context) {
        const tool = this.availableTools.get(toolName);
        if (!tool) {
            throw new Error(`Tool "${toolName}" not registered or available for agent "${this.name}".`);
        }
        console.log(`Agent [${this.name}] executing tool: ${toolName} with input:`, input);
        try {
            // Pass agent context to the tool if the tool's execute method expects it
            // This is a simple passthrough; specific tools might need more tailored context.
            const result = await this.toolRegistry.executeTool(toolName, input, context);
            return result;
        }
        catch (error) {
            console.error(`Agent [${this.name}] error executing tool "${toolName}":`, error);
            throw error; // Rethrow or handle as per agent's error strategy
        }
    }
    // Helper method to log agent activity
    log(message, data) {
        console.log(`[${this.name} Agent]: ${message}`, data || '');
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.js.map