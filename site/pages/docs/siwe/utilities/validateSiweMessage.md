---
description: Validates EIP-4361 message.
---

# validateSiweMessage

Validates [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) message.

## Import

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"daf9eb9105e114315fc5b08d94eb36ab4964f67da2d90e718357b496eed43f17","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvIm3ZRmNAMrsA7jACy8OMwDmMRlmalmAWxg1ScRLwBqs+UtUatumAAUjp82R7W7HBxhlNU04bT0AJXNBUjAAFWwYAB0wdhMsCFI0aXsFIKdQ8NwqNF0EFGQQWDgRUnYscUlKEH85PLheAFEASTcAWgAWAGYANgBGXjMw1wA6EABdCkq4GGKCNDQsKwB6bZh6uBnzfDIYQRMZzJ1tnrdFPfrB0bGFxZA4UqykAE4qVhgwDo0PgkGNftQjHoGIgQDIAnlgs5pnpmhwwLhEAAGKgifCeMRkH4AXzeImgGJAaQyWV4wBy8McIRcel4RIEpAgJl4AHIiOwYCZtnAnNzmmZSkhQHQaGBhU0YWgEESiUA="}
import { validateSiweMessage } from 'viem/siwe'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"994f3a6c4d3c59ae71923662c0ebc87fceba108543a3395d6b59f4de0af252e4","data":"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"}
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
