Our trading desk lists its own USD stablecoin on Tempo's enshrined DEX and
buys exact amounts of it programmatically.

Implement three functions in `src/index.ts`:

`setupMarket` receives a Tempo client carrying the maker account and an
options object containing `name` and `symbol`. The account should:

- Create a new USD-denominated TIP-20 token (6 decimals) called `name` with
  symbol `symbol`, administered by that account.
- Grant that same account the token's issuer role, then mint it exactly
  1,000,000 tokens.
- List a trading pair for the token on the DEX (pairs quote against pathUSD).
- Rest a limit sell order on the book: 500 tokens at tick 100 (0.1% above the
  1.000 peg).
- Wait for each step to confirm before the next, and return `{ base, quote }`:
  the new token's address and the pair's quote-token address.

`quoteBuy` receives a Tempo client and an options object containing `tokenIn`,
`tokenOut`, and `amountOut`. It returns, as a bigint, the amount of `tokenIn`
(in base units) the DEX currently charges to buy exactly `amountOut` base
units of `tokenOut`.

`buyExact` receives a Tempo client carrying the buyer account and an options
object containing `tokenIn`, `tokenOut`, `amountOut`, and `maxAmountIn`. It
executes that buy, failing if the cost would exceed `maxAmountIn`. Wait until
the swap is confirmed on chain and return an object that includes the
transaction receipt under a `receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. pathUSD
is the TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000` with
6 decimals. Do not add any new dependencies.

When you are done, `npm run build` must pass.
