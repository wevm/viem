---
head:
  - - meta
    - property: og:title
      content: Error Handling
  - - meta
    - name: description
      content: Error handling in viem.
  - - meta
    - property: og:description
      content: Error handling in viem.
---

# Error Handling

Every module in viem exports an accompanying error type which you can use to strongly type your `catch` statements.

These types come in the form of `<Module>ErrorType`. For example, the `getBlockNumber` action exports a `GetBlockNumberErrorType` type.

Unfortunately, [TypeScript doesn't have an abstraction for typed exceptions](https://github.com/microsoft/TypeScript/issues/13219), so the most pragmatic & vanilla approach would be to explicitly cast error types in the `catch` statement.

::: code-group

```ts [example.ts] {1,7}
import { type GetBlockNumberErrorType } from 'viem'
import { publicClient } from './client'

try {
  const blockNumber = await client.getBlockNumber()
} catch (e) {
  const error = e as GetBlockNumberErrorType
  error.name
  //    ^? (property) name: "Error" | "ChainDisconnectedError" | "HttpRequestError" | "InternalRpcError" | "InvalidInputRpcError" | "InvalidParamsRpcError" | "InvalidRequestRpcError" | "JsonRpcVersionUnsupportedError" | ... 16 more ... | "WebSocketRequestError"

  if (error.name === 'InternalRpcError')
    error.code
    //    ^? (property) code: -32603

  if (error.name === 'HttpRequestError')
    error.headers
    //    ^? (property) headers: Headers
    error.status
    //    ^? (property) status: number
}
```

```ts [client.ts]
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

:::
