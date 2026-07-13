---
"viem": major
---

Address checksum and validation utilities moved from flat utilities to the `Address` namespace. `checksumAddress` folds into `Address.checksum`, which drops the optional EIP-1191 `chainId` parameter, and `IsAddressOptions` moves to `Address.validate.Options`.

```diff
- import { checksumAddress, getAddress, isAddress, isAddressEqual, type IsAddressOptions } from 'viem'
+ import { Address } from 'viem'

- const address = getAddress('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
- const checksummed = checksumAddress('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
- const valid = isAddress(address)
- const equal = isAddressEqual(address, otherAddress)
+ const address = Address.checksum('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
+ const checksummed = Address.checksum('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
+ const valid = Address.validate(address)
+ const equal = Address.isEqual(address, otherAddress)

- type Options = IsAddressOptions
+ type Options = Address.validate.Options
```

Contract address derivation utilities moved from flat utilities to the `ContractAddress` namespace, along with their option types. `ContractAddress.from` drops the `opcode` discriminator and dispatches on `salt` presence instead.

```diff
- import {
-   getContractAddress,
-   getCreate2Address,
-   getCreateAddress,
-   type GetContractAddressOptions,
-   type GetCreate2AddressOptions,
-   type GetCreateAddressOptions,
- } from 'viem'
+ import { ContractAddress } from 'viem'

- const create = getCreateAddress({ from, nonce })
- const create2 = getCreate2Address({ from, salt, bytecodeHash })
- const derived = getContractAddress({ opcode: 'CREATE', from, nonce })
+ const create = ContractAddress.fromCreate({ from, nonce })
+ const create2 = ContractAddress.fromCreate2({ from, salt, bytecodeHash })
+ const derived = ContractAddress.from({ from, nonce })

- type FromOptions = GetContractAddressOptions
- type CreateOptions = GetCreateAddressOptions
- type Create2Options = GetCreate2AddressOptions
+ type FromOptions = ContractAddress.from.Options
+ type CreateOptions = ContractAddress.fromCreate.Options
+ type Create2Options = ContractAddress.fromCreate2.Options
```

Address constants moved to the `Address` namespace.

```diff
- import { ethAddress, zeroAddress } from 'viem'
+ import { Address } from 'viem'

- const recipient = zeroAddress
+ const recipient = Address.zero
- const native = ethAddress
+ const native = Address.ether
```
