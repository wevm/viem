import type { Address } from 'abitype'

import { toAccount } from '../../accounts/toAccount.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hash, Hex } from '../../types/misc.js'
import { keccak256 } from '../../utils/index.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import { serializeTransaction } from '../serializers.js'
import type { ZksyncSmartAccount } from '../types/account.js'
import type { ZksyncTransactionSerializableEIP712 } from '../types/transaction.js'

export type ToSmartAccountParameters = {
  /** Address of the deployed Account's Contract implementation. */
  address: Address
  /** Function to sign a hash. */
  sign: (parameters: { hash: Hash }) => Promise<Hex>
}

export type ToSmartAccountErrorType = ErrorType

/**
 * Creates a [ZKsync Smart Account](https://docs.zksync.io/build/developer-reference/account-abstraction/building-smart-accounts)
 * from a Contract Address and a custom sign function.
 */
export function toSmartAccount(
  parameters: ToSmartAccountParameters,
): ZksyncSmartAccount {
  const { address, sign } = parameters

  const account = toAccount({
    address,
    sign,
    async signMessage({ message }) {
      return sign({
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
        customSignature: await sign({
          hash: keccak256(serializeTransaction(signableTransaction)),
        }),
      })
    },
    async signTypedData(typedData) {
      return sign({
        hash: hashTypedData(typedData),
      })
    },
  })

  return {
    ...account,
    source: 'smartAccountZksync',
  } as ZksyncSmartAccount
}
