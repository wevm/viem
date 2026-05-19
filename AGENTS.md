# viem -- Agent Guidelines

> **Update after learnings or mistakes** -- when a correction, new convention, or hard-won lesson emerges during development, append it to the relevant section of this file immediately. AGENTS.md is the source of truth for project conventions and should grow as the project does.

## TypeScript Conventions

- **Exact optional properties** -- `exactOptionalPropertyTypes` is enabled in tsconfig. Optional properties must include `| undefined` in their type if they can be assigned `undefined` (e.g. `foo?: string | undefined`, not `foo?: string`).
- **No unchecked indexed reads** -- `noUncheckedIndexedAccess` is enabled. Narrow indexed reads before use, or make the invariant obvious with the smallest possible assertion.
- **`readonly` arrays** -- use `readonly T[]` for array types in type definitions.
- **Existing `readonly` properties are fine** -- viem has RPC-shaped types, type snapshots, and inference-heavy literals that intentionally preserve `readonly` properties. Do not churn them just to satisfy a style preference.
- **`type` over `interface` by default** -- use `type` for project-owned shapes. Ambient declarations and DOM-shaped compatibility types may use `interface`.
- **`.js` extensions** -- all relative source imports include `.js` for ESM compatibility.
- **Follow local import style** -- viem uses both namespace imports and named internal imports. Match the surrounding file instead of mass-converting import lists.
- **Conflicting external aliases** -- when importing an external symbol that conflicts with a local module/export, alias it as `<library>_<Symbol>` with a lowercase library prefix, e.g. `import { BaseError as ox_BaseError } from 'ox/Errors'`.
- **Classes for errors only** -- all other APIs use functions and plain data.
- **Errors live next to the code that throws them** -- module-specific failure classes live inside the module that owns the failure mode. Place each error class near the bottom of the module so the public functions and types are what the reader sees first. Set `name` to the namespaced form (`'Hex.InvalidHexValueError'`, `'SignatureEnvelope.VerificationError'`, etc.) when the module uses that pattern.
- **No enums** -- use union types or `as const` objects for fixed sets.
- **camelCase constants** -- prefer `camelCase` for local constants unless the surrounding file already uses protocol-style uppercase names for numeric constants.
- **`const` generic modifier** -- use to preserve literal types for full inference.
- **Options default `= {}`** -- use `options: Options = {}` not `options?: Options`.
- **Namespace params and return types** -- place function parameter, return, and error types in a `declare namespace` matching the function name (e.g. `from.Options`, `serialize.ErrorType`). Do not lift the params type to a sibling export unless the surrounding module already has a shared type.
- **`options` over `args`** -- use `options` for typed option bags. Use domain nouns only when the parameter is not an options bag.
- **Minimal variable names** -- prefer short, obvious names. Use `options` not `serializeOptions`, `fn` not `callbackFunction`, etc. Context makes meaning clear.
- **No redundant type annotations** -- if the return type of a function already covers it, do not annotate intermediate variables. Let the return type do the work.
- **No inline object types on locals** -- when a local variable needs an explicit object-type annotation, declare a named `type` on the line directly above and reference it.
- **Return directly** -- do not declare a variable just to return it. Use `return { ... }` unless the variable is needed for reuse or readability.
- **IIFE expressions for fallible local derivations** -- when a local needs `try`/`catch` to parse or normalize a value, prefer an IIFE expression over `let value: T` followed by assignment inside `try`.
- **Skip braces for single-statement blocks** -- omit `{}` for single-statement `if`, `for`, etc., when the surrounding file follows that style.
- **No section separator comments** -- do not use `// ---` or `// ===` divider comments. Let JSDoc and whitespace provide structure.
- **Static imports by default** -- use static `import` declarations. Dynamic imports are reserved for real runtime boundaries already present in viem, such as worker or WASM loading.
- **Minimize `as any`** -- avoid new `as any` where a safer assertion is practical, but do not mass-rewrite existing crypto, tuple, and inference glue that already relies on it.
- **Destructure when accessing multiple properties** -- prefer `const { a, b } = options` over repeated `options.a`, `options.b`.
- **Read from `options.x` when normalizing a single field** -- when transforming exactly one option into a local of the same name, read it directly from `options` instead of destructuring and inventing a second name.
- **Hex helpers over ad hoc conversion** -- use Ox helpers like `Hex.fromNumber`, `Hex.toBytes`, `Bytes.fromHex`, `Value.fromGwei`, etc. instead of open-coded conversions.
- **Use Ox branded types** -- prefer existing Ox types such as `Hex.Hex`, `Bytes.Bytes`, and `Address.Address` over raw template literal types when the branded module type exists.
- **Keep property order readable** -- preserve the local ordering style. Do not alphabetize arrays, RLP tuples, ABI parameters, transaction fields, or other order-sensitive wire shapes.

