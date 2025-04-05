---
"viem": minor
---

**Breaking (Experimental):** Updated EIP-5792 to the latest spec changes. The following APIs have been updated:

#### `getCallsStatus`

```diff
const result = await client.getCallsStatus({ id })
//    ^?
      {
+       atomic: boolean
+       chainId: number
+       id: string
        receipts: Receipt[]
-       status: 'PENDING' | 'CONFIRMED'
+       status: 'pending' | 'success' | 'failure' | undefined
+       statusCode: number
+       version: string
}
```

#### `sendCalls`

```diff
const result = await client.sendCalls({ calls })
//    ^?
-     string
+     { id: string, capabilities?: Capabilities }
```

#### `waitForCallsStatus`

```diff
const result = await client.waitForCallsStatus({ id })
//    ^?
      {
+       atomic: boolean
+       chainId: number
+       id: string
        receipts: Receipt[]
-       status: 'PENDING' | 'CONFIRMED'
+       status: 'pending' | 'success' | 'failure' | undefined
+       statusCode: number
+       version: string
}
```