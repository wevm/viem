# Viem v3 Agent Evals on Harbor

Plan for an agent-eval harness built on [Harbor](https://www.harborframework.com) (Terminal-Bench team, Apache-2.0, local Docker). Agents (claude-code, codex, gemini-cli, ...) solve viem v3 tasks inside sandboxed containers; verifiers grade against live nodes.

## Decisions

- Fresh start off latest `v3` in the main checkout. The `jxom/evals` worktree is not migrated; its content (3 pilot tasks, package logic, and prompt/grader authoring rules) is copied over selectively as reference.
- Per-page task grouping: one task per docs page/topic, distilled to its most meaningful use case(s), not one task per recipe. Target ~120-150 tasks at full build-out.
- Forked anvil is the default EVM runtime (pinned block). Forks are fully writable (impersonation, cheatcodes, sends), so write flows run against real mainnet state.
- Packed tarball self-reports version `3.0.0` (pack step rewrites the `2.52.x` field).
- v2-emission detection is a secondary reward metric, not the pass/fail gate.

## Packaging Viem for Agents

Tarball, not symlink:

1. `pnpm build && pnpm pack` from the repo root produces `viem.tgz` with the published package and root skill.
2. Pack step rewrites `version` to `3.0.0`, strips workspace lifecycle scripts, and copies the packaged skill into Harbor's artifact layout.
3. The base image installs `viem.tgz` into a fixture project. Docker layer caching makes repacks cheap.

Why not a symlink/mount to `dist/` (including via pnpm):

- A bare `dist/` symlink cannot work even with pnpm: `dist/` contains no manifest (zile leaves `package.json` at the repo root), and the exports map is required for subpath resolution (`viem/tempo`, `viem/utils`, ...). Any link target must be the package root.
- pnpm `link:<repo>` does no install: viem's runtime deps (`ox`, `abitype`) only resolve through the repo's own workspace `node_modules`, so the full workspace install must exist at the target; tests and workspace deps become visible.
- pnpm `file:<repo>` installs deps but runs the repo lifecycle scripts (`preinstall: only-allow pnpm`, `postinstall: pnpm dev`) that break outside the workspace; packing strips them.
- The container is the decider: no host path exists inside the image, so "symlink" degenerates into copying the package dir into the image and linking to it. Same plumbing as `COPY viem.tgz`, minus pack's guarantees, and a bind-mount variant couples live trials to host state.
- `npm install ./viem.tgz` is byte-for-byte what a real user gets. That is the point of the eval. The extra cost over linking is one `pnpm pack` (seconds, layer-cached).

For authoring DX only (editing solutions/EVAL tests in-editor), a tsconfig path alias to `../../src` is fine, as the old worktree did. The graded environment always installs the tarball.

## Layout

```
SKILL.md                 # canonical Viem skill, also published in the package
evals/
  README.md               # anatomy + authoring rules (ported from worktree)
  base/
    Dockerfile            # node:22-bookworm + viem.tgz preinstalled fixture template
    anvil/Dockerfile      # foundry image + prewarmed fork cache layer
  mcp/viem.json           # Viem MCP server configuration for agent runs
  tasks/<area>-<slug>/    # one Harbor task per docs page/topic
    instruction.md        # problem-statement prompt; never names target APIs
    task.toml             # timeouts, metadata (area, source page, tier)
    environment/          # Dockerfile or docker-compose.yaml (sidecars)
    solution/solve.sh     # copies committed solution files into place
    tests/
      test.sh             # build + vitest + idiom scan -> /logs/verifier/reward.json
      EVAL.ts             # runtime assertions against the sidecar node
  lib/                    # Tarball.ts (pack pipeline), scaffolder
  scripts/                # pack-viem.ts, new-task.ts, export-results.ts
  metric.py               # per-area pass rates + v2-leak rate aggregation
  jobs/                   # gitignored harbor output
```

A local Harbor dataset is just a directory of task dirs: `harbor run -p evals/tasks ...`.

## Environment Tiers

| Tier | Runtime | Tasks (approx) | Notes |
| --- | --- | --- | --- |
| offline | none (`network_mode` open for agent API only) | ~10 | HD derivation, blobs encoding, ABI/envelope round-trips, signatures |
| anvil-fork | compose sidecar: anvil forking mainnet at pinned block | ~60 | default tier; reads AND writes (impersonation, USDC transfers, ENS, multicall, 7702 with prague); dev-account 7702 code cleared at boot |
| tempo | compose sidecar: tempo node container (amd64) | ~25 | tokens, access keys, DEX/AMM, channels, policies, multisig |

Dropped per maintainer decision (2026-07-22): erc4337 (Alto bundler) and op-stack tiers.

- Sidecars are defined per-task in `environment/docker-compose.yaml`; the agent lives in the auto-configured `main` service and reaches nodes by hostname (`http://anvil:8545`). Readiness via compose `healthcheck` + `depends_on: service_healthy`.
- Fork determinism and upstream protection: pin the fork block; bake a prewarmed `~/.foundry/cache` into the anvil sidecar image (build step boots anvil and touches the state used by tasks) so trials rarely hit the upstream RPC. Fork URL passes through `[environment].env = { EVALS_FORK_URL = "${EVALS_FORK_URL}" }`.
- Deferred: EIP-1193 wallet-shim tasks (connect/sendCalls/capabilities), tempo zones + accounts SDK (hosted services), WebAuthn/browser tasks.

## Verification Contract

`tests/test.sh` writes `/logs/verifier/reward.json` with named metrics:

- `build` (0/1): `npm run build` (`tsc --noEmit`) in the fixture against the installed tarball. Primary gate; v3 ships no legacy entrypoints, so nearly all v2-shaped code already fails here.
- `runtime` (0/1): `vitest run` on `tests/EVAL.ts` (copied in at verify time, structurally hidden from the agent) asserting observable state on the sidecar: balance deltas, `receipt.status`, decoded logs, reverts.
- `v3_idioms` (0/1): grep deny-list over the agent's source: `create(Public|Wallet|Test)Client`, `from 'viem/(actions|accounts|account-abstraction|experimental|celo|zksync|linea|ens|siwe|nonce)'`, `\bparseEther\b`, `getContract\(`, `rpcUrls\.default`, `onBlock:`, `instanceof BaseError`, `contracts:` near `multicall`.
- `reward` = `build && runtime`. `v3_idioms` reports separately and aggregates as a v2-leak rate in `metric.py`.

Task self-validation replaces `verify-solutions.ts`:

- `harbor run -p <task> -a oracle` must score 1 (runs `solution/solve.sh`).
- `harbor run -p <task> -a nop` must score 0.
- Wrong-answer fixtures from the worktree become oracle-style negative checks where they add value (v2-shaped solution must fail `build`).

## Task Inventory

Selection: from the guides audit (235 doc entries, ~408 recipes) and API-surface audit (~80 use cases, ~25 uncovered by guides), grouped per page with multi-assert verifiers.

| Area | Source | Tasks (target) |
| --- | --- | --- |
| core docs (accounts, chains, clients, transports, errors, actions) | `site/pages/docs/**` | ~30 |
| guides (transactions, contracts, blocks/events, chain-data, wallets, testing, extending, authorizations) | `site/pages/docs/guides/**` | ~40 |
| tempo | `site/pages/tempo/**` | ~30 |
| tokens | `site/pages/tokens/**` | ~8 |
| erc4337 | `site/pages/account-abstraction/**` | ~8 |
| op-stack | `site/pages/op-stack/**` | ~4 |
| API-gap composed workflows (fee-bump cancel, CREATE2 predict+deploy, sync send family, access-key lifecycle, sponsored userOps, ERC-6492 verify, ...) | API audit | ~20 |
| migration + traps (v2 file/app migration, watcher-handle misuse, multicall shape, bigint scalars, object-vs-tuple reads) | worktree pilots + divergence audit | ~8 |

## Phases

1. **Bootstrap.** Install harbor (`uv tool install harbor`). Port `Tarball.pack` (add version rewrite to `3.0.0`). Build base + anvil-fork images. Scaffolder (`scripts/new-task.ts`). Port the 3 pilot tasks into Harbor format. Oracle green + nop red on all three; one live `claude-code` trial end-to-end.
2. **Core coverage.** Guides + core docs tasks on the anvil-fork tier, plus the offline set. Oracle/nop gate on every task.
3. **Tempo + tokens.** Tempo sidecar image (ghcr auth), tempo/token tasks.
4. **erc4337 + op-stack + composed.** Alto sidecar, op-stack fork pair, API-gap workflows, migration/trap set.
5. **Experiments + CI.** Baseline vs MCP-backed packaged-skill jobs (`--skill evals/.artifacts/skills/viem --mcp-config evals/mcp/viem.json`); `metric.py` aggregation; GitHub Action: oracle+nop on changed tasks per PR, workflow_dispatch full runs (`ANTHROPIC_API_KEY` secret, `-y` for env approval); `export-results.ts` over `jobs/**/result.json`.

## Running

```bash
harbor run -p evals/tasks -a oracle -n 8                       # validate tasks
harbor run -p evals/tasks -a claude-code \
  -m anthropic/claude-opus-4-8 -n 4 -k 4                       # eval run, pass@4
harbor view jobs                                               # results UI
```

## Risks / Open Items

- Fork upstream rate limits on cold cache: mitigated by the prewarmed cache layer; keep `-n` modest for fork-heavy runs.
- Tempo sidecar image pulls from ghcr (auth needed, same as the test suite).
- Alto bundler sidecar needs its own image (test harness boots it via prool; containerize equivalently).
- Agent network policy: default `public` (agents need their provider API). Later experiment: `allowlist` restricted to provider hosts + sidecars to eliminate doc-browsing as a variable.
- Harbor is a Python dev tool only (`uv tool install harbor`); nothing enters the pnpm workspace.
- Compose-based tasks constrain cloud `--env` providers; local Docker is the assumed runner.
