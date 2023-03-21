---
head:
  - - meta
    - property: og:title
      content: Migration Guide
  - - meta
    - name: description
      content: Guide to migrate to newer versions of viem.
  - - meta
    - property: og:description
      content: Guide to migrate to newer versions of viem.
---

# Migration Guide

If you are coming from an earlier version of `viem`, you will need to make sure to update the following APIs listed below.

## 0.2.x Breaking changes

### `chain` is required for `sendTransaction`, `writeContract`, `deployContract`

A chain is now required for the `sendTransaction`, `writeContract`, `deployContract` Actions.

You can hoist the Chain on the Client:

```ts
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet, // [!code ++]
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

Alternatively, you can pass the Chain directly to the Action:

```ts
import { createWalletClient, custom, getAccount } from 'viem'
import { mainnet } from 'viem/chains'

export const walletClient = createWalletClient({
  chain: mainnet, // [!code --]
  transport: custom(window.ethereum)
})
 
const account = getAccount('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266')
 
const hash = await walletClient.sendTransaction({ 
  account,
  chain: mainnet, // [!code ++]
  to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  value: 1000000000000000000n
})
```

### `recoverAddress`, `recoverMessageAddress`, `verifyMessage` are now async

he following functions are now `async` functions instead of synchronous functions:

- `recoverAddress`
- `recoverMessageAddress`
- `verifyMessage`

```ts
import { recoverMessageAddress } from 'viem'

recoverMessageAddress({ message: 'hello world', signature: '0x...' }) // [!code --]
await recoverMessageAddress({ message: 'hello world', signature: '0x...' }) // [!code ++]
```

### `assertChain` removed from `sendTransaction`

Removed `assertChain` argument on `sendTransaction`, `writeContract` & `deployContract`. If you wish to bypass the chain check (not recommended unless for testing purposes), you can pass `chain: null`.

```ts
await walletClient.sendTransaction({
  assertChain: false, // [!code --]
  chain: null, // [!code ++]
  ...
})
```

