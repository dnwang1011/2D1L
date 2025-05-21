# @2dots1line/tool-registry

Tool Registry infrastructure for 2dots1line V4.

## Overview

This package provides the core functionality for registering, discovering, and executing deterministic tools used by the cognitive agents within the 2dots1line V4 system. It ensures tools adhere to defined contracts and supports features like regional availability.

## Features

- Tool registration mechanism
- Tool discovery and lookup
- Type definitions for tool manifests and contracts (extending `shared-types`)
- Regional availability filtering
- Basic tool implementations (stubs initially)

## Usage

```typescript
import { ToolRegistry, ToolExecutionError } from '@2dots1line/tool-registry';
import { SomeToolInput, SomeToolOutput } from '@2dots1line/shared-types/ai';

// Initialize the registry
const registry = new ToolRegistry();

// Register tools (implementation details omitted)
// registry.register(someToolImplementation);

async function runTool() {
  try {
    // Find available tools
    const availableTools = registry.findTools({ region: 'us', capability: 'text_embedding' });

    if (availableTools.length > 0) {
      const toolName = availableTools[0].name;
      const input: SomeToolInput = { payload: { text: 'example text', model_id: 'model-x' } };
      
      // Execute a tool
      const output: SomeToolOutput = await registry.executeTool(toolName, input);
      console.log('Tool result:', output.result);
    } else {
      console.log('No suitable tool found.');
    }
  } catch (error) {
    if (error instanceof ToolExecutionError) {
      console.error(`Tool execution failed: ${error.message}`, error.cause);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
}

runTool();
```

## Development

- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint` 