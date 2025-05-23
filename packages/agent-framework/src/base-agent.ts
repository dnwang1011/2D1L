import { ToolRegistry, Tool } from '@2dots1line/tool-registry'; // Adjust path if needed
import { DatabaseService } from '@2dots1line/database'; // Adjust path if needed
import { TAgentInput, TAgentOutput, TAgentContext } from '@2dots1line/shared-types'; // Adjust path for shared types

export abstract class BaseAgent<TInput extends TAgentInput = TAgentInput, TOutput extends TAgentOutput = TAgentOutput> {
  public readonly name: string;
  protected toolRegistry: ToolRegistry;
  protected databaseService: DatabaseService;
  private availableTools: Map<string, Tool<any, any>> = new Map();

  constructor(name: string, toolRegistry: ToolRegistry, databaseService: DatabaseService) {
    this.name = name;
    this.toolRegistry = toolRegistry;
    this.databaseService = databaseService;
    console.log(`Agent [${this.name}] initialized.`);
  }

  /**
   * Registers a tool for this agent to use.
   * This allows agents to have a curated list of tools from the main registry.
   */
  public registerTool(tool: Tool<any, any>): void {
    if (this.availableTools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered for agent "${this.name}". Overwriting.`);
    }
    this.availableTools.set(tool.name, tool);
    console.log(`Agent [${this.name}] registered tool: ${tool.name}`);
  }

  /**
   * Executes a registered tool by its name.
   */
  protected async executeTool<TToolInput, TToolOutput>(
    toolName: string,
    input: TToolInput,
    // context might include things like userId for tool execution context
    context?: TAgentContext 
  ): Promise<TToolOutput> {
    const tool = this.availableTools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not registered or available for agent "${this.name}".`);
    }
    console.log(`Agent [${this.name}] executing tool: ${toolName} with input:`, input);
    try {
      // Pass agent context to the tool if the tool's execute method expects it
      // This is a simple passthrough; specific tools might need more tailored context.
      const result = await this.toolRegistry.executeTool(toolName, input, context);
      return result as TToolOutput;
    } catch (error) {
      console.error(`Agent [${this.name}] error executing tool "${toolName}":`, error);
      throw error; // Rethrow or handle as per agent's error strategy
    }
  }

  /**
   * Abstract method to be implemented by concrete agent classes.
   * This is the main entry point for an agent's processing logic.
   */
  public abstract process(input: TInput, context?: TAgentContext): Promise<TOutput>;

  // Helper method to log agent activity
  protected log(message: string, data?: any): void {
    console.log(`[${this.name} Agent]: ${message}`, data || '');
  }
} 