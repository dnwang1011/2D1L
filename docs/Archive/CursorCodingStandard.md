This is a fantastic initiative! Establishing clear guidelines for AI development agents (like those powered by Cursor) is crucial for maintaining code quality, consistency, and long-term project health, especially in a complex monorepo.

Here's a "Cursor Project Rule Document" designed to address the pain points you've identified and promote best practices.

## 2dots1line: Cursor AI Agent Development Protocol & Best Practices

**Document Version:** 1.0
**Date:** October 26, 2023

**Objective:**
This document outlines the standardized rules, best practices, and conventions that all Cursor AI agents (and human developers interacting with them) must adhere to during the development of the 2dots1line project. The goal is to ensure code quality, consistency, maintainability, efficient collaboration, and effective knowledge sharing across different development sessions and agent interactions.

**Guiding Principles for Cursor AI Agents:**

1.  **Context is King:** Always strive to understand the broader context of a task before generating or modifying code. Review existing relevant files, project structure, and design documents.
2.  **Consistency Over Novelty:** Adhere to established patterns, naming conventions, and architectural choices within the project. Do not introduce new patterns without explicit instruction or justification.
3.  **Clarity and Readability:** Generate code that is clear, well-commented (where necessary), and easy for human developers to understand and maintain.
4.  **Respect the Structure:** Be mindful of the monorepo structure. Place new files logically and avoid unnecessary duplication.
5.  **Cleanliness and Ownership:** Take responsibility for the code generated. This includes cleaning up temporary code, ensuring tests pass, and documenting changes.
6.  **Iterative Refinement:** Expect to iterate. The first solution generated might not be perfect. Work with the human developer to refine and improve.
7.  **Document Your Learnings:** Briefly document significant decisions, complex logic, or any "gotchas" encountered to aid future sessions and team members.

---

### I. Code Generation & Modification Rules

1.  **File Creation & Placement:**
    *   **Rule 1.1 (Check First):** Before creating a new file, always perform a search within the current `app/`, `package/`, or `worker/` to see if a suitable existing file or module can be extended or utilized.
    *   **Rule 1.2 (Logical Placement):** If a new file is necessary:
        *   Place it within the most logical directory based on the established project structure (e.g., new API controllers in `apps/backend-api/src/controllers/`, shared utilities in `packages/shared-utils/src/`).
        *   If unsure, ask the human developer for guidance on placement.
    *   **Rule 1.3 (Naming Conventions):** Follow existing file naming conventions (e.g., `user.controller.ts`, `MemoryUnit.model.ts`, `useAuth.hook.ts`). Generally, use kebab-case for directories and camelCase or PascalCase for files depending on the framework/layer (e.g., React components in PascalCase).

2.  **Naming Conventions (Variables, Functions, Classes, etc.):**
    *   **Rule 2.1 (Project Standard):** Adhere strictly to the project's established naming conventions (e.g., camelCase for variables and functions, PascalCase for classes and React components, UPPER_SNAKE_CASE for constants).
    *   **Rule 2.2 (Descriptive Names):** Use clear, descriptive, and unambiguous names. Avoid overly terse or generic names (e.g., prefer `fetchUserDetails` over `getData`).
    *   **Rule 2.3 (Consistency):** If multiple conventions exist in a specific module, follow the predominant one or ask for clarification.

3.  **Code Style & Formatting:**
    *   **Rule 3.1 (Linter & Formatter Adherence):** All generated code MUST conform to the project's ESLint and Prettier configurations. Always assume linters/formatters will be run.
    *   **Rule 3.2 (Readability):** Prioritize readability. Use appropriate indentation, spacing, and line breaks. Break down complex logic into smaller, well-named functions.

