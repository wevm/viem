# getEventSelector

Returns the event selector for a given event definition.

## Install

```ts
import { getEventSelector } from 'viem'
```

## Usage

```ts
import { getEventSelector } from 'viem'

const selector = getEventSelector('Transfer(address,address,uint256)')
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

const selector = getEventSelector('Transfer(address indexed from, address indexed to, uint256 amount)')
// 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Returns

`Hex`

The selector as a hex value.

## Parameters

### event

- **Type:** `string`

The event to generate a selector for.

