# Monorepo Build Debugging Report - 2dots1line V7

Date: 2024-07-30

## 1. Overview

This report details the troubleshooting steps taken to resolve a series of cascading build failures in the 2dots1line V7 monorepo. The issues spanned `npm` installation problems, `pnpm` workspace misconfigurations, TypeScript project reference complexities, incorrect package dependencies, and ESLint setup errors. The goal of this report is to document the debugging journey, highlight the solutions that worked, and provide lessons learned and best practices to prevent recurrence.

## 2. Initial Problem: `npm install` Failures & Corrupted Environment

*   **Symptom:** `npm install` failed with `E404 Not Found` for local workspace packages (e.g., `@2dots1line/ui-components`). `npm workspaces list` and `require('npm')` failed, indicating a corrupted `npm` installation. An Arborist error (`Cannot read properties of null (reading 'matches')`) further confirmed this. Debug logs showed `npm` using an incorrect Node version (v22 instead of the project-intended v20).
*   **Failed Attempts:**
    *   Changing Node/npm versions.
    *   Cleaning `npm` cache.
    *   Verifying paths.
*   **Solution (Partial - Shift to `pnpm`):** Recognizing the `npm` environment was unreliable, the decision was made to switch to `pnpm`.
*   **Lesson:** A corrupted global or local `npm` installation can be very hard to debug. If basic troubleshooting fails, consider a cleaner package manager or a fresh environment setup. Ensure the correct Node.js version is active for the project.

## 3. `pnpm` Workspace Configuration Issues

*   **Symptom (Initial `pnpm`):** After installing `pnpm` (v10.11.1), an initial `pnpm install` succeeded. The project was configured for `pnpm` by adding `packageManager` to the root `package.json` and creating `pnpm-workspace.yaml`. However, a subsequent `pnpm install` failed with `ERR_PNPM_FETCH_404` for local workspace packages.
*   **Cause:** Dependencies in `package.json` files were using loose `"*"` or `^version` specifiers instead of the `workspace:` protocol required by `pnpm` for local workspace packages.
*   **Solution:**
    1.  Systematically updated all internal monorepo package dependencies in `package.json` files to use `workspace:^<version>` (e.g., `workspace:^0.1.0`). This involved editing `package.json` files for `apps/api-gateway`, `apps/storybook`, `services/cognitive-hub`, `packages/orb-core`, `workers/scheduler`, etc.
    2.  Ensured `pnpm-workspace.yaml` correctly listed all workspace package locations (e.g., adding `packages/ui-components`).
*   **Lesson:** When using `pnpm` workspaces, **always** use the `workspace:` protocol for dependencies between packages within the monorepo. Ensure `pnpm-workspace.yaml` is comprehensive.

## 4. Prisma Client Type Issues (`@2dots1line/database`)

*   **Symptom:** Building `@2dots1line/database` (`pnpm --filter @2dots1line/database build`) failed with TypeScript errors like `TS2694: Namespace '...'.Prisma has no exported member 'InputJsonValue'`.
*   **Cause:**
    1.  Prisma's generated types had changed between versions (e.g., `GetPayload` to `$ModelPayload`).
    2.  Initial attempts to fix by directly changing type names in repository files were insufficient.
    3.  Switching to import top-level model types (e.g., `import { User as PrismaUser } from '@prisma/client'`) led to `TS2305: Module '"@prisma/client"' has no exported member 'User'`, indicating TypeScript couldn't find *any* exports from `@prisma/client`.
    4.  Investigation of `@prisma/client/package.json` showed `types: "default.d.ts"`. This `default.d.ts` file was found to have an incorrect relative path to the actual generated types in `.prisma/client`.
*   **Failed Attempts:**
    *   Directly correcting the path in `node_modules/@prisma/client/default.d.ts` (temporary fix, not viable).
*   **Solution (Workaround & Refinement):**
    1.  **Workaround:** Created `packages/database/src/prisma-client.ts` to re-export everything from `../node_modules/.prisma/client`. All imports of `'@prisma/client'` in `packages/database/src/` were changed to import from this new local file. This allowed `@2dots1line/database` to build.
    2.  **Later Build System Refinement:** As part of broader `tsconfig.json` changes, `baseUrl` and `paths` for `@prisma/client` were removed from `packages/database/tsconfig.json`, relying on the local re-export.
*   **Lesson:**
    *   Be aware that `prisma generate` can produce types that might not be directly compatible with older import patterns if Prisma client/CLI versions change significantly.
    *   When facing persistent "module not found" or "no exported member" errors for generated clients like Prisma, check the generated `package.json` and type definition files within `node_modules` for the client. Path issues or incorrect type export declarations in the generated client itself can be the culprit.
    *   A local re-export file can be a stable workaround if the generated client's structure is problematic for direct consumption.

