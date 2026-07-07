# Viem v3 Migration Notes

This file contains temporary migration notes for the v3 rewrite. Read it alongside `AGENTS.md`
when porting or reshaping v2 surface area.

## Source Boundaries

- **Clean slate**; the old sources live under `src-old/` and `test-old/`.
  - `src-old/` is a snapshot of upstream `wevm/viem` **main @ v2.54.6** (`8cebc26d3`, refreshed
    2026-07-07 from `origin/main`), not the original v2 freeze. It is the parity baseline and
    includes later-landed features (e.g. `viem/tokens`, the `token` action namespace, the
    `tokens` Client option, new chains, tempo `Client`/`Scopes`/`Selectors`, storage credits,
    client-less token `.call` builders).
  - `test-old/`, `contracts-old/`, and `site-old/` are snapshots of the same commit's `test/`,
    `contracts/`, and `site/` — refresh all four together.
  - Use them only for reference and test-porting source.
  - Never edit them.
  - Never import from them in committed code (one-shot parity scripts may, see below).
  - The `-old` dirs are excluded from the v3 typecheck/test/lint configs; they never affect the build.
  - To refresh again:
    `for p in src test contracts site; do rm -rf $p-old && mkdir $p-old && git archive origin/main:$p | tar -x -C $p-old; done`,
    then port upstream deltas touching already-migrated v3 modules in the same pass.
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
- **Mark dependency-blocked test ports as `test.todo`**; when a v2 test case cannot be ported
  yet because something it needs has not landed (a later module, the entrypoint, the node
  harness), add a `test.todo('<v2 case name>')` to the closest v3 suite with a comment naming
  the missing dependency (not a plan-phase label).
  - This keeps deferred parity visible in the test run itself, not only in the plan.
  - Resolve (or relocate) each todo when its dependency lands; a finished module has zero
    stale todos.
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

## Tempo / ox Learnings (W4)

- **ox ≥ beta.13 `Signature` uses hex `r`/`s`**; `src-old`'s signed-serialization paths
  (`BigInt(...)` conversions) cannot execute against current ox. Generate v2 parity vectors for
  unsigned/presign forms only; validate signed structure at the ox level (deserialize
  round-trips, address recovery).
- **ox ≥ beta.14 owns the tempo request wire surface**: `keyId`/`multisigInit`/
  `multisigSignatureCount`/`capabilities` fields, `keyType`/`keyData`/`feePayer` carriage, the
  key-data length-hint shim, TIP-1 feeToken withholding, zero-address call defaulting, and the
  `toEnvelope` fee-payer presign marker. viem's `tempo/chainConfig.ts` codec is a thin adapter
  (client-only fields: Account `feePayer`, `multisig`/`signatures`, `nonceKey: 'expiring'`);
  do not re-add wire logic viem-side.
- **"TIP-76" is not a TIP**; the fee-payer/gas-sponsorship mechanism is specified in TIP-1
  ("Tempo Transaction", type byte `0x76`). Cite TIP-1 in comments.
- **`ghcr.io/tempoxyz/tempo:latest` has no multisig (`0x05`) envelope decode**; multisig e2e is
  gated behind `VITE_TEMPO_MULTISIG` (v2 gated identically). Testcontainers does not re-pull
  `latest` — `docker pull ghcr.io/tempoxyz/tempo:latest` when node behavior looks stale.
- **Copy `.env` from the root viem checkout** (`~/git/viem/.env`) for a keyed
  `VITE_ANVIL_FORK_URL`; the drpc.org default rate-limits under repeated fork cold-starts
  (mass 5s-timeout cascades). Ports 8545/8645 may be held by a local tempo container — override
  with `VITE_ANVIL_PORT`/`VITE_ANVIL_PORT_LOCAL`.
- **Tempo node estimation caps gas by sender balance when fee fields are present** — even with
  `feePayer: true` (node-side gap; sponsored senders capped by their own empty balance). Core
  `prepare` omits self-derived fees from its internal estimate; direct `estimateGas` calls with
  explicit fees surface the node error by design.
