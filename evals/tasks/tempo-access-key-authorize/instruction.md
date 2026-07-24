Our wallet backend lets users provision a session key: a P256 (secp256r1) key
that signs transactions on behalf of their account, capped by a pathUSD
spending allowance.

Implement two functions in `src/index.ts`:

- `authorizeSessionKey` registers the session key on the root account:
  - The first argument is a Tempo client carrying the root account.
  - `options.accessKey` is the P256 access-key Account to authorize.
  - `options.limit` is a human-readable pathUSD amount (for example `'100'` means the
    key may spend at most 100 pathUSD). The authorization should stay valid
    for at least several minutes.
  - Wait until the authorization is confirmed on chain and return an object
    that includes the transaction receipt under a `receipt` key.

- `sendWithSessionKey` transfers pathUSD out of the root account, signed by
  the session key:
  - The first argument is a Tempo client carrying the authorized P256 access
    key Account.
  - `options.to` is the recipient address; `options.amount` is a human-readable pathUSD
    amount (for example `'10.5'` means 10.5 pathUSD).
  - Wait until the transfer is confirmed on chain and return an object that
    includes the transaction receipt under a `receipt` key. If the transfer
    is not allowed (for example it exceeds the key's remaining allowance),
    the returned promise must reject.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Transactions signed by the session key must pay their fees in
pathUSD (fees also count against the key's allowance).

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