## 5. TypeScript Project References & Build Failures (`tsc -b`)

This was the most complex part of the debugging, involving multiple packages.

*   **Symptoms (across various packages like `text-tool`, `tool-registry`, `agent-framework`, `cognitive-hub`, `api-gateway`):**
    *   `TS2305: Module '"@2dots1line/shared-types"' has no exported member 'TExtractedEntity'`.
    *   `TS6306: Referenced project '...' must have setting "composite": true.`
    *   `TS6305: Output file '.../dist/index.d.ts' has not been built from source file '.../src/index.ts'.`
    *   `TS2307: Cannot find module '@2dots1line/database' or its corresponding type declarations.`
    *   `TS6059: File '.../shared-types/src/ai/job.types.ts' is not under 'rootDir' '.../tool-registry/src'.` (due to inherited `paths` from `tsconfig.base.json` causing referenced projects to try and compile source files of their dependencies).
    *   `TS5083: Cannot read file '/Users/danniwang/Documents/GitHub/tsconfig.base.json'.` (due to incorrect relative `extends` path).
*   **Key Discoveries & Solutions:**
    1.  **`tsc -b` is Essential:** For composite projects using TypeScript project references, the build script **must** use `tsc -b tsconfig.json` (or `tsc -b path/to/tsconfig.json`). Simply using `tsc -p tsconfig.json` or `tsc` will not correctly build the references and produce the necessary build artifacts (like `.tsbuildinfo` and properly resolved `dist` outputs for dependent projects).
        *   **Action:** Updated `build` scripts in `package.json` for all composite library packages (`shared-types`, `tool-registry`, `database`, `agent-framework`, `cognitive-hub`) to use `rm -rf dist && tsc -b tsconfig.json --verbose --force`.
    2.  **`tsconfig.json` for Composite Packages:**
        *   **`composite: true`:** Mandatory for any package that is referenced by another or references others.
        *   **`declaration: true` (and `declarationMap: true`):** Essential for generating `.d.ts` files. Usually inherited from `tsconfig.base.json` if `composite` is true there.
        *   **`noEmit: false`:** Ensure output is actually generated.
        *   **`rootDir: "./src"` and `outDir: "./dist"`:** Standard for source and output.
        *   **`"references": [{ "path": "../dependent-package" }]`:** Correctly list all internal workspace dependencies.
        *   **`"paths": {}` (in individual package `tsconfig.json` files):** This was CRITICAL. `tsconfig.base.json` had `paths` aliases pointing to `src` directories (e.g., `"@2dots1line/shared-types": ["packages/shared-types/src"]`). When a composite project (e.g., `tool-registry`) referenced another (e.g., `shared-types`), inheriting these `src`-pointing paths caused `tsc -b` to attempt to recompile the *source files* of `shared-types` from within `tool-registry`'s context, leading to `rootDir` errors (TS6059). Clearing `paths` with `{}` in the individual package's `tsconfig.json` forces `tsc -b` to rely solely on the `references` and consume the already built `dist` output from `shared-types`, as intended.
        *   **`"isolatedModules": false` (override):** `tsconfig.base.json` had `isolatedModules: true`. This needed to be overridden to `false` in the `tsconfig.json` of library packages being built with `tsc -b`, as `isolatedModules` can interfere with declaration emit and composite project builds.
        *   **`extends` path:** Ensure the `extends` path to `tsconfig.base.json` is relative to the current `tsconfig.json`'s location (e.g., `../../tsconfig.base.json`).
    3.  **Missing Package Dependencies:** The final blocker for `api-gateway` was that `@2dots1line/shared-types` and `@2dots1line/tool-registry` were not listed in its `package.json` dependencies.
        *   **Action:** Added them with `workspace:^0.1.0` and ran `pnpm install`. This allowed `pnpm` to symlink them into `api-gateway/node_modules`, making them discoverable by TypeScript's `nodenext` module resolution.
    4.  **Incorrect/Missing Named Exports:** Even after modules were found, specific types (like `TExtractedEntity`, `TApiResponse`) were not available due to missing explicit re-exports from the main `index.ts` of the shared packages.
        *   **Action:** Added `export type { TExtractedEntity } from './ai/tool.types';` and `export type { TApiResponse } from './api';` to `packages/shared-types/src/index.ts`.
    5.  **`moduleResolution: "nodenext"` and `module: "NodeNext"`:** For backend packages like `api-gateway` that consume other compiled packages, using these modern Node.js module settings in their `tsconfig.json` is appropriate.
