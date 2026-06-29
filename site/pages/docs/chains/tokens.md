# Tokens [Declare well-known tokens on a chain]

You can declare well-known tokens on a chain using the `tokens` property. Each declared token becomes
selectable by name, so you can call [Token Actions](/tokens)
like [`transfer`](/tokens/actions/transfer) and [`getBalance`](/tokens/actions/getBalance) by `token` name
without looking up its contract `address` or `decimals`.

## Usage

```ts
import { defineChain } from 'viem'

export const example = defineChain({
  /* ... */
  tokens: { // [!code focus:8]
    usdc: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
    },
  },
})
```

Once declared, the token can be selected by name on any Token Action:

```ts twoslash
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({ chain: mainnet, transport: http() })
// ---cut---
const balance = await client.token.getBalance({
  account: '0x55FE002aefF02F77364de339a1292923A15844B8',
  token: 'usdc', // [!code focus]
})
// @log: {
// @log:   amount: 1000000n,
// @log:   formatted: '1',
// @log: }
```

To extend an existing viem chain with an extra token, spread its `tokens`:

```ts
import { defineChain } from 'viem'
import { mainnet } from 'viem/chains'

const example = defineChain({
  ...mainnet,
  tokens: { // [!code focus:9]
    ...mainnet.tokens,
    dai: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
    },
  },
})
```

## API

The `tokens` property is a map of token names to token configs. The name (e.g. `usdc`) is the key used
to select the token on an Token Action via `token: 'usdc'`.

```ts
type ChainToken = {
  /**
   * Contract address of the token on the chain. Used as the call target and
   * resolved from the chain when the token is selected by `token` name.
   */
  address: Address
  /**
   * Number of decimals the token uses. Used to convert between base units and
   * human-readable amounts (parsing `amount` for writes, formatting
   * `amount`/`formatted` for reads).
   */
  decimals: number
  /**
   * Human-readable name of the token (e.g. `'USD Coin'`).
   */
  name?: string | undefined
  /**
   * Ticker symbol of the token (e.g. `'USDC'`).
   */
  symbol?: string | undefined
}
```
