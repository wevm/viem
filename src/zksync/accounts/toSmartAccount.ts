import type { Address } from 'abitype'

import { toAccount } from '../../accounts/toAccount.js'
import type { LocalAccount } from '../../accounts/types.js'
import type { ErrorType } from '../../errors/utils.js'
import { concatHex } from '../../utils/data/concat.js'
import { keccak256 } from '../../utils/index.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import { serializeTransaction } from '../serializers.js'
import type { ZksyncSmartAccount } from '../types/account.js'
import type { ZksyncTransactionSerializableEIP712 } from '../types/transaction.js'

export type ToSmartAccountParameters = {
  /** Address of the deployed Account's Contract implementation. */
  address: Address
  /** Owners of the Smart Account. */
  owners: readonly LocalAccount[]
}

export type ToSmartAccountErrorType = ErrorType

/**
 * @description Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts) from a Contract Address and an array of owner(s).
 *
 * @returns A ZKsync Smart Account.
 */
export function toSmartAccount(
  parameters: ToSmartAccountParameters,
): ZksyncSmartAccount {
  const { address, owners } = parameters

  const account = toAccount({
    address,
    async sign({ hash }) {
      return concatHex(
        await Promise.all(owners.map((owner) => owner.sign!({ hash }))),
      )
    },
    async signMessage({ message }) {
      return this.sign!({
        hash: hashMessage(message),
      })
    },
    async signTransaction(transaction) {
      const signableTransaction = {
        ...transaction,
        from: this.address!,
      } as ZksyncTransactionSerializableEIP712

      return serializeTransaction({
        ...signableTransaction,
        customSignature: await this.sign!({
          hash: keccak256(serializeTransaction(signableTransaction)),
        }),
      })
    },
    async signTypedData(typedData) {
      return this.sign!({
        hash: hashTypedData(typedData),
      })
    },
  })

  return {
    ...account,
    source: 'smartAccountZksync',
  } as ZksyncSmartAccount
}
