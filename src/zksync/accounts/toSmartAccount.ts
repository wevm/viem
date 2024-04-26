import type { Address } from 'abitype'
import { type ToAccountErrorType, toAccount } from '../../accounts/toAccount.js'
import { type SignMessageErrorType } from '../../accounts/utils/signMessage.js'
import { type SignTransactionErrorType } from '../../accounts/utils/signTransaction.js'
import { type SignTypedDataErrorType } from '../../accounts/utils/signTypedData.js'
import type { ErrorType } from '../../errors/utils.js'
import type { LocalAccount } from '../../types/account.js'
import type { Hash } from '../../types/misc.js'
import type { ToHexErrorType } from '../../utils/encoding/toHex.js'
import {
  hashMessage,
  hashTypedData,
  keccak256,
  serializeTransaction,
} from '../../utils/index.js'

export type SmartAccount = LocalAccount<'zkSyncSmartAccount'>

export type ToSmartAccountParams = {
  address: Address
}

export type SmartAccountParams<
  TSignPayloadType extends Object = Hash,
  TSignReturnType extends Object = Hash,
> = ToSmartAccountParams & {
  signPayload: (payload: TSignPayloadType) => Promise<TSignReturnType>
}

export type ToSmartAccountErrorType =
  | ToAccountErrorType
  | ToHexErrorType
  | SignMessageErrorType
  | SignTransactionErrorType
  | SignTypedDataErrorType
  | ErrorType

export function toSmartAccount({
  address,
  signPayload,
}: SmartAccountParams): SmartAccount {
  const account = toAccount({
    address,
    async signMessage({ message }) {
      return await signPayload(hashMessage(message))
    },
    async signTransaction(transaction, { serializer } = {}) {
      return await signPayload(
        keccak256(
          serializer
            ? serializer(transaction)
            : serializeTransaction(transaction),
        ),
      )
    },
    async signTypedData(typedData) {
      return await signPayload(hashTypedData(typedData))
    },
  })

  return {
    ...account,
    source: 'zkSyncSmartAccount',
  }
}
