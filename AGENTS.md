# Viem Agent Guidelines

This document contains general guidelines for AI agents working on the Viem codebase.

For v3 rewrite work, also read `AGENTS.tmp.md`.

> **Update after learnings or mistakes**; when a correction, new convention, or hard-won lesson
> emerges during development, append it to the relevant section of this file immediately. AGENTS.md
> and referenced addenda are the source of truth for project conventions.

## TypeScript Conventions

- **Exact optional properties**; `exactOptionalPropertyTypes` is enabled.
  - Optional properties must include `| undefined` when assignable to `undefined`.
  - Use `foo?: string | undefined`, not `foo?: string`.
- **No unchecked indexed reads**; write new code as if `noUncheckedIndexedAccess` were enabled.
  - Narrow indexed reads before use.
  - Otherwise, make the invariant obvious with the smallest practical assertion.
- **`readonly` arrays**; use `readonly T[]` for array types in type definitions.
- **Existing `readonly` properties are fine**; viem has DOM-shaped WebAuthn types and inference-heavy literals that intentionally preserve `readonly` properties. Do not churn them just to satisfy a style preference.
- **`type` over `interface` by default**; use `type` for project-owned shapes. Ambient declarations and DOM-shaped compatibility types may use `interface`.
- **`.js` extensions**; all relative source imports include `.js` for ESM compatibility.
- **Follow local import style**; viem uses both namespace imports and named internal imports. Match the surrounding file instead of mass-converting import lists.
- **Zod import aliases**; import `zod/mini` as `z`.
  - Import zod module namespaces as `z_<Module>`.
  - Example: `import * as z_Hex from './Hex.js'`.
- **Classes for errors only**; all other APIs use functions and plain data.
- **Errors live next to the code that throws them**; keep module-specific failure classes local.
  - Put error classes near the bottom of the owning module.
  - Keep public functions and types first.
  - Set `name` to the namespaced form.
- **No enums**; use union types or `as const` objects for fixed sets.
- **camelCase constants**; prefer `camelCase` for local constants unless the surrounding file already uses protocol-style uppercase names for numeric constants.
- **`const` generic modifier**; use to preserve literal types for full inference.
- **Options default `= {}`**; use `options: Options = {}` not `options?: Options`.
- **Namespace params and return types**; put function types in a matching `declare namespace`.
  - Examples: `from.Options`, `serialize.ErrorType`.
  - Do not lift params to sibling exports by default.
- **`options` over `args`**; use `options` for typed option bags. Use domain nouns only when the parameter is not an options bag.
- **Minimal variable names**; prefer short, obvious names. Use `options` not `serializeOptions`, `fn` not `callbackFunction`, etc. Context makes meaning clear.
- **No redundant type annotations**; if the return type of a function already covers it, do not annotate intermediate variables. Let the return type do the work.
- **No inline object types on locals**; when a local variable needs an explicit object-type annotation, declare a named `type` on the line directly above and reference it.
- **Return directly**; do not declare a variable just to return it. Use `return { ... }` unless the variable is needed for reuse or readability.
- **IIFE expressions for fallible local derivations**; prefer IIFEs for local `try`/`catch` parsing.
  - Avoid `let value: T` followed by assignment inside `try`.
- **Skip braces for single-statement blocks**; omit `{}` for single-statement `if`, `for`, etc., when the surrounding file follows that style.
- **No section separator comments**; do not use `// ---` or `// ===` divider comments. Let JSDoc and whitespace provide structure.
- **No internal-tracking references in code or comments**; code must read standalone.
  - Avoid planning phases, task IDs, and internal labels.
  - A bare `TODO:` describing actual work is fine.
- **No prior-version references in code or comments**; do not mention old names or migration framing.
  - Comments describe current behavior only.
  - Put parity and migration notes in the changeset.
