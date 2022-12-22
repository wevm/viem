# setCode

Modifies the bytecode stored at an account's address.

## Import 

```ts
import { setCode } from 'viem'
```

## Usage

```ts
import { setCode } from 'viem'
import { testClient } from '.'
 
await setCode(testClient, { // [!code focus:4]
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  bytecode: '60806040526000600355600019600955600c80546001600160a01b031916737a250d5630b4cf539739df...'
})
```

## Configuration

### address

- **Type:** `Address`

The account address.

```ts
await setCode(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79', // [!code focus]
  bytecode: '60806040526000600355600019600955600c80546001600160a01b031916737a250d5630b4cf539739df...'
})
```

### bytecode

- **Type:** `Address`

The stored bytecode.

```ts
await setCode(testClient, {
  address: '0xe846c6fcf817734ca4527b28ccb4aea2b6663c79',
  bytecode: '60806040526000600355600019600955600c80546001600160a01b031916737a250d5630b4cf539739df...' // [!code focus]
})
```