*   **Lessons:**
    *   `tsc -b` is non-negotiable for building a graph of TypeScript project references.
    *   Carefully configure `tsconfig.json` for each composite package: `composite`, `declaration`, `noEmit`, `rootDir`, `outDir`, `references`.
    *   **Crucially, clear inherited `paths` ( `"paths": {}` ) in composite library packages if the base `tsconfig.json` has `paths` pointing to `src` directories.** Rely on `references` for inter-package dependencies during build.
    *   `isolatedModules: true` in a base config can be problematic for library packages; override to `false`.
    *   Ensure all consumed workspace packages are actual dependencies in `package.json` so the package manager creates the necessary `node_modules` links.
    *   Verify that all necessary types are explicitly exported from the entry point of your shared library packages.

## 6. ESLint Configuration and Conflicts

*   **Symptom 1 (`web-app`):** Build failed due to missing `eslint-plugin-import`.
    *   **Solution:** Added `eslint-plugin-import` to `devDependencies` in the root `package.json` and ran `pnpm install`.
*   **Symptom 2 (`web-app`):** Build failed due to issues with `eslint-plugin-glsl` (version `0.0.0-wip`).
    *   **Solution:** Removed `eslint-plugin-glsl` from root `package.json` and from the `plugins` array in the root `.eslintrc.js`.
*   **Symptom 3 (`web-app`):** Next.js build showed a warning `⚠ The Next.js plugin was not detected in your ESLint configuration` and had many `import/order` and React-specific linting errors.
    *   **Cause:** `web-app` was inheriting the generic root `.eslintrc.js` and lacked its own Next.js-specific ESLint config.
    *   **Solution:** Created `apps/web-app/.eslintrc.json` with `{
  "extends": "next/core-web-vitals"
}`.
*   **Symptom 4 (`web-app`):** After the above, a warning appeared: `ESLint: Plugin "react-hooks" was conflicted between ".eslintrc.json » eslint-config-next/core-web-vitals ..."` and the root `.eslintrc.js`.
    *   **Cause:** Both the `web-app` local config (via `next/core-web-vitals`) and the root config were trying to manage `eslint-plugin-react-hooks`.
    *   **Solution:** Removed React-specific plugins (`react`, `react-hooks`) and their configurations from the root `.eslintrc.js`, making it more generic. App-specific ESLint (like Next.js) should handle framework linting.
*   **Lessons:**
    *   Keep the root `.eslintrc.js` for universal linting rules applicable to all packages (e.g., import order, basic TypeScript rules).
    *   Applications (like Next.js web apps) or specific UI package groups should have their own tailored ESLint configurations that extend the root config but add framework-specific plugins and rules.
    *   Ensure all ESLint plugins used in configurations are listed as `devDependencies` in the appropriate `package.json` (root or local) and installed.

## 7. Miscellaneous TypeScript Errors

*   **Symptom (`backend-api`):** `TS2742: The inferred type of 'app' cannot be named...`
    *   **Solution:** Added an explicit `Express` type annotation: `const app: Express = express();`.
*   **Symptom (`insight-worker`):** `TS2742: The inferred type of 'worker' cannot be named without a reference to '...@2dots1line/shared-types/src/ai'.`
    *   **Solution:** Added an explicit type annotation for the BullMQ `Worker` instance.
*   **Symptom (`api-gateway` router instances):** Potential for `TS2742`.
    *   **Solution (Proactive):** Added explicit `Router` type annotations: `const router: Router = Router();`.
*   **Lesson:** When TypeScript struggles to infer complex types, especially across module boundaries or with library instances, providing explicit type annotations can resolve `TS2742` errors and improve code clarity.

## 8. Best Practices for Maintaining a Stable Build Environment

This is critical to avoid spending 80% of your time on build issues.

**A. For You (the Human Developer):**

1.  **Understand Your Tools:**
    *   **`pnpm` Workspaces:** Know that `workspace:*` is for local deps. Understand how `pnpm install` creates symlinks in `node_modules`. Use `pnpm list --depth 0` in a package to see its direct dependencies.
    *   **TypeScript Project References:** Understand `composite: true`, `declaration: true`, `references` in `tsconfig.json`, and that `tsc -b` is required. Visualize the dependency graph.
    *   **Turborepo:** Understand how it caches tasks (`.turbo` folder) and runs builds based on package dependencies defined in `turbo.json` (implicitly via `package.json` workspaces or explicitly). Know `turbo run build --filter=<package-name>...` for targeted builds.
