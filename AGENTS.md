# Viem Agent Guidelines

This document contains guidelines for AI agents working on the Viem codebase.

> **Update after learnings or mistakes** -- when a correction, new convention, or hard-won lesson
> emerges during development, append it to the relevant section of this file immediately. AGENTS.md
> is the source of truth for project conventions and should grow as the project does.

## Repository & Tooling (v3)

- **Branch** -- v3 development happens on `v3-next`. The pre-existing `v3` branch is an old
  big-bang prototype kept only as reference. v2 releases continue from `main`.
- **Clean slate** -- the v2 sources are frozen under `src-old/` and `test-old/` (reference +
  test-porting source only; deleted once the rewrite reaches parity). They are excluded from
  build, lint, type-check, tests, knip, and size -- **never edit them, never import from them in
  committed code**, and do not try to fix their type errors (the frozen tree no longer compiles
  against ox `1.0.0-beta.0`; that is expected and irrelevant). The v3 tree grows fresh in `src/`
  and `test/`. The `test/tempo` submodule stays at `test/tempo` (it is live infra, not v2 legacy).
- **Parity tests are one-shot scaffolding** -- a colocated test importing from `src-old/` to
  assert v2/v3 output parity is written, run, passed, and **deleted before commit**. Permanent v3
  tests are ports of the v2 suites (adapted to the new API), never comparisons against `src-old/`.
- **Build** -- `pnpm build` runs `exports:update` + `zile` (ESM-only, output in `dist/`) + copies
  `src/trusted-setups` into `dist/`. zile derives sources from `package.json#exports` (the
  `include` in tsconfig is irrelevant to it) and reads `./tsconfig.json` for compiler options.
  Never re-enable `incremental` for the root tsconfig: `.tsbuildinfo` reuse after zile cleans
  `dist/` silently skips emit and produces a near-empty build.
- **Package layout** -- the root `package.json` holds private workspace fields above the
  `"[!start-pkg]": ""` marker and the published package fields below it. `zile publish:prepare`
  strips the pre-marker fields. There is no `src/package.json`.
- **Exports are generated** -- run `pnpm exports:update` only when intentionally adding, removing,
  or renaming public entrypoints. It rewrites `package.json#exports` (+ `typesVersions`) from the
  contents of `src/` (`src/<dir>/index.ts` → `./<dir>`; `types` condition first — publint
  requires it). There is deliberately no `./package.json` export (zile would copy the dev manifest
  into `dist/`).
- **Lint/format** -- `pnpm check` runs `vp check --fix` (oxlint + oxfmt) and **mutates**. yaml,
  md/mdx, css, and `site/pages/` are excluded from formatting. Type-aware linting and the
  jsdoc/tsdoc plugins are intentionally off until modules migrate to v3 conventions.
- **Tests** -- `pnpm test` runs `vp test` (config in root `vite.config.ts`). Currently a single
  `core` project over `src/**/*.test.ts` with no global setup (anvil/prool and the `tempo`
  project return as the modules that need them are rebuilt). Tests are colocated as siblings of
  their module (`src/utils/Hex.ts` + `src/utils/Hex.test.ts`), inline snapshots preferred.
  Use `pnpm test --run <paths>` for targeted runs.
- **Type checking** -- `pnpm check:types` runs `tsc -b` (project references: scripts, site, src,
  test).
- **Other gates** -- `pnpm knip` (production mode), `pnpm check:repo` (sherif), `pnpm test:build`
  (publint + attw, esm-only profile), `pnpm size` (size-limit against `dist/`), `pnpm vectors`
  (bun).
- **Plan docs are local** -- `tasks/` is gitignored. The v3 plan lives at `tasks/v3.md`; the
  breaking-change log at `tasks/v3-breaking-changes.md`; API sketches at `tasks/v3-api/`; v2
  size baselines (pre-flip actuals) at `tasks/v3-size-baselines.md`.
- **Version constant** -- `pnpm version:update` writes `src/version.ts` (`@internal`, consumed by
  the errors substrate). Do not hand-edit it.

## v3 Process Conventions