- **Static imports by default**; use static `import` declarations. Dynamic imports are reserved for real runtime boundaries (e.g. `viem/node` trusted setups, optional heavyweight paths).
- **Namespace imports for modules**; prefer `import * as <Module>` for module imports.
  - Access members as `Errors.BaseError` or `RpcSchema.Default`.
  - Alias a module's own `./internal/*` helper as `import * as internal`.
  - Named imports are fine for `internal/types.ts`.
  - Named imports are fine for single-function helpers like `stringify`, `uid`, and `wait`.
  - Named imports are fine for non-namespace third-party packages like `vitest`.
- **Actions are imported via the root `Actions` namespace**; use `import { Actions } from 'viem'`.
  - Call standalone actions as `Actions.<action>(client, ...)`.
  - Test actions live under `Actions.test`.
  - Decorator usage prefers named imports like `testActions`.
  - Do not use named imports for individual actions.
- **Minimize `as any`**; avoid new `as any` where a safer assertion is practical, but do not mass-rewrite existing crypto, tuple, and inference glue that already relies on it.
- **No `as never`**; treat a needed `as never` as a bug in the surrounding types and fix the
  types instead. Known root causes and their fixes:
  - Inference-defeating property unions (`strict?: strict | boolean | undefined`) — drop the
    widening arm so literal arguments pin the generic.
  - Union-of-actions dispatch (`typeof write | typeof writeSync`) — route through the shared
    internal dispatchers (`dispatchWrite`/`dispatchSend`/`estimateWrite`/`simulateWrite` in
    `core/actions/token/internal.ts`, re-exported for tempo); never add per-file dispatch casts.
  - Either-or option unions (`blockNumber`/`blockTag`) — thread one side with a conditional
    spread instead of passing both.
  - Action args that collide with transaction-request fields (`signature`) — destructure them
    out before spreading options into a write.
  - Runtime-selected calls vs conditional return types — branch on the runtime discriminant so
    each arm typechecks, and cast only the final return to the conditional type.
  - When a cast is genuinely unavoidable (wire-codec/envelope unions, dynamic hook plumbing),
    prefer a precise `as X` with a one-line justification comment; a commented `as never` is the
    last resort and only in internal seams or tests exercising them.
- **Destructure when accessing multiple properties**; prefer `const { a, b } = options` over repeated `options.a`, `options.b`.
- **Read from `options.x` when normalizing a single field**; avoid inventing a second name.
  - Applies when transforming one option into a local of the same name.
- **Ox helpers over ad hoc conversion**; use ox helpers like `Hex.fromNumber`, `Hex.toBytes`, `Bytes.fromHex`, `Value.fromGwei`, etc. instead of open-coded conversions.
- **Use ox branded types**; prefer existing ox types such as `Hex.Hex`, `Bytes.Bytes`, and `Address.Address` over raw template literal types when the branded module type exists.
- **Keep property order readable**; preserve the local ordering style. Do not alphabetize arrays, RLP tuples, ABI parameters, transaction fields, or other order-sensitive wire shapes.

## Type Inference Conventions

- **Preserve literals**; use `const` generics and narrow helper signatures when an API should preserve literal inputs.
- **Type tests in `.test-d.ts`**; use Vitest's `expectTypeOf` in colocated `.test-d.ts` files to assert generic inference works. Type tests are first-class; write them alongside implementation. Run via `pnpm test:typecheck`.
- **Snapshot inferred public types**; use type snapshots for migrated public surfaces.
- **No `any` leakage**; user-facing callback, return, and option types should not leak `any` unless the surrounding API already intentionally does.
- **Type inference after every feature**; check whether new types can be narrowed.
  - Add or update type tests when public inference changes.

## API Conventions

- **Stateless module APIs**; public APIs are module namespaces full of functions and types. Do not introduce stateful classes for normal library behavior.
- **Public entrypoint docs**; when adding a public module or export, update the owning `index.ts` (and `src/index.ts` for root exports) with the export and a TSDoc block.
- **Alphabetical exports**; order exports alphabetically by exported name — barrel/entrypoint export statements, named-export lists, and the exported declaration blocks of action/module files alike.
- **Package exports are generated**; run `pnpm exports:update` only when intentionally adding, removing, or renaming public subpath exports.
- **Keep public APIs lean**; avoid exposing options for values the library can derive from existing inputs.
- **Wire formats stay explicit**; serialization, RPC, RLP, ABI, and transaction-envelope code should keep wire-order and field-shape decisions visible at the call site.
- **Internal helpers stay internal**; keep helper modules under `internal/` directories unless they are part of the public API.