2.  **Incremental Changes & Commits:**
    *   After setting up a new package or making significant changes to a package's build configuration or dependencies, try to build *that package and its direct dependents* in isolation first.
    *   **Commit frequently with clear messages** once a package (or a small group of related packages) builds successfully. Example: `fix(database): resolve prisma client import issue` or `feat(api-gateway): setup initial build config with project refs`.
    *   **Do not batch massive refactoring of tsconfig files across the entire monorepo without testing builds incrementally.**
3.  **Configuration Hygiene:**
    *   **`tsconfig.json`:**
        *   Keep `tsconfig.base.json` for truly shared options.
        *   For library packages built with `tsc -b`:
            *   Ensure `composite: true`, `declaration: true` (often via `extends`), `noEmit: false`.
            *   Define `rootDir` and `outDir`.
            *   Use `references` for all internal workspace dependencies.
            *   **Critically: Add `"paths": {}` to override/clear `paths` inherited from the base if the base `paths` point to `src` directories.** This forces reliance on `references` and `dist` outputs.
            *   Consider overriding `isolatedModules: false` if inherited as `true`.
        *   For applications (like `api-gateway`, `web-app`):
            *   They might also be `composite: true` if other packages depend on *them* (less common for top-level apps).
            *   They will use `references` to consume library packages.
            *   Their `paths` can be used for internal aliasing within the app if needed, but be cautious if they also reference other composite projects.
    *   **`package.json`:**
        *   **Always list all direct workspace dependencies** with `workspace:^<version>`. Do not rely on transitive dependencies for linking.
        *   Ensure `main`, `types` (and `exports` if used) correctly point to the `dist` folder.
        *   Build scripts for composite libraries should use `tsc -b`.
    *   **ESLint:**
        *   Maintain a root `.eslintrc.js` for universal, non-framework rules.
        *   Apps/UI packages should have their own ESLint configs (e.g., `apps/web-app/.eslintrc.json`) extending the root and adding framework specifics (like `next/core-web-vitals`).
4.  **Clean Regularly (When Stuck):**
    *   `rm -rf .turbo`
    *   `rm -rf node_modules` (and then `pnpm install`) - use as a stronger measure.
    *   `rm -rf packages/*/dist apps/*/dist services/*/dist workers/*/dist` (or similar to clean all build outputs).
5.  **Dependency Updates:** When updating dependencies (Node, pnpm, TypeScript, Prisma, major libraries), do it cautiously. Update one thing at a time if possible and test the build immediately. Read changelogs for breaking changes.
6.  **Version Control for Configs:** All `tsconfig.json`, `package.json`, `.eslintrc.js`, `pnpm-workspace.yaml`, `turbo.json` files **must** be in Git.

**B. For the Cursor Agent (and Your Interaction with It):**

1.  **Provide Full Context for Build-Related Changes:**
    *   If asking the agent to modify a `tsconfig.json`, explicitly state if it's for a composite library package or an application. Remind it of the key settings: `composite: true`, `declaration: true`, `noEmit: false`, `references`, and the **critical `"paths": {}` override if applicable**.
    *   If adding dependencies to `package.json`, specify `workspace:^<version>`.
    *   Remind it that build scripts for composite packages use `tsc -b`.
2.  **Specify Target Files Clearly:** Always provide the full path from the monorepo root for any file to be modified.
3.  **Incremental Requests:** Don't ask the agent to "fix the build" in one go if there are many errors. Break it down. "The build failed in `package-A` with error X. Please check its `tsconfig.json` and `package.json` for issues related to project references and ensure it lists `package-B` as a dependency."
4.  **Review Agent's Proposed Changes Carefully:**
    *   Before applying, mentally check if the changes align with the monorepo's established patterns (e.g., `tsc -b`, `paths: {}`, `workspace:` protocol).
    *   The agent may not remember *all* the nuances discovered over a long debugging session. You are the orchestrator.
5.  **Agent "Messing Things Up":**
    *   The agent primarily acts on your prompts. If it makes a mistake, it's often because the prompt was ambiguous or lacked specific contextual constraints we've learned are important.
    *   **The best defense is small, incremental changes and immediate verification (build attempts).** If an agent's change breaks the build, and it's not obvious why, revert it immediately (Git helps here) and re-prompt with more specific instructions or context.
    *   Don't let the agent make many file changes across many packages without an intermediate build check.

**C. Git Best Practices in This Context:**

1.  **Commit Small, Logical Units:**
    *   Once a specific error is fixed and *verified with a build*, commit it.
        *   Example: `fix(api-gateway): add missing shared-types, tool-registry deps`
        *   Example: `refactor(shared-types): ensure TApiResponse is exported from main index`
        *   Example: `chore(tool-registry): configure tsconfig for tsc -b and clear paths`