- **Breaking-change log (same-PR rule)** -- any change to public behavior/API appends or updates
  an entry in `tasks/v3-breaking-changes.md` in the same change set. Log discovered breaks
  (snapshot diffs, error-class changes, type-inference changes) too, not just intentional ones.
  Entries: status (`planned` → `landed`), phase/task ref, area, past-tense summary, and a `diff`
  fence with the migration shape.
- **API-first module reviews** -- no public module is implemented before a signature-only sketch
  in `tasks/v3-api/<Module>.md` is approved by the maintainer. For utils façades the sketch is the
  curated export manifest (which v2 names survive → ox mapping, which are deleted).
- **Check parity against v2** -- when migrating or sketching a module, always read the real v2
  implementation (on `main`, or the existing `src/` code) for that surface and reconcile field
  shapes, names, ordering, defaults, and behavior against it. Intentional divergences from v2 are
  logged in `tasks/v3-breaking-changes.md`; unintentional ones are bugs. Do not infer the v2 shape
  from memory.
- **Ox is the primitive layer** -- when migrating code, prefer ox v1 modules (`Hex`, `Bytes`,
  `Abi*`, `Address`, `Hash`, `Signature`, `Secp256k1`, `TxEnvelope*`, …) over hand-rolled
  implementations. Direct `@noble/*`/`@scure/*` usage is being removed in Phase B; do not add new
  usage.

## TypeScript Conventions