## Type Inference Conventions

- **Preserve literals** -- use `const` generics and narrow helper signatures when an API should preserve literal inputs.
- **Type tests in `.test-d.ts`** -- use Vitest's `expectTypeOf` in colocated `.test-d.ts` files to assert generic inference works. Type tests are first-class; write them alongside implementation.
- **Snapshot inferred public types** -- use `.snap-d.ts` when the repo's existing type snapshot pattern fits the change.
- **No `any` leakage** -- user-facing callback, return, and option types should not leak `any` unless the surrounding API already intentionally does.
- **Type inference after every feature** -- after implementing any feature, check if new types can be narrowed. Add or update type tests alongside behavioral tests when public inference changes.

## API Conventions

- **Stateless module APIs** -- public APIs are module namespaces full of functions and types. Do not introduce stateful classes for normal library behavior.
- **Public entrypoint docs** -- when adding a public module or export, update `src/index.ts` with the module export and TSDoc block.
- **Package exports are generated** -- run `pnpm exports:update` only when intentionally adding, removing, or renaming public subpath exports.
- **Keep public APIs lean** -- avoid exposing options for values the library can derive from existing inputs.
- **Wire formats stay explicit** -- serialization, RPC, RLP, ABI, and transaction-envelope code should keep wire-order and field-shape decisions visible at the call site.
- **Internal helpers stay internal** -- keep helper modules under `internal/` unless they are part of the public API.

## Viem v3 API Conventions