## Documentation Conventions

- **Docs immediately after a module**; write site docs before moving to the next module.
  - Include the sub-page and sidebar wiring.
- **Show example responses with `// @log:`**; annotate action doc Usage examples that return values.
  - Place the `// @log:` comment directly under the bound result.
  - Show the example response shape.
  - Multi-line `// @log:` blocks are fine for objects.
  - Actions returning `void` are exempt.
- **Alphabetize doc parameters**; option-bag properties are listed alphabetically.
  - Required and optional properties share the same ordering.
  - This matches source `Options` types.
  - Covers `##### ` sub-properties under `#### options`.
  - Covers `### ` entries for action options.
  - Positional function arguments stay in signature order.
  - Applies to hand-written docs only.
  - Generated `utilities/` pages are synced from Ox.
- **Doc-driven API changes**; write or update the TSDoc before or alongside the implementation, not as an afterthought.
- **TSDoc on public exports**; every public function, type, and constant gets TSDoc.
  - Public type properties get TSDoc too.
- **Decorator methods get JSDoc**; every method on a decorator's `Decorator` type gets JSDoc.
  - Use the same docs as the underlying action.
  - Rewrite examples for client-extension calls.
- **Examples should be small**; public examples should show the minimum useful shape and avoid unrelated setup.
- **Source docs first**; public API documentation usually belongs in TSDoc near the exported source.
- **Site pages**; human-written docs live under `site/pages/`.
  - Generated site page files are not edited by hand.

## Type Conventions

- **No eager type definitions**; do not extract a named type until it is used in more than one place or makes a difficult local shape easier to read.
- **Shared domain types live near their module**; keep reusable public types in the module that owns the domain concept.
- **Error unions live in namespaces**; exported function error unions should live in that function's namespace as `ErrorType`.

## Abstraction Conventions

- **Prefer duplication over the wrong abstraction**; duplicated code with a clear bug-fix burden is better than a bad abstraction that is scary to change.
- **Do not abstract until the commonalities scream**; wait for 3+ concrete use cases where the right abstraction becomes obvious. Do not abstract for 1-2 instances.
- **Optimize for change**; code that is easy to change beats code that is cleverly DRY. We do not know future requirements.
- **No flags or mode parameters**; if an abstraction needs `if` branches or boolean params to handle different call sites, it is usually the wrong abstraction. Inline it.
- **Start concrete, extract later**; begin inline. Extract only when a clear pattern emerges across multiple real usages.

## Testing Conventions

- **Use `pnpm test` for tests**; run tests through package scripts, not `vitest` directly.
- **No mocks, ever**; tests must not use mocks, stubs, or `vi`.
  - Forbidden examples: `vi.fn`, `vi.mock`, `vi.spyOn`, fake `fetch`, fake clients.
  - Exercise real behavior against the configured test chain or real ephemeral servers.
  - If a test seems to need a mock, rework the code or test.
- **Target the relevant project**; prefer narrow test commands while iterating.
  - Use `pnpm test --run <paths>` for focused runs.
  - Use `pnpm test --project core --bail=1` for core failures.
  - Use `--project tempo` for tempo work.
  - Use `SKIP_GLOBAL_SETUP=true` for offline runs that do not need anvil.
- **Check for orphaned anvil listeners before full-suite runs**; a killed test run can leave
  its proxy holding ports 8545/8645, making later runs fail at global setup (`EADDRINUSE`) or
  time out en masse against the wedged instance. `lsof -nP -i :8545 -i :8645` and kill the stale
  `node` process.
