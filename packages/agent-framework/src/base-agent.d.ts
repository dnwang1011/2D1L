import { ToolRegistry, Tool } from '@2dots1line/tool-registry';
import { DatabaseService } from '@2dots1line/database';
import { TAgentInput, TAgentOutput, TAgentContext } from '@2dots1line/shared-types';
export declare abstract class BaseAgent<TInput extends TAgentInput = TAgentInput, TOutput extends TAgentOutput = TAgentOutput> {
    readonly name: string;
    protected toolRegistry: ToolRegistry;
    protected databaseService: DatabaseService;
    private availableTools;
    constructor(name: string, toolRegistry: ToolRegistry, databaseService: DatabaseService);
    /**
     * Registers a tool for this agent to use.
     * This allows agents to have a curated list of tools from the main registry.
     */
    registerTool(tool: Tool<any, any>): void;
    /**
     * Executes a registered tool by its name.
     */
    protected executeTool<TToolInput, TToolOutput>(toolName: string, input: TToolInput, context?: TAgentContext): Promise<TToolOutput>;
    /**
     * Abstract method to be implemented by concrete agent classes.
     * This is the main entry point for an agent's processing logic.
     */
    abstract process(input: TInput, context?: TAgentContext): Promise<TOutput>;
    protected log(message: string, data?: any): void;
}
//# sourceMappingURL=base-agent.d.ts.map