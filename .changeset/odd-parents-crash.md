---
"viem": minor
---

**BREAKING (Experimental)**: 

Removed EIP-7702 exports in `viem/experimental`. These are no longer experimental. Use exports from `viem` or `viem/utils` instead.

Note, there is also a behavioral change in the stable EIP-7702 `signAuthorization` function. Previously, it was assumed that the signer of the Authorization was also the executor of the Transaction. This is no longer the case.

If the signer of the Authorization is **NOT** the executor of the Transaction, you no longer need to pass a `sponsor` parameter.

```diff
const eoa = privateKeyToAccount('0x...')
const relay = privateKeyToAccount('0x...')

const authorization = await client.signAuthorization({
  account: eoa,
  contractAddress: '0x...',
- sponsor: true
})

const transaction = await client.sendTransaction({
  account: relay,
  authorizationList: [authorization],
})
```

If the signer of the Authorization is **ALSO** the executor of the Transaction, you will now need to pass the `executor` parameter with a value of `'self'`.

```diff
const eoa = privateKeyToAccount('0x...')

const authorization = await client.signAuthorization({
  account: eoa,
  contractAddress: '0x...',
+ executor: 'self',
})

const transaction = await client.sendTransaction({
  account: eoa,
  authorizationList: [authorization],
})
```
