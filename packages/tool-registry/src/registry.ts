import { compareVersions } from 'compare-versions';
import type { IExecutableTool, IToolManifest, IToolSearchCriteria } from './types';
import { ToolExecutionError } from './types';
import type { TToolInput, TToolOutput } from '@2dots1line/shared-types';

/**
 * Manages the registration, discovery, and execution of deterministic tools.
 */
export class ToolRegistry {
  private tools: Map<string, IExecutableTool<any, any>> = new Map();

  /**
   * Registers an executable tool with the registry.
   * @param tool - The tool instance implementing IExecutableTool.
   * @throws Error if a tool with the same name is already registered.
   */
  public register(tool: IExecutableTool<any, any>): void {
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
  public findTools(criteria: IToolSearchCriteria): IToolManifest<any, any>[] {
    const foundManifests: IToolManifest<any, any>[] = [];

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
          if (compareVersions(manifest.version, criteria.minVersion) < 0) {
            match = false;
          }
        } catch (e) {
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
  public async executeTool<TInput = any, TOutput = any>(
    toolName: string,
    input: TToolInput<TInput>
  ): Promise<TToolOutput<TOutput>> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      throw new ToolExecutionError(`Tool "${toolName}" not found in registry.`);
    }

    const startTime = Date.now();
    
    // Validate Input
    try {
      const validationResult = tool.manifest.validateInput(input);
      if (!validationResult.valid) {
        throw new ToolExecutionError(`Invalid input for tool "${toolName}": ${validationResult.errors?.join(', ') ?? 'Validation failed'}`, {
          toolName,
          input
        });
      }
    } catch (err: any) {
       throw new ToolExecutionError(`Input validation error for tool "${toolName}": ${err.message}`, {
          cause: err,
          toolName,
          input
        });
    }

    // Execute Tool
    let output: TToolOutput<TOutput>;
    try {
      console.debug(`Executing tool: ${toolName}`);
      output = await tool.execute(input);
      console.debug(`Tool ${toolName} execution finished.`);
    } catch (err: any) {
      throw new ToolExecutionError(`Execution failed for tool "${toolName}": ${err.message}`, {
        cause: err,
        toolName,
        input
      });
    }

    // Validate Output
    try {
      const validationResult = tool.manifest.validateOutput(output);
      if (!validationResult.valid) {
         throw new ToolExecutionError(`Invalid output from tool "${toolName}": ${validationResult.errors?.join(', ') ?? 'Validation failed'}`, {
          toolName,
          input
        });
      }
    } catch (err: any) {
        throw new ToolExecutionError(`Output validation error for tool "${toolName}": ${err.message}`, {
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
  public getManifest(toolName: string): IToolManifest<any, any> | undefined {
    return this.tools.get(toolName)?.manifest;
  }

  /**
   * Lists all registered tools.
   * @returns An array of all registered tool manifests.
   */
  public listAllTools(): IToolManifest<any, any>[] {
    return Array.from(this.tools.values()).map(tool => tool.manifest);
  }
} 