# RpcAsync.fromHttp

Instantiates an asynchronous HTTP RPC interface.

## Imports

:::code-group
```ts [Named]
import { RpcAsync } from 'viem/utils'
```
```ts [Entrypoint]
import * as RpcAsync from 'viem/utils/RpcAsync'
```
:::

## Examples

```ts twoslash
import { RpcAsync } from 'viem/utils'

const rpc = RpcAsync.fromHttp('https://1.rpc.thirdweb.com')

const response = await rpc.request({ method: 'eth_blockNumber' })
```

## Definition

```ts
function fromHttp<schema>(
  url: string,
  options?: fromHttp.Options<schema>,
): Http<schema>
```

**Source:** [src/utils/RpcAsync.ts](https://github.com/wevm/viem/blob/main/src/utils/RpcAsync.ts#L344)

## Parameters

### url

- **Type:** `string`

HTTP URL of an Ethereum JSON-RPC Provider.

### options

- **Type:** `fromHttp.Options<schema>`
- **Optional**

Options.

#### options.fetchFn

- **Type:** `{ (input: RequestInfo | URL, init?: RequestInit): Promise; }`
- **Optional**

Function to use to make the request.

#### options.fetchOptions

- **Type:** `Omit | Promise<....`
- **Optional**

Request configuration to pass to `fetch`.

#### options.onRequest

- **Type:** `(request: Request, init: RequestInit) => MaybePromise`
- **Optional**

A callback to handle the request.

#### options.onResponse

- **Type:** `(response: Response) => void | Promise`
- **Optional**

A callback to handle the response.

#### options.timeout

- **Type:** `number`
- **Optional**

Timeout for the request in milliseconds.

#### options.url

- **Type:** `string`
- **Optional**

## Return Type

Asynchronous HTTP RPC interface.

`Http<schema>`