- **Exact optional properties** -- `exactOptionalPropertyTypes` is enabled in tsconfig. Optional properties must include `| undefined` in their type if they can be assigned `undefined` (e.g. `foo?: string | undefined`, not `foo?: string`).
- **No unchecked indexed reads** -- `noUncheckedIndexedAccess` is **not yet enabled** in viem (planned for v3). Write new code as if it were: narrow indexed reads before use, or make the invariant obvious with the smallest possible assertion.
- **`readonly` arrays** -- use `readonly T[]` for array types in type definitions.
- **Existing `readonly` properties are fine** -- viem has DOM-shaped WebAuthn types and inference-heavy literals that intentionally preserve `readonly` properties. Do not churn them just to satisfy a style preference.
- **`type` over `interface` by default** -- use `type` for project-owned shapes. Ambient declarations and DOM-shaped compatibility types may use `interface`.
- **`.js` extensions** -- all relative source imports include `.js` for ESM compatibility.
- **Follow local import style** -- viem uses both namespace imports and named internal imports. Match the surrounding file instead of mass-converting import lists.
- **Zod import aliases** -- import `zod/mini` as `z`, and import zod module namespaces as `z_<Module>` (for example, `import * as z_Hex from './Hex.js'`). Applies from the C2 `chain.schema` work onward.
- **Classes for errors only** -- all other APIs use functions and plain data.
- **Errors live next to the code that throws them** -- module-specific failure classes live inside the module that owns the failure mode. Place each error class near the bottom of the module so the public functions and types are what the reader sees first. Set `name` to the namespaced form (`'Hex.InvalidHexValueError'`, `'Client.ExtensionError'`, etc.). (v3 convention -- applies to new/migrated modules; v2 error classes migrate with their module.)
- **No enums** -- use union types or `as const` objects for fixed sets.
- **camelCase constants** -- prefer `camelCase` for local constants unless the surrounding file already uses protocol-style uppercase names for numeric constants.
- **`const` generic modifier** -- use to preserve literal types for full inference.
- **Options default `= {}`** -- use `options: Options = {}` not `options?: Options`.
- **Namespace params and return types** -- place function parameter, return, and error types in a `declare namespace` matching the function name (e.g. `from.Options`, `serialize.ErrorType`). Do not lift the params type to a sibling export unless the surrounding module already has a shared type. (v3 convention -- v2's `<Action>Parameters`/`<Action>ReturnType` exports migrate to this shape per-module.)
- **`options` over `args`** -- use `options` for typed option bags. Use domain nouns only when the parameter is not an options bag.
- **Minimal variable names** -- prefer short, obvious names. Use `options` not `serializeOptions`, `fn` not `callbackFunction`, etc. Context makes meaning clear.
- **No redundant type annotations** -- if the return type of a function already covers it, do not annotate intermediate variables. Let the return type do the work.
- **No inline object types on locals** -- when a local variable needs an explicit object-type annotation, declare a named `type` on the line directly above and reference it.
- **Return directly** -- do not declare a variable just to return it. Use `return { ... }` unless the variable is needed for reuse or readability.
- **IIFE expressions for fallible local derivations** -- when a local needs `try`/`catch` to parse or normalize a value, prefer an IIFE expression over `let value: T` followed by assignment inside `try`.
- **Skip braces for single-statement blocks** -- omit `{}` for single-statement `if`, `for`, etc., when the surrounding file follows that style.
- **No section separator comments** -- do not use `// ---` or `// ===` divider comments. Let JSDoc and whitespace provide structure.
- **No plan references in code or comments** -- never reference the v3 plan, phases, or tasks (e.g. `C2`, `B6`, `D11`, "in a later phase", `TODO(C2)`) in source comments, JSDoc, or identifiers. Code must read standalone. Plan/phase tracking belongs only in `tasks/`. A bare `TODO:` describing the actual work is fine.
- **No v2 references in code or comments** -- never mention v2, its old names, or migration framing (e.g. "replaces v2 `formatters`", "was `defineChain`") in source comments, JSDoc, or identifiers. Comments describe what the code does now and must read standalone. v2-parity and migration notes belong in `tasks/v3-breaking-changes.md`.
- **Static imports by default** -- use static `import` declarations. Dynamic imports are reserved for real runtime boundaries (e.g. `viem/node` trusted setups, optional heavyweight paths).
- **Minimize `as any`** -- avoid new `as any` where a safer assertion is practical, but do not mass-rewrite existing crypto, tuple, and inference glue that already relies on it.
- **Destructure when accessing multiple properties** -- prefer `const { a, b } = options` over repeated `options.a`, `options.b`.
- **Read from `options.x` when normalizing a single field** -- when transforming exactly one option into a local of the same name, read it directly from `options` instead of destructuring and inventing a second name.
- **Ox helpers over ad hoc conversion** -- use ox helpers like `Hex.fromNumber`, `Hex.toBytes`, `Bytes.fromHex`, `Value.fromGwei`, etc. instead of open-coded conversions.
- **Use ox branded types** -- prefer existing ox types such as `Hex.Hex`, `Bytes.Bytes`, and `Address.Address` over raw template literal types when the branded module type exists.
- **Keep property order readable** -- preserve the local ordering style. Do not alphabetize arrays, RLP tuples, ABI parameters, transaction fields, or other order-sensitive wire shapes.

## Type Inference Conventions

- **Preserve literals** -- use `const` generics and narrow helper signatures when an API should preserve literal inputs.
- **Type tests in `.test-d.ts`** -- use Vitest's `expectTypeOf` in colocated `.test-d.ts` files to assert generic inference works. Type tests are first-class; write them alongside implementation. Run via `pnpm test:typecheck`.
- **Snapshot inferred public types** -- the ox `.snap-d.ts` type-snapshot pattern is adopted as modules migrate to v3 conventions.
- **No `any` leakage** -- user-facing callback, return, and option types should not leak `any` unless the surrounding API already intentionally does.
- **Type inference after every feature** -- after implementing any feature, check if new types can be narrowed. Add or update type tests alongside behavioral tests when public inference changes.

## API Conventions

- **Stateless module APIs** -- public APIs are module namespaces full of functions and types. Do not introduce stateful classes for normal library behavior.
- **Public entrypoint docs** -- when adding a public module or export, update the owning `index.ts` (and `src/index.ts` for root exports) with the export and a TSDoc block.
- **Package exports are generated** -- run `pnpm exports:update` only when intentionally adding, removing, or renaming public subpath exports.
- **Keep public APIs lean** -- avoid exposing options for values the library can derive from existing inputs.
- **Wire formats stay explicit** -- serialization, RPC, RLP, ABI, and transaction-envelope code should keep wire-order and field-shape decisions visible at the call site.
- **Internal helpers stay internal** -- keep helper modules under `internal/` directories unless they are part of the public API.

## Documentation Conventions

- **TSDoc on public exports** -- every exported public function, type, and constant gets a TSDoc comment. Type properties get TSDoc when they are part of the public surface. (Enforced per-module as code migrates to v3 conventions -- the jsdoc lint plugins switch on with B/C.)
- **Doc-driven API changes** -- write or update the TSDoc before or alongside the implementation, not as an afterthought.
- **Examples should be small** -- public examples should show the minimum useful shape and avoid unrelated setup.
- **Source docs first** -- public API documentation usually belongs in TSDoc near the exported source.
- **Site pages** -- human-written docs live under `site/pages/`. `site/pages.gen.ts` is generated -- do not edit by hand. (ox-style generated API-reference pages arrive with the post-C7 docgen stretch.)

## Type Conventions

- **No eager type definitions** -- do not extract a named type until it is used in more than one place or makes a difficult local shape easier to read.
- **Shared domain types live near their module** -- keep reusable public types in the module that owns the domain concept.
- **Error unions live in namespaces** -- exported function error unions should live in that function's namespace as `ErrorType`.

## Abstraction Conventions

- **Prefer duplication over the wrong abstraction** -- duplicated code with a clear bug-fix burden is better than a bad abstraction that is scary to change.
- **Do not abstract until the commonalities scream** -- wait for 3+ concrete use cases where the right abstraction becomes obvious. Do not abstract for 1-2 instances.
- **Optimize for change** -- code that is easy to change beats code that is cleverly DRY. We do not know future requirements.
- **No flags or mode parameters** -- if an abstraction needs `if` branches or boolean params to handle different call sites, it is usually the wrong abstraction. Inline it.
- **Start concrete, extract later** -- begin inline. Extract only when a clear pattern emerges across multiple real usages.

## Testing Conventions

- **Use `pnpm test` for tests** -- run tests through package scripts, not `vitest` directly.
- **Target the relevant project** -- prefer `pnpm test --run <paths>` or `pnpm test --project core --bail=1` / `--project tempo` over the full matrix while iterating. Use `SKIP_GLOBAL_SETUP=true` for offline runs that do not need anvil.
- **Colocate tests** -- tests are sibling `*.test.ts` files next to their module; prefer inline snapshots over snapshot files.
- **No tests for pure re-exports** -- modules that only `export * from 'ox/<Ns>'` get no committed test suite (ox owns that coverage). Behavior-delta verification against v2 happens as one-shot scaffolding: write, run, record findings in the module's `tasks/v3-api/` manifest + breaking-change log, then delete the tests. Once a façade gains viem-specific logic, that logic gets sibling tests.
- **Wrap function exports in `describe`** -- every test file targets one or more exported functions; each function gets its own `describe('functionName', () => { ... })` block.
- **Inline snapshots over direct assertions** -- prefer `toMatchInlineSnapshot()` over `.toBe()`, `.toEqual()`, etc. for stable return values. Use `toThrowErrorMatchingInlineSnapshot()` for error assertions.
- **Snapshot whole objects, omit nondeterministic properties** -- destructure out nondeterministic fields and snapshot the rest, rather than cherry-picking individual fields to assert.
- **Browser tests use browser suffixes** -- browser-specific behavior uses `*.browser.test.ts` and the `browser` Vitest project (project lands with its first test).
- **Fuzz tests stay gated** -- fuzz harnesses use `*.fuzz.ts` behind a `FUZZ=true` project so the default `pnpm test` run never picks them up (project lands with its first harness; fuzz regressions become deterministic `*.test.ts` cases or vector fixtures).
- **Vectors use Bun** -- run vector tests with `pnpm vectors`.
- **Unit and type tests as you go** -- write unit tests and `.test-d.ts` type tests alongside implementation for each public behavior change.

## Workflow Conventions

- **Use targeted commands** -- prefer the smallest command that covers the touched behavior.
- **Types** -- run `pnpm check:types` after TypeScript changes.
- **Repo checks** -- run `pnpm check:repo` when package metadata or workspace shape changes.
- **Docs dev server** -- use `pnpm docs:dev` for documentation UI work; `pnpm docs:build` builds the site.
- **`pnpm check` mutates** -- it runs `vp check --fix` (oxlint + oxfmt). Use it only when intentionally applying lint/format fixes.
- **`pnpm exports:update` mutates** -- it rewrites `package.json#exports` (+ `typesVersions`).
- **`pnpm contracts:build` mutates generated contract artifacts** -- it runs Forge and `scripts/contracts:build.ts`.
- **Install hooks can mutate** -- `pnpm install` runs `postinstall`, which initializes submodules, builds contracts, and runs `pnpm dev`. **Use `pnpm install --ignore-scripts` when the `test/tempo` submodule has local work** (a bare install resets its checked-out commit). After `--ignore-scripts`, freshly added binary packages (e.g. `bun`) may need `node node_modules/<pkg>/install.js`.

## Changeset Conventions

- **Changesets only for public behavior** -- add or update a changeset when a change affects public API or existing behavior.
- **Update existing changesets first** -- if the branch already has a changeset for the same area, update it instead of adding a duplicate.
- **One sentence, past tense** -- changeset entries are a single sentence written in past tense.
- **Breaking changes include migration shape** -- major changes include a `diff` fence showing the before/after migration shape -- and a matching entry in `tasks/v3-breaking-changes.md`.

## Git Conventions

- **Maintainer-gated commits** -- never `git commit`, `git push`, or stage changes without the maintainer's explicit go-ahead. Implement and verify, then leave the work tree dirty for review; the maintainer decides when it gets committed (a "landed"/done task may stay reviewed-but-uncommitted until then).
- **Conventional commits** -- use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` prefixes. Scope is optional (e.g. `feat(abi): add tuple formatter`).
- **Preserve dirty work** -- do not revert, clean, or overwrite existing local changes unless explicitly asked. Never stage the `test/tempo` submodule pointer or the user's untracked in-progress files; exclude them explicitly (e.g. `git add -A -- ':(exclude)test/tempo'`).

## Documentation (Site)

Guidelines for authoring docs and guides under `site/pages/`.

### Prose

- **Do not use em dashes (`—`) in docs.** Rewrite with a colon, comma, parentheses, or separate
  sentences instead.

### Headings

- **Use Title Case for all headings.** Capitalize the first and last word and all major words
  (nouns, verbs, adjectives, adverbs, pronouns). Keep minor words lowercase unless they are the
  first or last word: articles (`a`, `an`, `the`), short coordinating conjunctions
  (`and`, `but`, `or`, `nor`, `for`, `so`, `yet`), and short prepositions (`in`, `on`, `to`,
  `of`, `for`, `with`, `as`, etc.).
- Examples: `Send a Transaction`, `Pay Fees with Stablecoins`, `Set a Default Fee Token`,
  `See More`.
- Code identifiers inside a heading keep their original casing (e.g. `### Prefer Sync Actions`,
  but `## sendTransactionSync` when the heading *is* the identifier).

### Links

- Link out to every action (and other API) referenced in prose, on first mention. Tempo Actions
  link to `/tempo/actions/<namespace>.<action>`; core Viem actions link to their `/docs/...` page.

### Guides

- A guide's main body is a **`## Recipes`** section: independent, self-contained tasks, each a
  `###` subheading with no enforced order. Do not use step-by-step "Walkthrough" sections.
- Do **not** repeat client setup as its own recipe. Open the Recipes section with a prerequisite
  line linking to Getting Started, e.g. "These recipes assume you have
  [set up a Tempo client](/tempo)." Code examples still include a `viem.config.ts` tab via
  `[!include ~/snippets/tempo/viem.config.ts:setup]`.
- **Always show imports in code examples.** Do not use the twoslash `// ---cut---` directive to hide
  import statements. Each `example.ts` block starts with its imports (including
  `import { client } from './viem.config'`), then a blank line, then the example body.
- Guide section order: `## Overview` → `## Recipes` → `## Best Practices` → `## See More`.
