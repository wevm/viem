# mnemonicToAccount [A function to create a Mnemonic Account.]

A Mnemonic Account is a [Hierarchical Deterministic (HD) Account](/docs/accounts/local/hdKeyToAccount) that is derived from a [BIP-39 mnemonic phrase](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) and an optional HD path.

It has the ability to sign transactions and messages with the private key derived from the HD Node.

:::info
viem internally uses [`@scure/bip32`](https://github.com/paulmillr/scure-bip32), an **audited** implementation of [BIP-32 HD wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#abstract), for hierarchical deterministic (HD) wallet derivation.
:::

## Import

```ts twoslash
import { mnemonicToAccount } from 'viem/accounts'
```

## Usage

To initialize a Mnemonic Account, you will need to pass a mnemonic phrase to `mnemonicToAccount`:

```ts twoslash
import { createWalletClient, http } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const account = mnemonicToAccount('legal winner thank year wave sausage worth useful legal winner thank yellow') // [!code focus]

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})
```

> Note: the above is a valid mnemonic, but it is not a "real" mnemonic. Please do not use it for anything other than testing.

### Generating Mnemonics

You can generate a random BIP-39 mnemonic using the `generateMnemonic` function with a wordlist:

```ts twoslash
import { english, generateMnemonic } from 'viem/accounts'

const mnemonic = generateMnemonic(english)
```

:::tip
You can customize the strength of the generated mnemonic by passing a value between 128 and 256 as the second argument to the `generateMnemonic` function. This value must be a multiple of 32.
:::

Available wordlists:

- `czech`
- `english`
- `french`
- `italian`
- `japanese`
- `korean`
- `portuguese`
- `simplifiedChinese`
- `spanish`
- `traditionalChinese`

## Parameters

### mnemonic

- **Type:** `string`

The BIP-39 mnemonic phrase.

```ts twoslash
import { mnemonicToAccount } from 'viem/accounts'
// ---cut---
const account = mnemonicToAccount(
  'legal winner thank year wave sausage worth useful legal winner thank yellow' // [!code focus]
)
```

### options.accountIndex

- **Type:** `number`
- **Default:** `0`

The account index to use in the path (`"m/44'/60'/${accountIndex}'/0/0"`) to derive a private key.

```ts twoslash
import { mnemonicToAccount } from 'viem/accounts'
// ---cut---
const account = mnemonicToAccount(
  'legal winner thank year wave sausage worth useful legal winner thank yellow',
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
import { mnemonicToAccount } from 'viem/accounts'
// ---cut---
const account = mnemonicToAccount(
  'legal winner thank year wave sausage worth useful legal winner thank yellow',
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
import { mnemonicToAccount } from 'viem/accounts'
// ---cut---
const account = mnemonicToAccount(
  'legal winner thank year wave sausage worth useful legal winner thank yellow',
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
import { mnemonicToAccount } from 'viem/accounts'
// ---cut---
const account = mnemonicToAccount(
  'legal winner thank year wave sausage worth useful legal winner thank yellow',
  {
    path: "m/44'/60'/5'/0/2" // [!code focus]
  }
)
```
