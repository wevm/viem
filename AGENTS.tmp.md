# Viem v3 Migration Notes

This file contains temporary migration notes for the v3 rewrite. Read it alongside `AGENTS.md`
when porting or reshaping v2 surface area.

## Source Boundaries

- **Clean slate**; the old sources live under `src-old/` and `test-old/`.
  - `src-old/` is a snapshot of upstream `wevm/viem` **main @ v2.54.1** (refreshed 2026-06-30
    from `origin/main`), not the original v2 freeze. It is the parity baseline and now includes
    later-landed features (e.g. `viem/tokens`, the `token` action namespace, the `tokens` Client
    option, new chains, tempo `Client`/`Scopes`/`Selectors`).
  - Use them only for reference and test-porting source.
  - Never edit them.
  - Never import from them in committed code.
  - `src-old/` is excluded from the v3 typecheck/test/lint configs; it never affects the build.
  - To refresh again: `rm -rf src-old && mkdir src-old && git archive origin/main:src | tar -x -C src-old`.
  - The v3 tree grows fresh in `src/` and `test/`.
- **Parity tests are one-shot scaffolding**; delete `src-old/` comparison tests before commit.
  - Permanent tests are ports of old suites, adapted to the new API.
  - Do not commit permanent tests that compare against `src-old/`.

## Migration Process

- **API-first module reviews**; get signature-only API approval before implementing public modules.
  - For utils facades, review the curated export manifest.
  - The manifest decides surviving names, ox mappings, and deletions.
- **Check parity against the old implementation**; read the real old implementation before migrating.
  - Look under `src-old/` or existing `src/` code.
  - Reconcile field shapes, names, ordering, defaults, and behavior.
  - Record intentional divergences in the changeset.
  - Treat unintentional divergences as bugs.
  - Do not infer old behavior from memory.
- **Verify full v2 parity after each implementation batch**; before moving to the next batch, confirm both implementation and tests match v2.
  - Diff the v3 module against its `src-old/` counterpart for behavior and options.
  - Diff the v3 `*.test.ts` against the v2 `*.test.ts` and port every meaningful case (each account kind, every option/arg variant, error shapes).
  - Note any intentionally dropped cases (e.g. v2 `test.skip`) and why.
  - Only then continue to the next batch.
- **Drop `@deprecated` surface on migration**; do not carry over v2 deprecated surface.
  - This includes deprecated properties, options, parameters, and exports.
  - Port only the non-deprecated replacement.
  - Example: `chain.fees.defaultPriorityFee` becomes `chain.fees.maxPriorityFeePerGas`.
  - Record removals in the v3 breaking-change log.
- **Ox is the primitive layer**; prefer ox v1 modules over hand-rolled implementations.
  - Examples: `Hex`, `Bytes`, `Abi*`, `Address`, `Hash`, `Signature`, `Secp256k1`, `TxEnvelope*`.
  - Direct `@noble/*` and `@scure/*` usage is being removed.
  - Do not add new direct usage.

## Code Comments

- **No internal-tracking references**; code must read standalone.
  - Avoid planning phases, task IDs, and internal labels.
  - Examples: `C2`, `B6`, `D11`, "in a later phase", `TODO(C2)`.
  - A bare `TODO:` describing actual work is fine.
- **No prior-version references**; do not mention old names or migration framing.
  - Avoid phrases like "replaces old `formatters`" or "was `defineChain`".
  - Comments describe current behavior only.
  - Put parity and migration notes in the changeset.

## Breaking Changes

- **Log v3 breaking changes as you migrate a module**; compare against the v2 counterpart immediately.
  - Read the v2 surface under `src-old/`.
  - Record every breaking change in a `major` changeset.
  - Include renames, moved exports, removed exports, dropped entrypoints, and shape changes.
  - Add a `diff` fence for each migration shape.
  - Do this before finishing the module.
  - Use one changeset per area or module.
  - Update an existing area changeset instead of adding duplicates.
