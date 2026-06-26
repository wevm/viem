# Tokens [Declare well-known tokens on a chain]

You can declare well-known tokens on a chain using the `tokens` property. Each declared token becomes
selectable by name (via the [`erc20Actions`](/docs/erc20) decorator), so you can call ERC-20 Actions
like [`transfer`](/docs/erc20/transfer) and [`getBalance`](/docs/erc20/getBalance) by `token` name
without looking up its contract `address` or `decimals`.

## Usage

```ts
import { defineChain } from 'viem'

export const example = defineChain({
  /* ... */
  tokens: { // [!code focus:9]
    usdc: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'erc20',
    },
  },
})
```

Once declared, the token can be selected by name on any ERC-20 Action:

```ts twoslash
import { createClient, erc20Actions, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createClient({ chain: mainnet, transport: http() }).extend(erc20Actions())
// ---cut---
const balance = await client.erc20.getBalance({
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
  tokens: { // [!code focus:10]
    ...mainnet.tokens,
    dai: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      name: 'Dai Stablecoin',
      symbol: 'DAI',
      type: 'erc20',
    },
  },
})
```

## API

The `tokens` property is a map of token names to token configs. The name (e.g. `usdc`) is the key used
to select the token on an ERC-20 Action via `token: 'usdc'`.

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
  /**
   * Token standard, used to attach the matching Actions to the Client. Set to
   * `'erc20'` for tokens exposed by [`erc20Actions`](/docs/erc20).
   */
  type: 'erc20' | (string & {})
}
```
