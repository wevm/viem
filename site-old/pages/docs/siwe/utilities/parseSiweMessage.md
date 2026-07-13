---
description: Parses EIP-4361 formatted message into message fields object.
---

# parseSiweMessage

Parses [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) formatted message into message fields object.

## Import

```ts twoslash
import { parseSiweMessage } from 'viem/siwe'
```

## Usage

```ts twoslash
import { parseSiweMessage } from 'viem/siwe'

const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
const fields = parseSiweMessage(message)
fields.address
//     ^?



```

## Returns

`SiweMessage`

EIP-4361 fields object

## Parameters

### message

- **Type:** `string`

EIP-4361 formatted message


