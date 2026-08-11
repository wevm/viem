# EIP-8130 manual scripts

Runnable dev/integration demonstrations for the EIP-8130 (`viem/eip8130`) and
ERC-8168 (`viem/eip8168`) modules. They import local source
(`../../src/eip8130`, `../../src/eip8168`) so they exercise the code in this
repo directly; most hit a live testnet (skipped unless `PRIVATE_KEY` is set).
For copy-paste usage docs see `site/pages/eip8130/`.

## Run

```bash
# offline, no setup
npx vitest run --config test/vitest.eip8130.config.ts scripts/eip8130/buildTransaction.test.ts

# network scripts (skipped unless PRIVATE_KEY is set; funded Base Sepolia EOA)
PRIVATE_KEY=0x... npx vitest run --config test/vitest.eip8130.config.ts scripts/eip8130/<name>.test.ts

# hosted vibenet policy smoke (sponsored; no PRIVATE_KEY required)
npx vitest run --config test/vitest.eip8130.config.ts scripts/eip8130/policySmoke.test.ts
```

All scripts are auto-included via the `scripts/eip8130/**/*.test.ts` glob in
`test/vitest.eip8130.config.ts` — just drop a new `*.test.ts` here.

Env: `PRIVATE_KEY` (required for network scripts), `BASE_SEPOLIA_RPC`,
`BUNDLER_URL`, `SALT_LABEL`. `baseSepolia4337E2E` requires `BUNDLER_URL` with no
default so no bundler credential is committed; do not hardcode API keys in these
scripts.

## Scripts

| Script | Network? | What it does |
| --- | --- | --- |
| `buildTransaction` | no | Build/sign/serialize/parse an 8130 tx; prints JSON, RLP envelope, and the 13-field wire layout. |
| `setupAccount` | yes | Create an 8130 account on Base Sepolia. |
| `authorizeSessionKey` | yes | Authorize a session-key actor on an existing account. |
| `selfBundleCreate` | yes | Deploy + execute in one self-bundled userOp via `EntryPoint.handleOps` (no staking). |
| `selfBundleRotateP256` | yes | Create + validation-phase P-256 key rotation + execute in one userOp. |
| `bundlerCreateAndExecute` | yes | Create + execute through a real ERC-4337 bundler (`BUNDLER_URL`). |
| `bundlerProbeDeployed` | yes | Send a userOp to an already-deployed account (no factory phase). |
| `baseSepolia4337E2E` | yes | Full ERC-4337 e2e on Base Sepolia: create + execute, a follow-up userOp, then authorize/revoke an actor via `applySignedActorChanges`. Requires `PRIVATE_KEY` **and** `BUNDLER_URL`. |
| `policySmoke` | yes (hosted vibenet) | Sponsored session-key + policy smoke: create → authorize manager+session → `Counter.increment` via PolicyManager. No `PRIVATE_KEY` needed. |

## Notes

- An 8130 call is only `{ to, data }` — there is no per-call `value`.
- Validation-phase signature (key rotation) is
  `abi.encode(magic, SignedActorChanges[], bytes opAuth)`; `opAuth` authorizes the
  op over `userOpHash`. See `encodeSignedActorChangesSignature`.
- `createAccount` seeds `localSequence = 1`, so the first `applySignedActorChanges`
  on a fresh account signs over sequence `1`.
- Deployment addresses live in `src/eip8130/deployments.ts`.
