---
description: Converts opaque data into a structured deposit data format.
---

# opaqueDataToDepositData

Converts an opaque data into a structured deposit data object. This includes extracting and converting the `mint`, `value`, `gas`, `isCreation` flag, and `data` from a hex string.

## Import

```ts
import { opaqueDataToDepositData } from "viem";
```

## Usage

```ts
import { opaqueDataToDepositData } from "viem";

const opaqueData =
  "0x00000000000000000000000000000000000000000000000000470DE4DF82000000000000000000000000000000000000000000000000000000470DE4DF82000000000000000186A00001";

const depositData = opaqueDataToDepositData(opaqueData);
// {
//   mint: 20000000000000000n,
//   value: 20000000000000000n,
//   gas: 100000n,
//   isCreation: false,
//   data: '0x01',
// }
```

## Returns

`OpaqueDataToDepositDataReturnType`

An object containing the parsed deposit data.

## Parameters

### opaqueData

- **Type:** `Hex`

The opaque hex-encoded data.

## Errors

`OpaqueDataToDepositDataErrorType`

An error type that includes potential slice, size, and generic errors encountered during the parsing process.