4.  **Comments & Documentation:**
    *   **Rule 4.1 (Purposeful Comments):** Add comments to explain *why* something is done, not *what* is being done (if the code is self-explanatory). Explain complex logic, assumptions, or workarounds.
    *   **Rule 4.2 (JSDoc/TSDoc):** For public functions, classes, and complex types within shared packages or core services, use JSDoc/TSDoc for clear API documentation.
    *   **Rule 4.3 (TODOs & FIXMEs):** If temporary code or a known issue is introduced, mark it clearly with `// TODO: [User/Agent Name] - [Brief Description] - [Optional JIRA Ticket]` or `// FIXME: [Description]`. These should be addressed promptly.

5.  **Debugging Code & Cleanup:**
    *   **Rule 5.1 (Temporary Debug Code):** If `console.log`, temporary variables, or other debugging aids are added, they MUST be prefixed with a standard comment, e.g., `// CURSOR_DEBUG_START` and `// CURSOR_DEBUG_END`.
    *   **Rule 5.2 (Mandatory Cleanup):** Before finalizing a task or commit, explicitly search for and remove ALL temporary debug code unless instructed by the human developer to keep specific logs for a valid reason (which should then be documented).
    *   **Rule 5.3 (No Commented-Out Code Blocks):** Do not leave large blocks of old or alternative code commented out. Remove it. Version control (Git) is used for history.

6.  **Dependency Management:**
    *   **Rule 6.1 (Check Existing Dependencies):** Before adding a new external library/dependency, check if a similar functionality is already provided by an existing dependency or a shared package within the monorepo.
    *   **Rule 6.2 (Monorepo Packages):** Prioritize using internal `packages/*` over external dependencies if functionality exists.
    *   **Rule 6.3 (Installation):** If a new dependency is required and approved, install it in the correct `package.json` (for the specific app/package) using the project's package manager (npm/yarn/pnpm).
    *   **Rule 6.4 (Version Pinning):** Follow project conventions for version pinning (e.g., `^version`, `~version`, or exact version).

7.  **Error Handling:**
    *   **Rule 7.1 (Robust Error Handling):** Implement proper error handling (try-catch blocks, promise rejections) for I/O operations, API calls, and potentially failing logic.
    *   **Rule 7.2 (Informative Errors):** Errors should be informative, providing context for debugging.
    *   **Rule 7.3 (Consistent Error Response):** For API endpoints, adhere to the project's standard error response format.

8.  **Path Referencing & Imports:**
    *   **Rule 8.1 (No Symbolic Links in Code):** Do not generate code that relies on symbolic links created during a session for path resolution.
    *   **Rule 8.2 (Use Relative or Alias Paths):** Use relative paths for imports within the same app/package. Utilize TypeScript path aliases (e.g., `@/components/*`, `@shared/types/*`) defined in `tsconfig.json` for cleaner imports across module boundaries within an app or from shared packages.
    *   **Rule 8.3 (Verify Import Paths):** After generating code, double-check that all import paths are correct and resolve to the intended modules, especially after refactoring or moving files.

---

### II. Task Execution & Workflow

1.  **Understanding the Task:**
    *   **Rule 9.1 (Clarify Ambiguity):** If a task description is ambiguous or lacks context, ask the human developer for clarification *before* generating code.
    *   **Rule 9.2 (Review Existing Code):** Before implementing a new feature or fixing a bug, review related existing code files to understand current patterns, data structures, and logic. Use Cursor's "Go to Definition" and "Find References" extensively.
    *   **Rule 9.3 (Consider Edge Cases):** Think about potential edge cases or error conditions related to the task.

2.  **Code Migration & Refactoring:**
    *   **Rule 10.1 (Systematic Approach):** When migrating or refactoring code:
        *   Identify all affected files and dependencies.
        *   Make changes incrementally if possible.
        *   After changes, systematically check all call sites and usages of the modified code for necessary updates.
    *   **Rule 10.2 (Dependency Checks):** Explicitly verify that all dependencies (internal and external) of the modified code are still correctly resolved and that no breaking changes have been introduced to consumers of the refactored module.
    *   **Rule 10.3 (Test After Refactor):** Ensure relevant unit/integration tests are updated and pass after refactoring. If tests don't exist, discuss adding them with the human developer.

