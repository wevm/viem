Our compliance team needs a stablecoin whose transfers are restricted to an
approved list of accounts.

Implement three functions in `src/index.ts`:

- `setupGatedToken` receives a Tempo client carrying the admin account and
  sets up the restricted token from scratch:
  - Issue a new TIP-20 stablecoin (pick any name/symbol; currency `USD`)
    administered by that account.
  - Mint an initial supply of exactly 1,000 tokens (the token has 6 decimals,
    so 1,000,000,000 base units) to the admin account.
  - Create a whitelist transfer policy administered by the admin that initially
    approves only the admin account itself.
  - Activate that policy as the token's transfer policy.
  - Return an object with the token address under `token` and the policy id
    (as a bigint) under `policyId`.
- `addMember` receives a Tempo client carrying the admin account, approves
  `options.member` on `options.policyId`, and waits until the change is
  confirmed on chain.
- `transferGated` receives a Tempo client carrying the sender account and
  transfers `options.amount` base units of `options.token` to `options.to`,
  waits until the
  transfer is confirmed on chain, and returns an object that includes the
  transaction receipt under a `receipt` key.

Once the policy is active, a transfer to an account that is not on the
whitelist must fail, and a transfer to an approved account must succeed.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
