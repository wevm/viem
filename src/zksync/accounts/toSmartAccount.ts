import type { Address } from 'abitype'

import { toAccount } from '../../accounts/toAccount.js'
import type { LocalAccount } from '../../accounts/types.js'
import type { ErrorType } from '../../errors/utils.js'
import { concatHex } from '../../utils/data/concat.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import { hashMessage } from '../../utils/signature/hashMessage.js'
import { hashTypedData } from '../../utils/signature/hashTypedData.js'
import { serializeTransaction } from '../../utils/transaction/serializeTransaction.js'
import type { ZksyncSmartAccount } from '../types/account.js'

export type ToSmartAccountParameters = {
  address: Address
  owners: readonly LocalAccount[]
}

export type ToSmartAccountErrorType = ErrorType

/**
 * @description Creates an Account from private keys.
 *
 * @returns A Private Key Account.
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
    async signTransaction(transaction, { serializer } = {}) {
      return this.sign!({
        hash: keccak256(
          serializer
            ? serializer(transaction)
            : serializeTransaction(transaction),
        ),
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
