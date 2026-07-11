---
"viem": major
---

Address checksum and validation utilities moved from flat utilities to the `Address` namespace.

```diff
- import { getAddress, isAddress, isAddressEqual } from 'viem'
+ import { Address } from 'viem'

- const address = getAddress('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
- const valid = isAddress(address)
- const equal = isAddressEqual(address, otherAddress)
+ const address = Address.checksum('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
+ const valid = Address.validate(address)
+ const equal = Address.isEqual(address, otherAddress)
```

Contract address derivation utilities moved from flat utilities to the `ContractAddress` namespace.

```diff
- import { getContractAddress, getCreate2Address, getCreateAddress } from 'viem'
+ import { ContractAddress } from 'viem'

- const create = getCreateAddress({ from, nonce })
- const create2 = getCreate2Address({ from, salt, bytecodeHash })
- const derived = getContractAddress({ from, nonce })
+ const create = ContractAddress.fromCreate({ from, nonce })
+ const create2 = ContractAddress.fromCreate2({ from, salt, bytecodeHash })
+ const derived = ContractAddress.from({ from, nonce })
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
