# Authoring Eval Tasks

The complete guide to writing a Harbor task for this suite. Follow it exactly;
tasks that deviate get rejected in review.

## Layout and Naming

One task = one directory `evals/tasks/<area>-<slug>/`. Areas: `core-`,
`guides-`, `tokens-`, `tempo-`, `gap-`, `migration-`, `trap-`.

```
evals/tasks/<area>-<slug>/
  instruction.md                       # prompt shown to the agent
  task.toml                            # config + metadata
  environment/
    Dockerfile                         # always: FROM viem-evals-base + COPY fixture/ /app/
    docker-compose.yaml                # sidecar (omit entirely for offline tier)
    fixture/                           # the project the agent works in
      package.json
      tsconfig.json
      src/index.ts                     # blank entry point (or legacy migration code)
  solution/
    solve.sh                           # copies solution files over /app
    src/index.ts                       # reference answer (v3-idiomatic; it is graded too)
  tests/
    test.sh                            # verifier script (copy the template verbatim)
    EVAL.ts                            # hidden runtime grader
```

Copy `evals/tasks/core-read-block-number/` as the starting point and modify.

## task.toml

```toml
schema_version = "1.4"

[task]
name = "viem/<area>-<slug>"
version = "1.0.0"
description = "<one line>"

[metadata]
area = "<area>"
tier = "offline" # or "anvil-fork" | "tempo"

[verifier]
timeout_sec = 300.0   # tempo: 900.0

[agent]
timeout_sec = 900.0   # tempo: 1200.0

[environment]
build_timeout_sec = 1200.0
cpus = 2
memory_mb = 4096
storage_mb = 10240
```

## Tiers

- **offline**: no sidecar. Delete `docker-compose.yaml`. For pure computation:
  accounts/HD derivation, ABI encoding, envelope round trips, signatures.
- **anvil-fork**: copy `evals/base/templates/compose-anvil.yaml` to
  `environment/docker-compose.yaml` verbatim. Node at `http://anvil:8545`.
- **tempo**: copy `evals/base/templates/compose-tempo.yaml` verbatim. Node at
  `http://tempo:8545`. Runs amd64-emulated locally: use the higher timeouts.

## The anvil-fork Environment

Anvil forking Ethereum mainnet at block `24_000_000`, chain id 1, hardfork
Prague, automine ON. Use `mainnet` from `viem/chains`.

- Dev accounts (10, each 10000 ETH, EIP-7702 code cleared at boot):
  - `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` key `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
  - `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` key `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
  - `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` key `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
  - `0x90F79bf6EB2c4f870365E785982E1f101E93b906` key `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
- All real mainnet state at the pinned block is available: USDC at
  `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (Binance 14
  `0x28C6c06298d514Db089934071355E5743bf21d60` holds `31872448355` base units),
  ENS, Multicall3, the deterministic CREATE2 deployer
  (`0x4e59b44847b379578588920ca78fbf26c0b4956c`), EntryPoints, etc.
- Anvil cheatcodes work: `anvil_impersonateAccount`, `anvil_setBalance`,
  `anvil_setCode`, `anvil_setStorageAt`, `evm_snapshot`/`evm_revert`,
  `anvil_mine`, `anvil_setAutomine`, ...
- NEVER use other well-known public addresses as transfer recipients without
  checking `eth_getCode` is `0x` at block 24000000 (7702 sweeper delegations).
  The dev accounts above are safe (code cleared at boot).

## The tempo Environment

Tempo localnet (chain id 1337), 50ms blocks. Use
`import { tempoLocalnet } from 'viem/chains'` and the `viem/tempo` entrypoint:

```ts
import { Account, Client, http } from 'viem/tempo'
import { tempoLocalnet } from 'viem/chains'