- **Tempo tests boot one container per test file**; the file's `afterAll` stops it. A cancelled
  run leaks `tempo.<uuid>` containers that starve later runs. `docker ps` and `docker rm -f`
  the leaked ones before re-running `--project tempo`.
- **eip4844/kzg tests flake under full parallel runs**; the blob/kzg suites (`prepare`, `sign`
  eip4844 cases) intermittently time out when the whole suite runs with `--maxWorkers=4`, and
  pass in isolation. Verify in isolation before suspecting code.
- **Full parallel runs can rate-limit the fork upstream**; 100+ fresh fork instances cold-fetching
  pinned state can saturate the fork RPC, failing random fork-state tests (`getBalance`,
  `getProof`, …). Re-run with `--maxWorkers=4`, and verify suspicious failures in isolation before
  suspecting code.
- **Use `anvil.local` for pending-hash polling tests**; a fork forwards unknown-hash lookups
  (`eth_getTransactionReceipt`, `eth_getTransactionByHash`) to the upstream RPC, adding unbounded
  latency to polls over pending or replaced transactions.
  - Reserve `anvil.mainnet` for tests that need pinned fork state.
  - Transport retries also stack here: proxy tests asserting error passthrough should set
    `retryCount: 0` on the proxied transport.
- **Colocate tests**; tests are sibling `*.test.ts` files next to their module; prefer inline snapshots over snapshot files.
- **No tests for pure re-exports**; upstream packages own coverage for pure re-export modules.
  - Once a facade gains project logic, add sibling tests.
- **Import public API from `'viem'` in tests**; use aliases for public exports.
  - Import public modules from `'viem'` or `'viem/node'`.
  - Avoid relative imports for public surface tests.
  - Internal helpers may stay relative.
  - Non-exported members may stay relative.
  - Chain definitions may stay relative.
- **Import transports by their bare name**; use transport sugar exports in tests.
  - Use `http(...)`, `custom(...)`, `fallback(...)`, `webSocket(...)`, `loadBalance(...)`, `rateLimit(...)`.
  - Import those functions from `'viem'`.
  - Do not call `Transport.http(...)`.
  - Keep `Transport` namespace imports for non-transport members only.
- **No redundant top-level `describe`**; do not wrap a whole file in an echoing `describe`.
  - Put primary export tests at top level.
  - Use `describe` for nested scenarios.
  - Use `describe` to separate multiple distinct exports in one file.
- **Inline snapshots over direct assertions**; prefer `toMatchInlineSnapshot()` over `.toBe()`, `.toEqual()`, etc. for stable return values. Use `toThrowErrorMatchingInlineSnapshot()` for error assertions.
- **Test behavior, not call-tracking**; assert observable outputs.
  - Do not assert that a hook or function was invoked.
  - Do not use `let xCalled = false` flags or counters.
  - Make hooks produce distinguishable, verifiable results.
  - Example: a chain `serialize` hook can return a known value.
  - Example: recover the signer from a `getSignPayload` payload.
- **Snapshot whole objects, omit nondeterministic properties**; destructure out nondeterministic fields and snapshot the rest, rather than cherry-picking individual fields to assert.
- **Prefer whole-response snapshots over dynamic fixtures**; snapshot whole decoded responses.
  - Use deterministic data, like a pinned fork block anvil caches.
  - Omit nondeterministic values before snapshotting.
  - Do not fetch values in `beforeAll` for mutable fixtures.
  - Do not assert stashed fields one-by-one.
  - For nondeterministic lookups, use deterministic not-found assertions.
  - Locally-produced transaction equality is fine for whole-object assertions.
- **Vectors use Bun**; run vector tests with `pnpm vectors`.
- **Browser tests use browser suffixes**; browser-specific behavior uses `*.browser.test.ts`.
- **Fuzz tests stay gated**; fuzz harnesses use `*.fuzz.ts` behind an opt-in project.
  - Default `pnpm test` must never pick them up.
