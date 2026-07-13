---
description: Validates EIP-4361 message.
---

# validateSiweMessage

Validates [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) message.

## Import

```ts twoslash
import { validateSiweMessage } from 'viem/siwe'
```

## Usage

```ts twoslash
import { validateSiweMessage } from 'viem/siwe'

const valid = validateSiweMessage({
  address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
  message: {
    address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    chainId: 1,
    domain: 'example.com',
    nonce: 'foobarbaz',
    uri: 'https://example.com/path',
    version: '1',
  },
})
```

## Returns

`boolean`

Whether the message fields are valid.

## Parameters

### message

- **Type:** `Partial<SiweMessage>`

EIP-4361 message fields.

### address (optional)

- **Type:** `string`

Ethereum address to check against.

### domain (optional)

- **Type:** `string`

[RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) authority to check against.

### nonce (optional)

- **Type:** `string`

Random string to check against.

### scheme (optional)

- **Type:** `string`

[RFC 3986](https://www.rfc-editor.org/rfc/rfc3986#section-3.1) URI scheme to check against.

### time (optional)

- **Type:** `Date`
- **Default:** `new Date()`

Current time to check optional [`expirationTime`](http://localhost:5173/docs/siwe/utilities/createSiweMessage#expirationtime-optional) and [`notBefore`](/docs/siwe/utilities/createSiweMessage#notbefore-optional) message fields.
