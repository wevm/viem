---
name: viem-v3-migration
description: Guide projects from Viem v2 to Viem v3. Use when updating imports to the v3 module API, moving Ox-backed utilities to `viem/utils`, or replacing removed flat exports and deprecated aliases.
---

# Viem v3 Migration

Use this skill to help consumers migrate from Viem v2 to the Viem v3 module
API. The migration is a hard break: do not recommend runtime compatibility
shims.

## Workflow

1. Search for v2 imports from `viem`, `viem/actions`, `viem/accounts`,
   `viem/utils`, `viem/chains`, `viem/experimental`, and removed extension
   entrypoints.
2. Update imports manually to the v3 entrypoints below.
3. Run the consuming project's typecheck and tests.

## Entry Points

- Viem-owned APIs import from `viem` as modules.
- Ox-backed utility modules import from `viem/utils` as modules.
- Actions import as lowercase namespace collections from `viem/actions`.
- Accounts import as `Account` from `viem` or as `import * as Account from
  'viem/Account'`.
- Chain constants stay flat from `viem/chains`.
- Transport factories stay flat from `viem`.
- `viem/op-stack`, `viem/zksync`, `viem/celo`, and `viem/linea` are removed.
  Their chain constants can still be imported from `viem/chains`.
- `viem/experimental` is removed.
- ERC-7739, ERC-7715, ERC-7811, ERC-7821, and ERC-7895 experimental modules are
  removed.
- ERC-7846 graduated out of experimental into `actions.wallet` and
  `client.wallet`.

```ts
import { Account, Client, http } from 'viem'
import { Hex, Value, Signature, Transaction } from 'viem/utils'
import { mainnet, base } from 'viem/chains'
import * as actions from 'viem/actions'
```

## Root Imports

| v2 | v3 |
| --- | --- |
| `createClient` | `Client.create` |
| `createPublicClient` | `Client.create(...).extend(actions.public())` |
| `createWalletClient` | `Client.create(...).extend(actions.wallet())` |
| `createTestClient` | `Client.create(...).extend(actions.test())` |
| `publicActions` | `actions.public()` |
| `walletActions` | `actions.wallet()` |
| `testActions` | `actions.test()` |
| `http` | `http` |
| `webSocket` | `webSocket` |
| `custom` | `custom` |
| `fallback` | `fallback` |

## Actions

```diff
- import { getBlock, sendTransaction } from 'viem/actions'
+ import * as actions from 'viem/actions'

- await getBlock(client)
+ await actions.public.getBlock(client)
```

Removed aliases:

| v2 | v3 |
| --- | --- |
| `getBytecode` | `actions.public.getCode` |
| `GetBytecodeErrorType` | `actions.public.getCode.ErrorType` |
| `GetBytecodeParameters` | `actions.public.getCode.Options` |
| `GetBytecodeReturnType` | `actions.public.getCode.ReturnType` |
| `simulate` | `actions.public.simulateBlocks` |
| `SimulateErrorType` | `actions.public.simulateBlocks.ErrorType` |
| `SimulateParameters` | `actions.public.simulateBlocks.Options` |
| `SimulateReturnType` | `actions.public.simulateBlocks.ReturnType` |

## Accounts

```diff
- import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
+ import { Account } from 'viem'

- const account = privateKeyToAccount(privateKey)
+ const account = Account.fromPrivateKey(privateKey)
```

| v2 | v3 |
| --- | --- |
| `privateKeyToAccount` | `Account.fromPrivateKey` |
| `mnemonicToAccount` | `Account.fromMnemonic` |
| `hdKeyToAccount` | `Account.fromHdKey` |
| `toAccount` | `Account.from` |
| `signatureToHex` | `Signature.toHex` from `viem/utils` |

## Utilities

Import Ox-backed modules from `viem/utils`, then call module methods.

```diff
- import { concatHex, formatEther, keccak256 } from 'viem'
+ import { Hex, Hash, Value } from 'viem/utils'

- concatHex(values)
+ Hex.concat(...values)
```

Common moves:

| v2 | v3 |
| --- | --- |
| `bytesToBigint` | `Bytes.toBigInt` |
| `bytesToHex` | `Hex.fromBytes` |
| `concatBytes` | `Bytes.concat` |
| `concatHex` | `Hex.concat` |
| `formatBlock` | `Block.fromRpc` |
| `formatEther` | `Value.formatEther` |
| `formatGwei` | `Value.formatGwei` |
| `formatLog` | `Log.fromRpc` |
| `formatTransaction` | `Transaction.fromRpc` |
| `formatTransactionReceipt` | `TransactionReceipt.fromRpc` |
| `formatTransactionRequest` | `TransactionRequest.toRpc` |
| `formatUnits` | `Value.format` |
| `getAddress` | `Address.checksum` |
| `getEventSelector` | `AbiEvent.getSelector` |
| `getFunctionSelector` | `AbiFunction.getSelector` |
| `hexToBytes` | `Bytes.fromHex` |
| `isAddress` | `Address.validate` |
| `isHex` | `Hex.validate` |
| `keccak256` | `Hash.keccak256` |
| `numberToHex` | `Hex.fromNumber` |
| `parseEther` | `Value.fromEther` |
| `parseGwei` | `Value.fromGwei` |
| `parseTransaction` | `Transaction.deserialize` |
| `parseUnits` | `Value.from` |
| `serializeSignature` | `Signature.toHex` |
| `serializeTransaction` | `Transaction.serialize` |
| `signatureToHex` | `Signature.toHex` |
| `stringToHex` | `Hex.fromString` |

## Chains

Chains remain flat from `viem/chains`, but deprecated aliases are removed.

| v2 alias | v3 |
| --- | --- |
| `celoAlfajores` | `celoSepolia` |
| `foundry` | `anvil` |
| `klaytn` | `kaia` |
| `klaytnBaobab` | `kairos` |
| `lineaGoerli` | `lineaSepolia` |
| `lineaTestnet` | `lineaSepolia` |
| `storyOdyssey` | `storyAeneid` |
| `storyTestnet` | `storyAeneid` |
| `taikoHekla` | `taikoHoodi` |
| `taikoJolnir` | `taikoHoodi` |
| `taikoKatla` | `taikoHoodi` |
| `taikoTestnetSepolia` | `taikoHoodi` |
| `zkSync` | `zksync` |
| `zkSyncLocalNode` | `zksyncLocalNode` |
| `zkSyncSepoliaTestnet` | `zksyncSepoliaTestnet` |

## Removed Entrypoints

- Remove `viem/experimental` imports.
- Remove `viem/experimental/erc7739`, `viem/experimental/erc7715`,
  `viem/experimental/erc7811`, `viem/experimental/erc7821`, and
  `viem/experimental/erc7895` imports. Viem v3 does not ship replacement
  entrypoints for these modules.
- Replace `viem/experimental/erc7846` imports with `actions.wallet` or
  `client.wallet` methods after the v3 API review lands.
- Remove `viem/op-stack`, `viem/zksync`, `viem/celo`, and `viem/linea`
  imports. Viem v3 does not ship replacement extension entrypoints for these
  packages.
- Do not add a replacement `viem/compat` entrypoint.
- Do not import from private/generated paths like `viem/_cjs`, `viem/_esm`, or
  `viem/_types`.

## Guardrails

- Do not add a `viem/compat` import.
- Do not rewrite code automatically unless the project owner explicitly asks for
  a codemod.
- Prefer small, typechecked migration batches.
- Treat namespace imports and dynamic imports as manual-review work; member
  usage is usually clearer from the surrounding source than from a blanket rule.