- **Unit and type tests as you go**; write unit tests and `.test-d.ts` type tests alongside implementation for each public behavior change.
- **100% module coverage**; modules with coverage requirements must reach 100%.
  - Cover error, retry, and timeout paths.
  - Delete or wire unreachable branches.

## Workflow Conventions

- **Use targeted commands**; prefer the smallest command that covers the touched behavior.
- **Types**; run `pnpm check:types` after TypeScript changes.
- **Repo checks**; run `pnpm check:repo` when package metadata or workspace shape changes.
- **Docs dev server**; use `pnpm docs:dev` for documentation UI work; `pnpm docs:build` builds the site.
- **`pnpm check` mutates**; it runs `vp check --fix` (oxlint + oxfmt). Use it only when intentionally applying lint/format fixes.
- **`pnpm exports:update` mutates**; it rewrites `package.json#exports` (+ `typesVersions`).
- **`pnpm contracts:build` mutates generated contract artifacts**; it runs Forge and `scripts/contracts:build.ts`.
- **Install hooks can mutate**; `pnpm install` runs `postinstall`.
  - `postinstall` initializes submodules, builds contracts, and runs `pnpm dev`.
  - Use `pnpm install --ignore-scripts` when `test/tempo` has local work.
  - A bare install resets the `test/tempo` checked-out commit.
  - Fresh binary packages may need `node node_modules/<pkg>/install.js`.

## Changeset Conventions

- **Changesets only for public behavior**; add or update a changeset when a change affects public API or existing behavior.
- **Update existing changesets first**; if the branch already has a changeset for the same area, update it instead of adding a duplicate.
- **One sentence, past tense**; changeset entries are a single sentence written in past tense.
- **Breaking changes include migration shape**; major changes include a `diff` fence showing the before/after migration shape.

## Git Conventions

- **Maintainer-gated commits**; never commit, push, or stage without explicit maintainer approval.
  - Implement and verify, then leave the work tree dirty for review.
  - The maintainer decides when work gets committed.
  - A landed task may stay reviewed but uncommitted.
- **Conventional commits**; use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` prefixes. Scope is optional (e.g. `feat(abi): add tuple formatter`).
- **Preserve dirty work**; do not revert, clean, or overwrite local changes unless asked.
  - Never stage the `test/tempo` submodule pointer.
  - Never stage the user's untracked in-progress files.
  - Exclude `test/tempo` explicitly when staging.

## Documentation (Site)

Guidelines for authoring docs and guides under `site/pages/`.

### Prose

- **Do not use em dashes (`—`) in docs.** Rewrite with a colon, comma, parentheses, or separate
  sentences instead.

### Headings

- **Use Title Case for all headings.**
  - Capitalize the first and last word.
  - Capitalize major words: nouns, verbs, adjectives, adverbs, and pronouns.
  - Keep minor words lowercase unless first or last.
  - Minor words include articles, short coordinating conjunctions, and short prepositions.
- Examples: `Send a Transaction`, `Pay Fees with Stablecoins`, `Set a Default Fee Token`,
  `See More`.
- Code identifiers inside a heading keep their original casing (e.g. `### Prefer Sync Actions`,
  but `## sendTransactionSync` when the heading *is* the identifier).

### Links

- Link out to every action (and other API) referenced in prose, on first mention. Tempo Actions
  link to `/tempo/actions/<namespace>.<action>`; core Viem actions link to their `/docs/...` page.

### Module Pages

- **Module docs are concept-first.** Each module has a concept landing page plus task/reference
  sub-pages.
  - **Landing page** (`index.mdx`) is concept-first.
    - Start with `## Overview`.
    - Explain what the module is, how it works, and when to use it.
    - Include a minimal `ts twoslash` usage example after the concept prose.
    - Follow with a `<Cards>` grid linking to each succeeding sub-page.
    - Each `<Card>` has a title, short description, icon, and `to`.
    - Do not add `## Recipes` or reference sections here.
  - **Sub-pages** lead with prose, then drill into the API, containing in order:
    - `## Overview`; the concept for this task/function.
    - `## Recipes`; independent, self-contained tasks.
      - See the Guides section for the recipe shape.
      - Cover documented parameters and options through recipes.
      - Demonstrate every meaningful parameter or notable option-bag field.
      - Show why and how to reach for each option.
      - Do not only restate the reference table.
    - **An API reference**; add one `## ` section per exported function or type.
      - Name each section after the identifier.
      - Example: ``## `Account.from` ``.
      - Include `### Usage`, `### Parameters`, `### Return Value`, and `### Errors` as applicable.