- **Canonical root imports** -- the v3 root public shape is `import { Account, BaseError, Chain, Client, Transport, http } from 'viem'`. Root exports PascalCase viem-owned modules, the special `BaseError`, and flat transport factories.
- **Root modules are PascalCase namespaces** -- expose viem-owned APIs through modules such as `Account`, `Chain`, `Client`, and `Transport`. Keep namespace methods concise, e.g. `Client.create`, `Account.fromPrivateKey`, and `Chain.define`.
- **Core module subpaths are PascalCase** -- support direct module imports such as `import * as Client from 'viem/Client'`, `import * as Account from 'viem/Account'`, `import * as Chain from 'viem/Chain'`, and `import * as Transport from 'viem/Transport'`.
- **No generic `Key` module** -- do not introduce a generic viem-owned `Key` abstraction. Curve-specific Ox modules (`Secp256k1`, `P256`, `WebAuthnP256`, `WebCryptoP256`, `PublicKey`) are re-exported under `viem/utils` and host all verify / recover / sign surfaces at the curve level. `Account.sign(...)` remains the high-level entrypoint for managed-key accounts; curve modules are the primitive entrypoint for raw-key flows.
- **No root `Errors` namespace** -- use Ox's `BaseError` as viem's versioned base error and export it as the special flat root `BaseError`. Other errors stay colocated on the module that owns them, e.g. `Account.InvalidPrivateKeyError` or `actions.contract.ContractFunctionExecutionError`.
- **Actions live in the lowercase collection subpath** -- do not export a root `Actions` module. Document actions through `import * as actions from 'viem/actions'`.
- **Action namespaces are callable functions** -- expose standalone actions as nested properties on callable namespaces, e.g. `actions.public.getBalance`, `actions.wallet.sendTransaction`, `actions.ens.getAddress`, `actions.contract.read`, and `actions.test.mine`.
- **Core action namespaces are fixed** -- keep core actions grouped under `public`, `wallet`, `contract`, `ens`, and `test`. Do not split blocks, filters, or transactions into extra root action namespaces unless the API direction changes explicitly.
- **Action decorators live on namespaces** -- action namespaces are also decorator factories: use `Client.create(...).extend(actions.public())`, `actions.wallet()`, `actions.ens()`, `actions.contract()`, and `actions.test()`. Do not export flat root decorators such as `publicActions`, `walletActions`, or `testActions` in v3.
- **Decorated clients use nested methods** -- decorators attach nested client capabilities such as `client.public.getBalance`, `client.wallet.sendTransaction`, `client.ens.getAddress`, `client.contract.read`, and `client.test.mine`.
- **Extension client namespaces are domain-driven** -- remaining extension entrypoints follow the same module pattern, but decorators should attach client namespaces based on the capability domain rather than the package name. Do not force `client.<extension>` as a generic rule.
- **Remove redundant domain words** -- when an action namespace already names the domain, remove the repeated word from the method name: `getEnsAddress` becomes `actions.ens.getAddress`, `readContract` becomes `actions.contract.read`, `simulateContract` becomes `actions.contract.simulate`, and `multicall` becomes `actions.contract.multicall`.
- **Transport factories stay flat** -- functions such as `http`, `webSocket`, `fallback`, and `custom` remain flat exports from `viem`. Do not make `Transport.http()` the canonical API.
- **Transport module is type/helper-oriented** -- keep `Transport` for public transport types and low-level helpers, not as the canonical place for transport factory functions.
- **Chains stay flat** -- chain constants stay flat exports from `viem/chains`, e.g. `import { mainnet, base } from 'viem/chains'`. Do not bundle chain constants under `Chain`.
- **Chain helpers live under `Chain`** -- use `Chain.define` for custom chain definitions. Delete the old flat `defineChain` API.
- **Chain extension typing can live on definitions** -- use `Chain.extendSchema<T>()` when a chain definition owns reusable extension metadata. Use generic `.extend<T>(...)` for one-off extension validation, or inferred `.extend(...)` when literals are enough.
- **No `viem/chains/utils`** -- keep `viem/chains` for chain constants only. Move chain helper behavior to `Chain.*`.
- **Chain IDs are bigint** -- `Chain.define` and chain constants use bigint `id` and `sourceId` values. Do not add a chain quantity union or accept hex/number IDs at the Chain boundary.
- **Clients are created through `Client.create`** -- replace `createClient`, `createPublicClient`, `createWalletClient`, and `createTestClient` with `Client.create(...).extend(actions.public())` and related decorators.
- **Ox-backed utilities live in `viem/utils`** -- export Ox-backed modules such as `Abi`, `Address`, `Bytes`, `Hex`, `Value`, `Hash`, `Signature`, `PublicKey`, `Secp256k1`, `P256`, `WebAuthnP256`, `WebCryptoP256`, `Transaction`, `TransactionRequest`, `TransactionReceipt`, `Block`, `Log`, and RPC/provider modules from `viem/utils`.
- **Utility module subpaths mirror Ox** -- support `import { Hex } from 'viem/utils'` and `import * as Hex from 'viem/utils/Hex'`. Proxy Ox module names and method names exactly instead of preserving v2 utility wrapper names.
- **Utility types live inside modules** -- do not export same-name flat type aliases from `viem/utils`; prefer module types such as `Hex.Hex`, `Address.Address`, and `Signature.Signature`.
- **No `abitype` flat re-exports** -- do not expose flat `parseAbi`, `parseAbiItem`, or similar `abitype` re-exports from `viem/utils`. Use Ox ABI modules or module methods instead.
- **Removed extension entrypoints** -- v3 removes `viem/op-stack`, `viem/zksync`, `viem/celo`, and `viem/linea` instead of migrating them to the module API.
- **Extension removal does not remove chains** -- chain constants for OP Stack, ZKsync, Celo, and Linea networks can remain flat under `viem/chains` unless separately removed.
- **Extension chain config ownership** -- shared chain configuration for retained extension-owned behavior lives under `src/<extension>/chainConfig.ts`, not under `src/chains/internal`. Do not create configs for removed extensions when the chain definitions can own the data directly.
- **Tempo mirrors root viem** -- `viem/tempo` exports PascalCase modules from its root, exposes lowercase action collections such as `import * as actions from 'viem/tempo/actions'`, and does not export a root `Actions` module.
- **Extension modules get PascalCase subpaths** -- every PascalCase module exported from a remaining extension root gets a matching PascalCase subpath.
- **Experimental root is removed** -- v3 removes the `viem/experimental` entrypoint instead of carrying an experimental namespace forward.
- **Removed experimental modules** -- v3 removes the experimental ERC-7739, ERC-7715, ERC-7811, ERC-7821, and ERC-7895 modules.
- **ERC-7846 folds into wallet actions** -- review the ERC-7846 API before migration, then stabilize it under `actions.wallet` and `client.wallet` instead of creating a new entrypoint.
- **No runtime compatibility shims** -- do not add `viem/compat` or public compatibility aliases for removed v2 APIs. Migration process notes belong in `AGENTS.md` and human docs; landed API reference belongs in `.agents/skills/viem-v3-migration`.
- **Deprecations are removed in v3** -- resolve `@deprecated` exports, aliases, entrypoints, and v3 TODO compatibility paths instead of carrying them forward.

