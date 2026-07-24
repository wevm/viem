Our stablecoin exchange acts as a liquidity provider on Tempo's fee AMM: the
protocol contract that converts the token a user pays fees in into the token a
validator wants to be paid in. Providers deposit validator-side tokens into a
pool, receive LP shares, and can later burn those shares to withdraw.

Implement the following functions in `src/index.ts`:

- `addLiquidity` receives a Tempo client carrying the provider account and
  adds liquidity to the fee-AMM pool for the
  `(options.userToken, options.validatorToken)` pair.
  `options.validatorTokenAmount` is the amount of validator token to deposit,
  in base units. LP shares must be
  issued to the provider's own address. Wait until the deposit is confirmed on
  chain, then return an object with the transaction receipt under `receipt` and
  the amount of LP shares issued under `liquidity` (bigint).
- `getPoolState` receives a Tempo client and returns the pool identified by
  `options.userToken` and `options.validatorToken` as
  `{ reserveUserToken, reserveValidatorToken, totalSupply }` (all bigints).
- `getLpBalance` receives a Tempo client and returns the LP-share balance of
  `options.address` in that pool (bigint).
- `removeLiquidity` receives a Tempo client carrying the provider account and
  burns the provider's
  entire LP-share balance in that pool, withdrawing the underlying tokens to
  the provider's own address. Wait until the withdrawal is confirmed on chain,
  then return an object with the transaction receipt under `receipt`.

Fee-AMM pools are directional: the ordered `(userToken, validatorToken)` pair
identifies the pool. The functions will be exercised with Tempo's genesis
stablecoins (6 decimals).

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