- **Reference sections open with a one-line description**; place it under each function heading.
  - Describe what the function does.
  - Then add `### Usage`.
  - Keep it terse and sourced from TSDoc.
- **`### Parameters` never uses tables**; list each parameter as its own heading.
  - Use `#### options` for option bags.
  - Use `##### foo` for nested option-bag fields.
  - Add `- **Type:**` and `- **Default:**` bullets when applicable.
  - Follow type bullets with prose.
  - Do not prefix parameter headings with `options.`.
  - Write `##### batch`, not `##### options.batch`.
  - Reserve tables for `### Errors`.
- **Each parameter heading includes a focused example**; add a `ts twoslash` snippet.
  - Place it after the type bullets and prose.
  - Cover each `##### foo` and scalar `#### param`.
  - Show the parameter in realistic use.
  - Mark relevant lines with `// [!code focus]`.
  - Keep snippets minimal.
  - Hide imports and setup with `// ---cut---`.
  - Parameter reference snippets stay terse.
- **`### Return Value` is an inline code fence, not a bullet**; put the type alone.
  - Place bare inline `` `Type` `` directly under the heading.
  - Do not write `- **Type:** ...`.
  - Follow with a sentence describing it.
- **`### Errors` is a table, not bullets**; use `Error` and `Description` columns.
  - List concrete error classes.
  - Do not list `.ErrorType` aliases.
  - Expand aliases to their underlying classes.
- **Don't restate the discriminant in prose**; do not append parentheticals like
  `(type: 'json-rpc')` after a concept name; the type is already shown in the usage example.
- **Sidebar labels are short concept/task phrases**; use fewer than 5 words.
  - Use Title Case.
  - Describe the concept or task.
  - Do not merely echo the identifier.
  - Always label the module landing page `Overview`.
- **Paths are `/docs/<module>/<slug>`**; use lowercase, hyphenated paths.
  - The module landing page lives at `/docs/<module>`.
  - Sub-pages use a short task or concept slug.
  - Example: `/docs/chains/create`.
  - Nest deeper only when a module has sub-groups.
- **Viem utilities are re-exported Ox docs.**
  - Utility modules under `docs/utilities/` are pure Ox re-exports.
  - Sync their pages from Ox docs with `pnpm docs:sync-utils`.
  - Do not hand-author concept or Recipes sections for them.
  - Do not hand-edit generated utility pages.
  - Update the sync script instead.

### Guides

- A guide's main body is a **`## Recipes`** section: independent, self-contained tasks, each a
  `###` subheading with no enforced order. Do not use step-by-step "Walkthrough" sections.
- **Recipes use code focus.**
  - Show full imports in recipe code blocks.
  - Do not use `// ---cut---` in recipes.
  - Mark relevant option or parameter lines with `// [!code focus]`.
  - Focus only the lines the recipe is about.
- Do **not** repeat client setup as its own recipe.
  - Open Recipes with a prerequisite line linking to Getting Started.
  - Example: "These recipes assume you have [set up a Tempo client](/tempo)."
  - Code examples still include a `viem.config.ts` tab.
  - Use `[!include ~/snippets/tempo/viem.config.ts:setup]`.
- **Always show imports in code examples.**
  - Do not use `// ---cut---` to hide imports.
  - Each `example.ts` block starts with imports.
  - Include `import { client } from './viem.config'` when relevant.
  - Add a blank line before the example body.
- Guide section order: `## Overview` → `## Recipes` → `## Best Practices` → `## See More`.
