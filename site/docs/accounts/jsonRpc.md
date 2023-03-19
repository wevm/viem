---
head:
  - - meta
    - property: og:title
      content: JSON-RPC Account
  - - meta
    - name: description
      content: A function to create a JSON-RPC Account.
  - - meta
    - property: og:description
      content: A function to create a JSON-RPC Account.

---

# JSON-RPC Account

A JSON-RPC Account **defers** signing of transactions & messages to the target Wallet over JSON-RPC. An example could be sending a transaction via a Browser Extension Wallet (e.g. MetaMask) with the `window.ethereum` Provider.

## Usage

A JSON-RPC Account can just be initialized as an [Address](/docs/glossary/types#address) string. In the usage below, we are extracting the address from a Browser Extension Wallet (e.g. MetaMask) with the `window.ethereum` Provider via `eth_requestAccounts`:

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const [address] = await window.ethereum.request({ // [!code focus:3]
  method: 'eth_requestAccounts' 
})

const client = createWalletClient({
  account: address, // [!code focus]
  chain: mainnet,
  transport: custom(window.ethereum)
})
```