3.  **Testing:**
    *   **Rule 11.1 (Consider Tests):** When generating new functionality, consider what unit or integration tests would be appropriate. If feasible and instructed, generate boilerplate for these tests.
    *   **Rule 11.2 (Fix Failing Tests):** If code changes cause existing tests to fail, attempt to fix the tests or the code. Do not ignore failing tests. If the test needs to be updated due to intentional changes, document this.

4.  **Committing Changes (if agent is involved in git operations):**
    *   **Rule 12.1 (Atomic Commits):** Commits should be atomic and represent a single logical change.
    *   **Rule 12.2 (Clear Commit Messages):** Follow project conventions for commit messages (e.g., Conventional Commits). Messages should be clear and descriptive. Example: `feat(csea-worker): Implement concept relationship inference module`.
    *   **Rule 12.3 (Lint Before Commit):** Ensure code passes linting and formatting checks before committing.

---

### III. Knowledge Sharing & Documentation (Agent-Level)

This section focuses on how Cursor agents should help maintain a "living memory" of the development process itself.

1.  **Session Summaries (Conceptual):**
    *   **Rule 13.1 (End-of-Task Summary):** At the end of a significant task or a multi-step interaction, the agent should be capable of providing a brief summary of:
        *   Files created/modified.
        *   Key decisions made (e.g., "Chose to implement X using Y pattern because Z").
        *   Complex logic introduced.
        *   Any unresolved `TODO`s or `FIXME`s.
        *   Potential impacts on other parts of the system.
    *   **Storage:** This summary can be appended by the human developer to a "Cursor Session Log" markdown file within the `docs/development_logs/` directory, or directly into relevant Jira tickets/PR descriptions.

2.  **Documenting Novel Solutions or Patterns:**
    *   **Rule 14.1 (Identify Novelty):** If an agent, in collaboration with a human, develops a novel solution, a new reusable pattern, or a clever workaround for a tricky problem:
    *   **Rule 14.2 (Propose Documentation):** The agent should suggest to the human developer that this be documented, perhaps as a small entry in an "Architectural Decision Record (ADR)" (`docs/architecture/adrs/`), a new section in a relevant design document, or a "Cookbook" entry for common tasks.

3.  **Updating Existing Documentation:**
    *   **Rule 15.1 (Identify Impact):** If code changes significantly alter existing functionality, API contracts, or architectural components that are documented:
    *   **Rule 15.2 (Flag for Update):** The agent should point out to the human developer which documentation files (e.g., API specs, design docs) might need updating. If simple enough (e.g., updating a function signature in a JSDoc), the agent can attempt the update.

---

### IV. Interaction with Human Developers

1.  **Rule 16.1 (Seek Confirmation for Major Changes):** For significant architectural changes, adding major dependencies, or deleting substantial amounts of code, always seek explicit confirmation from the human developer.
2.  **Rule 16.2 (Present Options):** When multiple valid solutions exist, present the options with their pros and cons, and ask for guidance if the best path isn't clear.
3.  **Rule 16.3 (Learn from Feedback):** Incorporate feedback from human developers to improve future code generation and suggestions within the same session and, ideally, across sessions (if Cursor has a mechanism for this).

---

**Enforcement & Review:**

*   Human developers are responsible for reviewing code generated by Cursor AI agents.
*   Automated checks (linters, formatters, CI tests) are the first line of defense.
*   Regular code reviews should specifically check for adherence to these Cursor AI Agent Protocols.
*   This document should be living and updated as new best practices or pain points emerge.

By establishing and adhering to these rules, the Cursor AI agents will become more effective and reliable partners in the development of 2dots1line, contributing to a high-quality, maintainable, and well-documented codebase.