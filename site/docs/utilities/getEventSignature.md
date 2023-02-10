# getEventSignature

Returns the event signature for a given event definition.

## Install

```ts
import { getEventSignature } from 'viem/utils'
```

## Usage

```ts
import { getEventSignature } from 'viem/utils'

const signature = getEventSignature('Transfer(address,address,uint256)')
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

const signature = getEventSignature('Transfer(address indexed from, address indexed to, uint256 amount)')
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Returns

`Hex`

The signature as a hex value.

## Parameters

### event

- **Type:** `string`

The event to generate a signature for.

