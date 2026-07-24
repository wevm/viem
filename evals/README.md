# Viem Agent Evals

Agent coding evals for Viem, built on [Harbor](https://www.harborframework.com).
Each task drops a coding agent into a sandboxed fixture project (with a real
node as a sidecar) and grades the result deterministically. See
[evals-plan.md](../evals-plan.md) for the full design.

99 tasks across three tiers: offline (pure computation), anvil-fork (mainnet
fork pinned at block 24000000, writable), and tempo (local Tempo node).
Areas: `core-` (client/chain/account/transport/errors), `guides-` (docs guide
flows), `tokens-`, `tempo-`, `migration-`/`trap-` (v2-habit detectors), and
`gap-` (composed workflows no guide covers). Every task ships a reference
solution that must pass the grader (oracle) and an untouched fixture baseline
that must fail it (nop); CI enforces both on changed tasks.

## Prerequisites

- Docker running locally
- `uv tool install harbor`
- Node >= 22 and pnpm (to pack the viem tarball)

## Quickstart

```sh
node evals/scripts/pack-viem.mjs      # packs viem@3.0.0 and its MCP skill
node evals/scripts/build-images.mjs   # builds viem-evals-base + viem-evals-anvil
harbor run -p evals/tasks -a oracle   # every task must score 1
harbor run -p evals/tasks -a nop      # every task must score 0
harbor run -p evals/tasks -a claude-code -m anthropic/claude-opus-4-8 -n 4 -k 4
harbor run -p evals/tasks -a claude-code \
  --skill evals/.artifacts/skills/viem --mcp-config evals/mcp/viem.json
harbor view jobs                      # results UI
```

## Anatomy of a Task

```
evals/tasks/core-read-block-number/
  instruction.md      # problem-statement prompt; never names the target API
  task.toml           # timeouts + metadata (area, tier)
  environment/
    Dockerfile        # FROM viem-evals-base; overlays fixture/ onto /app
    docker-compose.yaml  # anvil mainnet-fork sidecar (http://anvil:8545)
    fixture/          # the project the agent works in
  solution/           # reference answer; `harbor run -a oracle` applies it
  tests/
    test.sh           # verifier: build + vitest + idiom scan -> reward.json
    EVAL.ts           # runtime assertions, hidden from the agent
```

## Verification Contract

`tests/test.sh` writes `/logs/verifier/reward.json` with named metrics:

- `build`: `tsc --noEmit` against the installed viem tarball.
- `types`: strict TypeScript checking of the hidden grader and the agent's
  inferred public API.
- `runtime`: `vitest run` on `EVAL.ts`, asserting observable state against the
  anvil fork (pinned block 24000000).
- `v3_idioms`: deny-list scan for stale v2 patterns. Secondary metric only.
- `reward` = `build && types && runtime`.

## Writing a New Task

See [AUTHORING.md](./AUTHORING.md) for the complete guide (templates, tiers,
environment facts, validation loop). Summary:

- Name it `<area>-<slug>` (`core-`, `guides-`, `tempo-`, `tokens-`, `gap-`,
  `migration-`, `trap-`).
- Feature tasks: the prompt describes the user-facing problem. Never name the
  target API in `instruction.md` or fixture comments.
- Migration tasks: the fixture ships real legacy code that fails the build;
  the prompt asks to make it compile without changing behavior.
- Prefer runtime assertions (balance deltas, receipt status, pinned fork
  values) over source regexes. Typecheck is the primary gate.
- Never use anvil's well-known dev accounts as transfer recipients: on real
  mainnet they carry EIP-7702 sweeper delegations, so forked transfers to them
  are swept within the same transaction. Sending from them is fine. Use
  history-free addresses (verify `eth_getCode` is `0x` at the pinned block).
- Every task must pass `harbor run -a oracle` and fail `harbor run -a nop`
  before it ships.

## Fork Determinism

The anvil sidecar image bakes a prewarmed `~/.foundry/cache` for the state
tasks touch (see `base/anvil/prewarm.sh`). When a new task reads new fork
state, add the corresponding `cast` calls to the prewarm script and rebuild,
so trials stay off the upstream RPC.