## Viem v3 Migration Conventions

- **Reference, not workflow** -- `.agents/skills/viem-v3-migration` is a consumer and agent API reference for landed v3 surfaces. Do not turn it into a step-by-step migration guide.
- **Document only landed rewrites** -- add to the migration reference only after the module has been rewritten and exported in v3. Do not add future mappings from the plan.
- **Migration notes live here** -- repo workflow guidance, compatibility policy, and migration process notes belong in `AGENTS.md`, not in the skill.
- **No automatic rewrites by default** -- do not rewrite consumer code or add codemods unless the project owner explicitly asks for that.
- **Migration batches stay small** -- when helping a consumer move to v3 APIs, prefer small typechecked batches and run the consuming project's tests/typecheck.
- **Hard break** -- v3 does not ship runtime compatibility shims for removed v2 APIs.

## Project Shape

- **Pure ESM package** -- viem v3 is a pure ESM package built with Zile.
- **Root package manifest** -- root `package.json` is the package manifest. Do not add package manifests under `src/**`.
- **Build output in `dist`** -- build output belongs in `dist/`. Do not reintroduce `_cjs`, `_esm`, or `_types` output trees.
- **Source is not a workspace package** -- treat `src` as source code, not as a nested workspace package.
- **Generated exports** -- `scripts/exports:update.ts` derives `package.json#exports` from `src/` entrypoints.

## RPC And Formatter Conventions

- **Directional RPC conversion names** -- use `fromRpc` for inbound RPC data and `toRpc` for outbound RPC payloads.
- **Formatter property name stays `formatters`** -- keep public chain configuration under `chain.formatters`, but formatter entries should expose `fromRpc` and `toRpc`.
- **Chain-specific deltas only** -- remaining formatter overrides such as Tempo should express only chain-specific RPC deltas.
- **Prefer Ox conversion modules** -- use Ox modules for ABI, address, bytes, hex, hash, signature, transaction, typed-data, RPC, and value behavior where Ox has coverage.

## Documentation Conventions

