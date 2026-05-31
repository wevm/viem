---
description: Requests to get assets for an account from a Wallet.
---

# getAssets

Requests to get assets for an account from a Wallet.

## Usage

:::code-group

```ts twoslash [example.ts]
// @twoslash-cache: {"v":1,"hash":"ceb9ba2a2b97a273a71ab275fff52c9f9cda5ad56a2ba12d27157c95ea35a343","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAdzasYaAMIcYYNIl5z2CtAB4ZAVxEQAtgBVSzYVgik0FXtrCwAZuzAwo12w6cvrAdUnSASlj8AMr8+DD6zNbAADpgvAm8AObSAIJwcNJwyhrMSUmkMEnMNLx0NHZwvABGEBBSprwAPryMLBnSyilo6ZlocAB0vdJ8ALwAfLwipE5JfC3uMI7OULyjNnZLnlDjjFjMJvrSZNm8AOJpHf0ACgfMRzSkcLn5hcU0bpvLLuNjk9ekAzsTIaC49K5wfzSbSkMCGbAwF4FIolGDjcYAbjiAF9eAAyXi+VhSHr8NDsITPRbfVwbDwrdFxdj6cyWcR+WTyRSUEAiA4MRAATioUjASTQ+CQAEYAExUNAHbp4CTE6SqdQ8jjOJAABioYTuZLISEF2Io6AReEIJHI8vKeEEwlEXD6pzBw36ULQMLhCI01O24x5fMsSAALAAOEUKcWSxAANnliukeBdWU1niQcpABpMRvICbNFpwVuIxrt9CYbE4PAElNEKpJ6sUymbmh0eiMJjMFisdK2K0+9K8hI5gRCYQiUV4sXiiW6HtOSLeqLK9AUUCqtXqMEaLTaaaUyUurqGVz+UzQMzF837NLWd8DezuDxOyndENuh2OT2XKI+j4MheAJAiCH6ul6Prwjgf7vGimI4vio6qqS5KUv6XzbEOA4/OMTIsr27IoW2wYKqGCYAMzRmKErStmZFKogICNmqXIMCKmaINmubMPmWZSkW1CWkx1rltQ9pMXsgI4JYGB8AuEI5AGDLPt+jxuieWRfvcP5Uphg6AT8wGAvowKIuBWSQbC0GIspuE8lAED8AgTFQgAjto8D9LwaAQMezoQrw9gWLwjS8YItiiPYJmhURJIDHEcQALS8AAIk5pz4GgaBYNkAD0eVEGo+gDHA+B5XQMnMuobAVaQ/AAOwRlKUp5Qpro8gqSQucgyAgPshw8vwbG8ClbY+X5ui4AAuhQfUDfcPILa+TyjTOAACWoANbnJpNwvrp2IgLNfWFN6sIIFQAAywKiBA9ihYFwWkD54TJOwJDxOFECRRt227eCEHQtZCJHSdIB0PcWBSDyzKsqIwACIUqJEk2bHWPwui+fovC4tFBi8AA5EVESE/h8MzrwkROM4oh4zFxPFXlBpOHAZNgHDhGI2QjXNVKqRkhSwi40FDMk/oFW0FVRyKLVPNNS17NxI6IgCCN6z8MjNCo6xaiKIws4JCzYDKNTYC0xQcQJFephwPDyiY52jBiE4jliAM0jhIU2j6NwltgNi3Ae+udiMPLfMC2hwiMNw3CJWAKuiIUduUjAD7MBI7CiMNetoAM7VZAbVuhfwEUtkTOq0PYFGCvYUDxjAACsUrMMwUARhG9jxvYYb8DA8bMNUHcyg1I+Cvw9iT9UgoyjK8bxoT/uB8ds28mRAoNYmICirGJpJqQjEgAX/QZtqXH6vghqPEgFFhoJmAliJZa2uJlaSVg0lkJgfDfZFygAAaVwACTAGmLMbE/9mi8AFmXdia9+TSh1A1aiu9EDIOoMmAUIBf7cg4mfKiOZL55mvlxbEq9BCwDwJzNkiMWKclziLfGONCYDGZkIRwSR2a8GVvWR6rp06ZwbByNs+c9pwANrwAqvBkAAEIKFp2Co7aaxccFHkJpXautd65Nxbm3DuXce59wHkPCMI8x4TynjPOeC9rBSNkfIoKTldDKIDnwOxcjoAKKcXAaaPIHjMCQKAcoCg4BCzwCfbE2IgA==="}
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ // [!code focus]
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
}) // [!code focus]
```

```ts twoslash [config.ts] filename="config.ts"
// @twoslash-cache: {"v":1,"hash":"034baf71d625860e1c6ec0759f2a66219892cd2c1b8c82e5ef90ccba52f854be","data":"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="}
import 'viem/window'
// ---cut---
import { createWalletClient, custom } from 'viem'
import { erc7811Actions } from 'viem/experimental'

export const walletClient = createWalletClient({
  transport: custom(window.ethereum!),
}).extend(erc7811Actions())
```

:::

## Returns

List of assets for the given account. 

The `0` key represents the aggregated assets across the returned chains.

```ts
type ReturnType = {
  /** Aggregated assets across returned chains. */
  0: readonly {
    address: Address | 'native'
    balance: Hex
    chainIds: readonly number[]
    metadata?: unknown | undefined
    type: 'native' | 'erc20' | 'erc721' | (string & {})
  }[]
  
  /** Assets for each chain. */
  [chainId: number]: readonly {
    address: Address | 'native'
    balance: Hex
    metadata?: unknown | undefined
    type: 'native' | 'erc20' | 'erc721' | (string & {})
  }[]
}
```

## Parameters

### `account`

- **Type:** `Account | Address`

The account to get assets for.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', // [!code focus]
}) 
```

### `assets`

- **Type:** `{ [chainId: number]: readonly { address: Address | 'native', type: 'native' | 'erc20' | 'erc721' | (string & {}) }[] }`

Filter by assets.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  assets: { // [!code focus]
    8453: [{ address: '0x1234567890abcdef1234567890abcdef12345678', type: 'erc20' }], // [!code focus]
  }, // [!code focus]
}) 
```

### `assetTypes`

- **Type:** `readonly ('native' | 'erc20' | 'erc721' | (string & {}))[]`

Filter by asset types.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  assetTypes: ['erc20'], // [!code focus]
}) 
```

### `chainIds`

- **Type:** `readonly number[]`

Filter by chain IDs.

```ts
import { walletClient } from './config'
 
const assets = await walletClient.getAssets({ 
  account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
  chainIds: [8453], // [!code focus]
}) 
```

## JSON-RPC Methods

- [`wallet_getAssets`](https://github.com/ethereum/ERCs/blob/master/ERCS/erc-7811.md)
