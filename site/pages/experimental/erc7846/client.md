# Extending Client with ERC-7846 Actions [Setting up your Viem Client]

`connect` is now available as a [Wallet Action](/docs/actions/wallet/connect) on Wallet Clients and as a standalone import from `viem/actions`.

Use the experimental [ERC-7846](https://eips.ethereum.org/EIPS/eip-7846) decorator for `disconnect` or for compatibility with the experimental entrypoint.

## connect

```ts
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
})

const { accounts } = await client.connect()
```

## disconnect

```ts
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { erc7846Actions } from 'viem/experimental'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum!),
}).extend(erc7846Actions())

await client.disconnect()
```
