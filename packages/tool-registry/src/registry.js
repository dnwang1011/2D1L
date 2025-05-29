"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistry = void 0;
const compare_versions_1 = require("compare-versions");
const types_1 = require("../src 2/types");
/**
 * Manages the registration, discovery, and execution of deterministic tools.
 */
class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    /**
     * Registers an executable tool with the registry.
     * @param tool - The tool instance implementing IExecutableTool.
     * @throws Error if a tool with the same name is already registered.
     */
    register(tool) {
        const { name } = tool.manifest;
        if (this.tools.has(name)) {
            console.warn(`Tool with name "${name}" already registered. Overwriting.`);
            // Alternatively, throw new Error(`Tool with name "${name}" already registered.`);
        }
        console.info(`Registering tool: ${name} (v${tool.manifest.version})`);
        this.tools.set(name, tool);
    }
    /**
     * Finds tools matching the given criteria.
     * @param criteria - The search criteria (region, capability, category, name, minVersion).
     * @returns An array of tool manifests matching the criteria.
     */
    findTools(criteria) {
        const foundManifests = [];
        for (const tool of this.tools.values()) {
            const manifest = tool.manifest;
            let match = true;
            // Check name (exact match)
            if (criteria.name && manifest.name !== criteria.name) {
                match = false;
            }
            // Check region
            if (match && criteria.region && !manifest.availableRegions.includes(criteria.region)) {
                match = false;
            }
            // Check capability
            if (match && criteria.capability) {
                const requiredCapabilities = Array.isArray(criteria.capability) ? criteria.capability : [criteria.capability];
                if (!requiredCapabilities.every(cap => manifest.capabilities.includes(cap))) {
                    match = false;
                }
            }
            // Check category
            if (match && criteria.category) {
                const requiredCategories = Array.isArray(criteria.category) ? criteria.category : [criteria.category];
                if (!requiredCategories.every(cat => manifest.categories.includes(cat))) {
                    match = false;
                }
            }
            // Check minimum version
            if (match && criteria.minVersion) {
                try {
                    if ((0, compare_versions_1.compareVersions)(manifest.version, criteria.minVersion) < 0) {
                        match = false;
                    }
                }
                catch (e) {
                    console.warn(`Invalid version format for tool ${manifest.name} (${manifest.version}) or criteria (${criteria.minVersion}). Skipping version check.`);
                }
            }
            if (match) {
                foundManifests.push(manifest);
            }
        }
        return foundManifests;
    }
    /**
     * Executes a registered tool by name.
     * @param toolName - The unique name of the tool to execute.
     * @param input - The input payload for the tool, conforming to TToolInput.
     * @returns A promise resolving to the tool's output, conforming to TToolOutput.
     * @throws ToolExecutionError if the tool is not found, input validation fails, or execution fails.
     */
    async executeTool(toolName, input) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            throw new types_1.ToolExecutionError(`Tool "${toolName}" not found in registry.`);
        }
        const startTime = Date.now();
        // Validate Input
        try {
            const validationResult = tool.manifest.validateInput(input);
            if (!validationResult.valid) {
                throw new types_1.ToolExecutionError(`Invalid input for tool "${toolName}": ${validationResult.errors?.join(', ') ?? 'Validation failed'}`, {
                    toolName,
                    input
                });
            }
        }
        catch (err) {
            throw new types_1.ToolExecutionError(`Input validation error for tool "${toolName}": ${err.message}`, {
                cause: err,
                toolName,
                input
            });
        }
        // Execute Tool
        let output;
        try {
            console.debug(`Executing tool: ${toolName}`);
            output = await tool.execute(input);
            console.debug(`Tool ${toolName} execution finished.`);
        }
        catch (err) {
            throw new types_1.ToolExecutionError(`Execution failed for tool "${toolName}": ${err.message}`, {
                cause: err,
                toolName,
                input
            });
        }
        // Validate Output
        try {
            const validationResult = tool.manifest.validateOutput(output);
            if (!validationResult.valid) {
                throw new types_1.ToolExecutionError(`Invalid output from tool "${toolName}": ${validationResult.errors?.join(', ') ?? 'Validation failed'}`, {
                    toolName,
                    input
                });
            }
        }
        catch (err) {
            throw new types_1.ToolExecutionError(`Output validation error for tool "${toolName}": ${err.message}`, {
                cause: err,
                toolName,
                input
            });
        }
        // Add processing time to metadata if not already present
        if (!output.metadata) {
            output.metadata = {};
        }
        if (output.metadata.processing_time_ms === undefined) {
            output.metadata.processing_time_ms = Date.now() - startTime;
        }
        return output;
    }
    /**
     * Retrieves the manifest for a specific tool.
     * @param toolName - The name of the tool.
     * @returns The tool's manifest, or undefined if not found.
     */
    getManifest(toolName) {
        return this.tools.get(toolName)?.manifest;
    }
    /**
     * Lists all registered tools.
     * @returns An array of all registered tool manifests.
     */
    listAllTools() {
        return Array.from(this.tools.values()).map(tool => tool.manifest);
    }
}
exports.ToolRegistry = ToolRegistry;
//# sourceMappingURL=registry.js.map