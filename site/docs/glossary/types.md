---
head:
  - - meta
    - property: og:title
      content: Types
  - - meta
    - name: description
      content: Glossary of Types in viem.
  - - meta
    - property: og:description
      content: Glossary of Types in viem.

---

# Types

## `Abi`

Type matching the [Contract ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html#json)

Re-exported from [ABIType](https://abitype.dev/api/types.html#abi).

## `AbiError`

ABI [Error](https://docs.soliditylang.org/en/latest/abi-spec.html#errors) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abierror).

## `AbiEvent`

ABI [Event](https://docs.soliditylang.org/en/latest/abi-spec.html#events) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abievent).

## `AbiFunction`

ABI [Function](https://docs.soliditylang.org/en/latest/abi-spec.html#argument-encoding) type.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abifunction).

## `AbiParameter`

`inputs` and `ouputs` item for ABI functions, events, and errors.

Re-exported from [ABIType](https://abitype.dev/api/types.html#abiparameter).

## `AbiParameterToPrimitiveTypes`

Converts `AbiParameter` to corresponding TypeScript primitive type.

[See more](https://abitype.dev/api/utilities.html#abiparametertoprimitivetype)

## `AbiParametersToPrimitiveTypes`

Converts array of `AbiParameter` to corresponding TypeScript primitive types.

[See more](https://abitype.dev/api/utilities.html#abiparameterstoprimitivetypes)

## `Filter`

A type for a [Filter](/docs/glossary/terms#filter).

[See Type](https://github.com/wagmi-dev/viem/blob/main/src/types/filter.ts)