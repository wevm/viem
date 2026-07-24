Our trading desk makes markets for newly issued stablecoins on Tempo's
built-in stablecoin DEX.

Implement the following functions in `src/index.ts`:

- `createMarket`: the first argument is a Tempo client carrying the market
  maker account. Issue a new TIP-20 stablecoin
  (currency `USD`) with the given `name` and `symbol` from the account
  supplied as `options.name` and `options.symbol`, give that account the token's issuer role, mint
  exactly 1,000,000 tokens to it (the token uses 6 decimals), and register a
  DEX trading pair for the token against the default quote stablecoin
  (pathUSD at `0x20c0000000000000000000000000000000000000`). Return
  `{ base, quote }` with the new token's address and the pair's quote token
  address.
- `placeLimitOrder`: the first argument is a Tempo client carrying the maker
  account. Rest a limit order on the pair's book. The options object contains
  `{ token, amount, tick, side }`, where `token` is the base
  token address, `amount` is a bigint in the token's base units, `tick` is
  the integer price tick, and `side` is `'buy'` or `'sell'`. Wait until the
  order is confirmed on chain, then return `{ orderId, receipt }`.
- `getOrderInfo`: the first argument is a Tempo client. Read the resting order
  identified by `options.orderId` and
  return `{ maker, amount, remaining, tick, isBid }`.
- `getBestTicks`: the first argument is a Tempo client. Read the pair identified
  by `options.base` and `options.quote` and return
  `{ bestBidTick, bestAskTick }`.
- `cancelOrder`: the first argument is a Tempo client carrying the maker
  account. Cancel `options.orderId` and wait for confirmation. Return
  `{ receipt }`.

Use the `viem` library already installed in this project. A Tempo RPC
endpoint (Tempo localnet, chain id 1337) is available at `http://tempo:8545`.
Do not add any new dependencies.

When you are done, `npm run build` must pass.
