import { type ToAccountErrorType, toAccount } from '../../accounts/toAccount.js'
import { type SignMessageErrorType } from '../../accounts/utils/signMessage.js'
import { type SignTransactionErrorType } from '../../accounts/utils/signTransaction.js'
import { type SignTypedDataErrorType } from '../../accounts/utils/signTypedData.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ToHexErrorType } from '../../utils/encoding/toHex.js'
import { hashMessage, hashTypedData, keccak256 } from '../../utils/index.js'
import type { SmartAccount, SmartAccountParams } from './types.js'

export type ToSmartAccountErrorType =
  | ToAccountErrorType
  | ToHexErrorType
  | SignMessageErrorType
  | SignTransactionErrorType
  | SignTypedDataErrorType
  | ErrorType

export function toSmartAccount({
  address,
  addressAccount,
  sign,
}: SmartAccountParams): SmartAccount {
  const account = toAccount({
    address,
    async signMessage({ message }) {
      return await sign(hashMessage(message))
    },
    async signTransaction(transaction, { serializer } = {}) {
      return await sign(keccak256(serializer!(transaction)))
    },
    async signTypedData(typedData) {
      return await sign(hashTypedData(typedData))
    },
  })

  return {
    ...account,
    addressAccount: addressAccount ?? address,
    source: 'smartAccount',
  }
}
