---
"viem": minor
---

**Breaking:** Removed the `getAccount` function.

**For JSON-RPC Accounts, use the address itself.**

```diff
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const address = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

const client = createWalletClient({
- account: getAccount(address), 
+ account: address,
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

**For Local Accounts, use `toAccount`.**

```diff
- import { createWalletClient, http, getAccount } from 'viem'
+ import { createWalletClient, http } from 'viem'
+ import { toAccount } from 'viem/accounts' 
import { mainnet } from 'viem/chains'
import { getAddress, signMessage, signTransaction } from './sign-utils' 

const privateKey = '0x...' 
- const account = getAccount({
+ const account = toAccount({
  address: getAddress(privateKey),
  signMessage(message) {
    return signMessage(message, privateKey)
  },
  signTransaction(transaction) {
    return signTransaction(transaction, privateKey)
  },
  signTypedData(typedData) {
    return signTypedData(typedData, privateKey)
  }
})

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```