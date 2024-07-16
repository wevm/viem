# hdKeyToAccount [A function to create a Hierarchical Deterministic (HD) Account.]

A [Hierarchical Deterministic (HD)](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#abstract) Account is derived from a [HD Key](https://github.com/paulmillr/scure-bip32#usage) and an optional HD path.

It has the ability to sign transactions and messages with the private key derived from the HD Node.

:::info
viem internally uses [`@scure/bip32`](https://github.com/paulmillr/scure-bip32), an **audited** implementation of [BIP-32 HD wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#abstract), for hierarchical deterministic (HD) wallet derivation.
:::

## Import

```ts twoslash
import { HDKey, hdKeyToAccount } from 'viem/accounts'
```

> Note: viem [re-exports `HDKey`](https://github.com/paulmillr/scure-bip32#usage) from `@scure/bip32`.

## Usage

To initialize a HD Account, you will need to pass a [`HDKey` instance](https://github.com/paulmillr/scure-bip32#usage) to `hdKeyToAccount`.

The `HDKey` instance comes with a few static methods to derive a HD Key:

- `fromMasterSeed`
- `fromExtendedKey`
- `fromJSON`

```ts twoslash
// @noErrors
import { createWalletClient, http } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const hdKey = HDKey.fromMasterSeed(...) // [!code focus:3]
const hdKey = HDKey.fromExtendedKey(...)
const hdKey = HDKey.fromJSON({ xpriv: ... })

const account = hdKeyToAccount(hdKey) // [!code focus]

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
})
```

## Parameters

### hdKey

- **Type:** `string`

The BIP-39 mnemonic phrase.

```ts twoslash
// @noErrors
import { hdKeyToAccount } from 'viem/accounts'
// ---cut---
const hdKey = HDKey.fromMasterSeed(...)

const account = hdKeyToAccount(
  hdKey, // [!code focus]
)
```

### options.accountIndex

- **Type:** `number`
- **Default:** `0`

The account index to use in the path (`"m/44'/60'/${accountIndex}'/0/0"`) to derive a private key.

```ts twoslash
// @noErrors
import { hdKeyToAccount } from 'viem/accounts'
// ---cut---
const hdKey = HDKey.fromMasterSeed(...)

const account = hdKeyToAccount(
  hdKey,
  {
    accountIndex: 1 // [!code focus]
  }
)
```

### options.addressIndex

- **Type:** `number`
- **Default:** `0`

The address index to use in the path (`"m/44'/60'/0'/0/${addressIndex}"`) to derive a private key.

```ts twoslash
// @noErrors
import { hdKeyToAccount } from 'viem/accounts'
// ---cut---
const hdKey = HDKey.fromMasterSeed(...)

const account = hdKeyToAccount(
  hdKey,
  {
    accountIndex: 1,
    addressIndex: 6 // [!code focus]
  }
)
```

### options.changeIndex

- **Type:** `number`
- **Default:** `0`

The change index to use in the path (`"m/44'/60'/0'/${changeIndex}/0"`) to derive a private key.

```ts twoslash
// @noErrors
import { hdKeyToAccount } from 'viem/accounts'
// ---cut---
const hdKey = HDKey.fromMasterSeed(...)

const account = hdKeyToAccount(
  hdKey,
  {
    accountIndex: 1,
    addressIndex: 6,
    changeIndex: 2 // [!code focus]
  }
)
```

### options.path

- **Type:** `"m/44'/60'/${string}"`

The HD path to use to derive a private key.

```ts twoslash
// @noErrors
import { hdKeyToAccount } from 'viem/accounts'
// ---cut---
const hdKey = HDKey.fromMasterSeed(...)

const account = hdKeyToAccount(
  hdKey,
  {
    path: "m/44'/60'/5'/0/2" // [!code focus]
  }
)
```