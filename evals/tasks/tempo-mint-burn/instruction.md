Our issuance service manages the supply lifecycle of its own TIP-20
stablecoin: it deploys the token, mints new units, and retires units it
holds.

Implement three functions in `src/index.ts`:

- `createToken` receives a Tempo client carrying the administrator account
  and `options.name` and `options.symbol`. It deploys a new TIP-20 stablecoin
  (USD currency, 6 decimals). A freshly created token does not let anyone
  mint by default: the
  token admin must first grant the issuer role, so grant it to the same
  account before returning. Wait until everything is confirmed on chain, then
  return an object with the new token's address under a `token` key.
- `mintToken` receives a Tempo client carrying the issuer account and mints
  `options.amount` of `options.token` to `options.to`. The amount is a
  human-readable decimal string (for example `'12.5'`
  means 12.5 tokens). Wait for confirmation, then return
  `{ receipt, balance, totalSupply }` where `balance` is `to`'s balance of
  `token` and `totalSupply` is the token's total supply, both as base-unit
  bigints read after the mint.
- `burnToken` receives a Tempo client carrying the holder account and burns
  `options.amount` of `options.token` from that account's own balance. Wait
  for confirmation, then return
  `{ receipt, balance, totalSupply }` where `balance` is the calling
  account's remaining balance of `token` and `totalSupply` is the token's
  total supply, both as base-unit bigints read after the burn.

Use the `viem` library already installed in this project. A Tempo RPC
endpoint (Tempo localnet, chain id 1337) is available at `http://tempo:8545`.
The account used in grading already holds pathUSD
(`0x20c0000000000000000000000000000000000000`), which covers transaction fees
by default. Do not add any new dependencies.

When you are done, `npm run build` must pass.