const client = Client.create({
  account: Account.fromSecp256k1('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http('http://tempo:8545'),
})
```

- Same dev mnemonic/accounts as anvil. Genesis TIP-20 tokens: pathUSD
  `0x20c0000000000000000000000000000000000000`, AlphaUSD
  `0x20c0000000000000000000000000000000000001` (both 6 decimals, currency USD).
- A faucet funds those token balances; `Actions.faucet.fund` also works.
- Fee-token validity requires fee-AMM liquidity. Mirror
  `test/src/tempo.ts` `mintLiquidity` (fee AMM at
  `0xfeec000000000000000000000000000000000000`) when a task pays fees in a
  non-pathUSD token.
- Before writing ANY tempo task, read the matching real tests under
  `src/tempo/actions/**/**.test.ts` in this repo and mirror their call shapes
  (sync actions like `token.transferSync`, `nonceKey` usage, `feeToken`).
- Proven patterns (from the validated `tempo-transfer-tokens` reference task):
  - Token amounts on a client WITHOUT declared `tokens` need explicit
    decimals: `amount: { decimals: 6, formatted: '10.5' }` (bare `formatted`
    throws "Token decimals are required").
  - Dev account 0 holds faucet-seeded pathUSD at boot. Defensive funding:
    raw-RPC `tempo_fundAddress` grants 1,000,000 pathUSD (poll `balanceOf`
    afterwards).
  - Graders accept `receipt.status` of `'success'` or `'0x1'`.
  - Fast pre-check before paying for a harbor cycle: typecheck your solution
    in a `/tmp` scratch project against `evals/base/viem.tgz`
    (`"viem": "file:<abs>/evals/base/viem.tgz"` + the fixture tsconfig).
  - Transient docker failures (network pool exhaustion, build EOF) are
    host-level; verify `docker network create` works, then retry once.

## instruction.md Rules

- Problem-statement style: describe the user-facing goal, never name the
  target viem API, namespace, or action in the prompt or fixture comments.
- State where the node is: "An Ethereum mainnet RPC endpoint is available at
  `http://anvil:8545`." (tempo: "A Tempo RPC endpoint is available at
  `http://tempo:8545`.")
- State the contract: which file to implement, exact exported function
  name(s), behavioral inputs and outputs, "Use the `viem` library already
  installed in this project", "Do not add any new dependencies", "When you
  are done, `npm run build` must pass."
- Describe inputs and outputs in prose. Do not provide TypeScript declarations,
  aliases, interfaces, generic parameters, or references to starter types. The
  agent owns the public type design and must preserve ABI-derived inference.
- Use `address` for recovered identities and `account` for signing capability.
  Apply this terminology consistently across eval-owned prose, identifiers,
  and API names.
- Client-using operations receive a client as their first positional input.
  Describe all remaining inputs as one named options object. Solutions use
  `Client.Client` unless a configured client generic is type-significant.
- Migration tasks instead ship broken legacy code and ask to make the build
  pass without changing exported names, signatures, or behavior.

## Fixture Rules

- `package.json`: copy from the reference task; change only `"name"`. The
  dependency set MUST stay exactly `viem: file:/opt/viem-3.0.0.tgz`,
  `typescript: ^5.9.2`, `vitest: ^3.2.4` (preinstalled in the base image).
- `tsconfig.json`: copy verbatim (strict, nodenext, noEmit, include src).
- Feature-task entry points contain only `// TODO(agent): implement`. They must
  not declare functions or types. Migration tasks keep their broken legacy code.
- Functions should take their inputs (addresses, amounts) as parameters so the
  grader can exercise them against fresh state.
- Create clients in the grader at module scope and pass them into operations.
  Never require an operation to construct its own client.
- Pure operations take one named options object. The only ordinary positional
  parameter is an injected client.

## Verifier Rules

`tests/test.sh`: copy from `evals/tasks/core-read-block-number/tests/test.sh`
VERBATIM. Do not edit the deny list or reward wiring.

`tests/EVAL.ts` (vitest; copied to `/app/__eval__/index.test.ts` at verify
time, invisible to the agent while it works):

- The verifier typechecks this file under strict TypeScript settings before
  running it. Calls and `expectTypeOf` assertions define the hidden public type
  contract without exposing declarations in the challenge.
- Exercise ABI-derived inputs and outputs without `any` casts. Add negative
  `@ts-expect-error` cases where a generic must reject invalid names or args.

- Import the agent's exports via `import { fn } from '../src/index.ts'`.
- Prefer RUNTIME assertions on observable chain state: balance deltas,
  `receipt.status === 'success'`, decoded log args, reverts, pinned fork
  values. Static source regexes are a last resort (keep the single
  "uses viem" import check).
- Assert chain state with a raw JSON-RPC helper (independent of viem):

  ```ts
  async function rpc(method: string, params: unknown[]) {
    const res = await fetch('http://anvil:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    const { result, error } = (await res.json()) as any
    if (error) throw new Error(error.message)
    return result
  }
  ```

- Test SETUP may do anything: deploy fixture contracts (bytecode from
  `contracts/generated.ts` in this repo, inlined into EVAL.ts), fund accounts
  with `anvil_setBalance`, move whale tokens via `anvil_impersonateAccount` +
  `eth_sendTransaction`, toggle `anvil_setAutomine`. Keep setup in the test
  body or `beforeAll`.
- Values must be deterministic: pinned block state, exact bigint deltas, or
  round-trip equalities. No wall-clock or ordering assumptions beyond automine.
- EVERY test and hook gets an explicit timeout (>= 60_000ms; 120_000 for
  deploy/write flows). The 5s vitest default fails under full-suite load.
- Raw fetch/JSON-RPC helpers retry transient network failures (3 attempts,
  ~500ms backoff; JSON-RPC-level errors rethrow immediately). Solutions doing
  many requests set `retryCount`/`retryDelay` on their http transport.
- No mocks. Ever.

## Solution Rules

- `solution/solve.sh`: `cp /solution/src/<file>.ts /app/src/<file>.ts` (bash,
  absolute paths).
- The solution must be idiomatic v3 (`Actions.*`, `Client.create` when client
  construction is under test, and `Value`/`Hex` from `viem/utils`) and never
  import `ox` directly. It runs through the same verifier and must score
  `v3_idioms: 1`.
- Client-using exports receive the client first and a named options object
  second. Type the parameter as `Client.Client` unless its configured generics
  are type-significant. Client construction belongs at module scope only when
  client configuration is the behavior under test.

## Validate Before You Finish

From the repo root, with your task at `evals/tasks/<id>`:

```sh
harbor run -p /Users/jxom/git/viem/evals/tasks/<id> -a oracle -o /tmp/evals-validate --job-name oracle-<id> -y
node evals/scripts/check-job.mjs /tmp/evals-validate/oracle-<id> 1

harbor run -p /Users/jxom/git/viem/evals/tasks/<id> -a nop -o /tmp/evals-validate --job-name nop-<id> -y
node evals/scripts/check-job.mjs /tmp/evals-validate/nop-<id> 0
```

Both must pass. On failure, read
`/tmp/evals-validate/<job>/<trial>/verifier/{build,vitest,idioms}.log` and
`result.json`, fix, and re-run. A task that cannot pass oracle or cannot fail
nop is broken; fix the task, never weaken the grader.

## Do Not

- Do not modify anything outside your task directory (no edits to
  `evals/base/`, `evals/scripts/`, other tasks, `prewarm.sh`, READMEs).
- Do not name target APIs in instructions or fixture comments.
- Do not use LLM judges, network services beyond the sidecars, or mocks.
- Do not weaken `test.sh` or skip validation.
- If your EVAL reads mainnet fork state beyond USDC/ENS basics, note the
  contract addresses and calls in your final report as `prewarmNeeds` (the
  prewarm script is updated centrally; cold reads fall through to upstream in
  the meantime).
