# JSON-RPC Account [A function to create a JSON-RPC Account.]

A JSON-RPC Account is an Account whose signing keys are stored on the external Wallet. It **defers** signing of transactions & messages to the target Wallet over JSON-RPC. An example of such Wallet could be a Browser Extension Wallet, or Mobile Wallet over WalletConnect.

## Usage

A JSON-RPC Account can just be initialized as an [Address](/docs/glossary/types#address) string. In the usage below, we are extracting the address from a Browser Extension Wallet (e.g. MetaMask) with the `window.ethereum` Provider via `eth_requestAccounts`:

```ts twoslash
// @noErrors
import 'viem/window'
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const [address] = await window.ethereum.request({ // [!code focus:3]
  method: 'eth_requestAccounts' 
})

const client = createWalletClient({
  account: address, // [!code focus]
  chain: mainnet,
  transport: custom(window.ethereum!)
})
```