2.  **Branching:** For significant build system refactoring or troubleshooting, use a dedicated branch (e.g., `fix/monorepo-build-issues`). Merge back to your main development branch only when the build is stable.
3.  **Commit Messages:** Be descriptive. If you fixed a TS error, mention the error code or the package. This helps you (and others) search Git history if similar issues reappear.
4.  **Test Before Pushing (if CI is in place):** If you have a CI pipeline that runs `pnpm build`, ensure your changes pass locally before pushing to avoid breaking the build for others.
5.  **`.gitignore`:** Ensure `node_modules`, `dist` folders, `.turbo`, `.tsbuildinfo` files, etc., are correctly gitignored. (Your current `.gitignore` seems to cover most of these).

By following these practices, you can significantly reduce the time spent on recurrent build issues and maintain a more stable and predictable development environment. The key is methodical work, understanding the interactions between your tools, and making small, verifiable changes.

## Final Build Success and Key Learnings (Session Ending YYYY-MM-DD)

After numerous attempts and layered fixes, a stable and successful monorepo build (`pnpm build`) was achieved. The primary remaining blocker was a persistent `glob` module resolution issue within `packages/shader-lib` when built via Turbo, often accompanied by `pnpm install` warnings about "Failed to create bin".

**Key Breakthroughs and Solutions:**

1.  **Aggressive pnpm Cache/Artifact Cleaning:** The most critical step was a thorough cleaning of pnpm-related artifacts. This involved:
    *   Deleting the root `node_modules` folder.
    *   Deleting `packages/shader-lib/node_modules` (and potentially any problematic package's `node_modules`).
    *   Deleting the root `pnpm-lock.yaml` file.
    *   Running `pnpm store prune` to clean corrupted or inconsistent packages from pnpm's global cache.

2.  **Clean `pnpm install`:** Following the aggressive clean, a fresh `pnpm install` was executed. Crucially, this install completed *without* the previous "Failed to create bin" warnings, especially for `glob`. This indicated that pnpm was now able to correctly set up its shims and links.

3.  **Turbo Environment Configuration (`turbo.json`):**
    *   `PNPM_HOME` was added to `globalEnv`: `"PNPM_HOME=/Users/danniwang/Library/pnpm"`.
    *   `PATH` was added to `globalPassThroughEnv`: `["PATH"]`.
    *   These changes ensure that tasks orchestrated by Turbo inherit the correct environment variables necessary for pnpm to function correctly, especially for resolving binaries and modules invoked by `pnpm exec` or scripts run via `node` that rely on pnpm's `node_modules` structure.

4.  **Dependency Scope for `shader-lib` Build Tools:**
    *   `glob` and `fs-extra` were moved from `devDependencies` to `dependencies` in `packages/shader-lib/package.json`. While the clean pnpm state was likely the primary fix for `glob` resolution, having build-critical tools as direct dependencies can sometimes offer more resilience in complex monorepo setups, especially if scripts are run directly with `node` rather than `pnpm exec` (though `pnpm exec` is preferred).

5.  **ESLint Warning Resolution (`apps/web-app`):**
    *   **`LandingSection2.tsx`**: `targetOrbPosition` was wrapped in `useMemo` to resolve `react-hooks/exhaustive-deps`.
    *   **`VideoBackground.tsx`**: `any` types for `ScrollTrigger` instances were replaced with the specific `ScrollTrigger` type.
    *   **`HUDLayer.tsx`**: Type errors were resolved by explicitly typing the `scenes` array with `SceneName` (derived from an exported `SceneState` from `SceneStore.ts`) and removing an unnecessary `as any` cast.
    *   **`orb/__tests__/Orb.test.tsx`**: `any` in a Jest mock for `@react-three/drei`'s `Sphere` component was replaced with `{ children?: React.ReactNode } & Omit<MeshProps, 'children'>`.
    *   **`CardGalleryStore.ts`**: `any` types for `filters` were changed to `unknown` as a safer placeholder pending full type definition.

**Outcome:**
*   A full `pnpm build` now completes successfully with no errors.
*   Previously problematic ESLint warnings in `apps/web-app` have been resolved.
*   All relevant packages (`packages/*`, `services/*`, `workers/*`) consistently generate their `dist` output directories, including `packages/text-tool` which was previously missing its `dist` folder.

This successful resolution highlights the importance of ensuring a clean package manager state (especially with pnpm's complex store and linking mechanisms) and correctly configuring the execution environment for build tools like Turbo.