- **TSDoc on public exports** -- every exported public function, type, and constant gets a TSDoc comment. Type properties get TSDoc when they are part of the public surface.
- **Mirror Ox JSDoc for Ox-backed APIs** -- when viem wraps an Ox API, keep the public JSDoc symmetric with the upstream Ox function: same description shape, examples, parameter docs, and return docs, adapted only for `viem` imports and intentional viem behavior differences.
- **Doc-driven API changes** -- write or update the TSDoc before or alongside the implementation, not as an afterthought.
- **Examples should be small** -- public examples should show the minimum useful shape and avoid unrelated setup.
- **Source docs first** -- public API documentation usually belongs in TSDoc near the exported source.
- **Site pages** -- human guides live under `site/pages/`.
- **Generated docs** -- generated docs and generated site output should not be edited by hand unless explicitly requested.

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
- **Target the relevant project** -- prefer `pnpm test --project core --bail=1` or another focused project command over the full matrix while iterating.
- **Colocate tests** -- unit tests live beside their modules. For new Ox-style modules, prefer `src/**/_test/*.test.ts`; keep existing viem test locations unless the module is being moved.
- **Do not test exact proxies** -- do not add unit or type tests for modules that only re-export an Ox module, such as `export * from 'ox/Hex'`. Cover their availability through entrypoint export snapshots and rely on Ox for behavior/type coverage. Add viem tests only once viem adds wrapping, defaults, errors, or other behavior.
- **Wrap function exports in `describe`** -- every unit and type test file targets one or more exported functions; each function gets its own `describe('functionName', () => { ... })` block. Index export snapshot tests stay top-level and do not use `describe('index', ...)`.
- **Prefix test cases by category** -- every `test(...)` name starts with a category prefix such as `behavior:`, `types:`, `exports:`, or `regression:` so the intent is clear in runner output.
- **Inline snapshots over direct assertions** -- prefer `toMatchInlineSnapshot()` over `.toBe()`, `.toEqual()`, etc. for stable return values. Use `toThrowErrorMatchingInlineSnapshot()` for error assertions.
- **Snapshot whole objects, omit nondeterministic properties** -- destructure out nondeterministic fields and snapshot the rest, rather than cherry-picking individual fields to assert.
- **Fuzz regressions become deterministic** -- when a property fails, add the minimized case as a regular `*.test.ts` or vector fixture.
- **Vectors use Bun** -- run vector tests with `pnpm vectors`.
- **Unit and type tests as you go** -- write unit tests and `.test-d.ts` type tests alongside implementation for each public behavior change.
- **Export snapshots for public entrypoints** -- add or update export snapshot tests when changing root or subpath public exports.

## Workflow Conventions

- **Use targeted commands** -- prefer the smallest command that covers the touched behavior.
- **Types** -- run `pnpm check:types` or a focused `tsc` command after TypeScript changes.
- **Package shape** -- run `pnpm build` when package metadata, exports, or build output changes.
- **Docs dev server** -- use `pnpm docs:dev` for documentation UI work.
- **`pnpm check` mutates** -- it runs `vp check --fix` using root `vite.config.ts`. Use it only when intentionally applying lint/format fixes.
- **Vite+ owns test/lint/format config** -- keep test, lint, and format settings in root `vite.config.ts`; do not reintroduce `test/vitest.config.ts` or `biome.json`.
- **Vite+ is aliased as `vp`** -- keep the package dependency under the `vp` alias. Import config helpers from `vp` and test helpers from `vp/test`.
- **`pnpm exports:update` mutates** -- it rewrites `package.json#exports`.
- **`pnpm build` mutates** -- it emits `dist/` and refreshes generated exports.
- **Install hooks can mutate** -- `pnpm install` runs `postinstall`, which initializes submodules and builds contracts.

## Changeset Conventions

- **Changesets only for public behavior** -- add or update a changeset when a change affects public API or existing behavior.
- **Update existing changesets first** -- if the branch already has a changeset for the same area, update it instead of adding a duplicate.
- **One sentence, past tense** -- changeset entries are a single sentence written in past tense.
- **Breaking changes include migration shape** -- major changes include a `diff` fence showing the before/after migration shape.

## Git Conventions

- **Conventional commits** -- use `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:` prefixes. Scope is optional (e.g. `feat(abi): add tuple formatter`).
- **Preserve dirty work** -- do not revert, clean, or overwrite existing local changes unless explicitly asked.

## Learned Workspace Facts

- **Source layout** -- source lives in `src/`; docs live in `site`; v3 test scaffolding lives in `test`; legacy v2 test references live in `test-old`; vectors live in `vectors`; contracts live in `contracts`.
- **Node and pnpm** -- the repo currently expects Node.js `>=24.5` and `pnpm@10.33.2`.
- **Generated exports** -- `scripts/exports:update.ts` derives `package.json#exports` from `src/`. It maps top-level `src/<entry>/index.ts`, selected nested entrypoints, and PascalCase module files.
- **Script layout** -- active v3 scripts live in `scripts/`; legacy v2 scripts live in `scripts-old/` for reference only.
- **Tempo instructions are scoped** -- Tempo-specific action-generation guidance lives in `src/tempo/AGENTS.md`.
- **Migration reference** -- v3 consumer and agent API reference lives in `.agents/skills/viem-v3-migration/`.
- **Contracts submodule** -- contract dependencies may involve submodules. Treat submodule status changes as user work unless the task is specifically about contracts setup.
- **Secrets are local** -- `.env` is local. Do not print, rewrite, or commit secrets.
