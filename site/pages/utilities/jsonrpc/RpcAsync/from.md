# RpcAsync.from

Instantiates an asynchronous RPC interface.

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

const rpc = RpcAsync.from({
  async request(body) {
    return await fetch('https://1.rpc.thirdweb.com', {
      body: JSON.stringify(body),
      method: 'POST',
    }).then((res) => res.json())
  },
})

const response = await rpc.request({ method: 'eth_blockNumber' })
```

## Definition

```ts
function from<request, options, schema>(
  iface: from.Parameters<request, options>,
  options?: from.Options<options, schema>,
): RpcAsync<options, schema>
```

**Source:** [src/utils/RpcAsync.ts](https://github.com/wevm/viem/blob/main/src/utils/RpcAsync.ts#L344)

## Parameters

### iface

- **Type:** `from.Parameters<request, options>`

Interface to instantiate.

#### iface.request

- **Type:** `(request: request | { [x: string]: RpcRequest.RpcRequest; [x: number]: RpcRequest.RpcRequest; [x: symbol]: RpcRequest.RpcRequest; } | readonly { [x: string]: RpcRequest.RpcRequest; [x: number]: RpcRequest.RpcRequest; [x: symbol]: RpcRequest.RpcRequest; }[], options: options | Record Promise<requ...`

### options

- **Type:** `from.Options<options, schema>`
- **Optional**

Options.

#### options.schema

- **Type:** `schema | RpcSchema.Generic | undefined`
- **Optional**

RPC Schema to use for the `request` function.

## Return Type

Asynchronous RPC interface.

`RpcAsync<options, schema>`