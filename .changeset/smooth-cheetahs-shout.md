---
"viem": patch
---

Added the ability to hoist an Account to the Wallet Client.

```diff
import { createWalletClient, http } from 'viem'
import { mainnnet } from 'viem/chains'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

const client = createWalletClient({
+ account,
  chain: mainnet,
  transport: http()
})

const hash = await client.sendTransaction({
- account,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: parseEther('0.001')
})
```