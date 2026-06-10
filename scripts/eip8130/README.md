# EIP-8130 manual scripts

Temporary dev/integration scripts for the experimental EIP-8130 work in
`src/experimental/eip8130`. These are **not** public examples (see top-level
`examples/` for those) — they import local source (`../../src`) and most hit a
live testnet. Keep them here until EIP-8130 graduates from experimental.

## Run

```bash
# offline, no setup
npx vitest run --config test/vitest.eip8130.config.ts scripts/eip8130/build8130Transaction.test.ts

# network scripts (skipped unless PRIVATE_KEY is set; funded Base Sepolia EOA)
PRIVATE_KEY=0x... npx vitest run --config test/vitest.eip8130.config.ts scripts/eip8130/<name>.test.ts
```

All scripts are auto-included via the `scripts/eip8130/**/*.test.ts` glob in
`test/vitest.eip8130.config.ts` — just drop a new `*.test.ts` here.

Env: `PRIVATE_KEY` (required for network scripts), `BASE_SEPOLIA_RPC`,
`BUNDLER_URL`, `SALT_LABEL` (all optional, with defaults).

## Scripts

| Script | Network? | What it does |
| --- | --- | --- |
| `build8130Transaction` | no | Build/sign/serialize/parse an 8130 tx; prints JSON, RLP envelope, and the 13-field wire layout. |
| `setup8130Account` | yes | Create an 8130 account on Base Sepolia. |
| `authorizeSessionKey` | yes | Authorize a session-key actor on an existing account. |
| `selfBundleCreate` | yes | Deploy + execute in one self-bundled userOp via `EntryPoint.handleOps` (no staking). |
| `selfBundleRotateP256` | yes | Create + validation-phase P-256 key rotation + execute in one userOp. |
| `bundlerCreateAndExecute` | yes | Create + execute through a real ERC-4337 bundler (`BUNDLER_URL`). |
| `bundlerProbeDeployed` | yes | Send a userOp to an already-deployed account (no factory phase). |

## Notes

- An 8130 call is only `{ to, data }` — there is no per-call `value`.
- Validation-phase signature (key rotation) is
  `abi.encode(magic, SignedActorChanges[], bytes opAuth)`; `opAuth` authorizes the
  op over `userOpHash`. See `encodeSignedActorChangesSignature`.
- `createAccount` seeds `localSequence = 1`, so the first `applySignedActorChanges`
  on a fresh account signs over sequence `1`.
- Deployment addresses live in `src/experimental/eip8130/deployments.ts`.
