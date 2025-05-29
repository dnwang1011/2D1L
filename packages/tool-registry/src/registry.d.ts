import type { IExecutableTool, IToolManifest, IToolSearchCriteria } from './types';
import type { TToolInput, TToolOutput } from '@2dots1line/shared-types';
/**
 * Manages the registration, discovery, and execution of deterministic tools.
 */
export declare class ToolRegistry {
    private tools;
    /**
     * Registers an executable tool with the registry.
     * @param tool - The tool instance implementing IExecutableTool.
     * @throws Error if a tool with the same name is already registered.
     */
    register(tool: IExecutableTool<any, any>): void;
    /**
     * Finds tools matching the given criteria.
     * @param criteria - The search criteria (region, capability, category, name, minVersion).
     * @returns An array of tool manifests matching the criteria.
     */
    findTools(criteria: IToolSearchCriteria): IToolManifest<any, any>[];
    /**
     * Executes a registered tool by name.
     * @param toolName - The unique name of the tool to execute.
     * @param input - The input payload for the tool, conforming to TToolInput.
     * @returns A promise resolving to the tool's output, conforming to TToolOutput.
     * @throws ToolExecutionError if the tool is not found, input validation fails, or execution fails.
     */
    executeTool<TInput = any, TOutput = any>(toolName: string, input: TToolInput<TInput>): Promise<TToolOutput<TOutput>>;
    /**
     * Retrieves the manifest for a specific tool.
     * @param toolName - The name of the tool.
     * @returns The tool's manifest, or undefined if not found.
     */
    getManifest(toolName: string): IToolManifest<any, any> | undefined;
    /**
     * Lists all registered tools.
     * @returns An array of all registered tool manifests.
     */
    listAllTools(): IToolManifest<any, any>[];
}
//# sourceMappingURL=registry.d.ts.map