import type { Address } from 'abitype'
import { type ToAccountErrorType, toAccount } from '../../accounts/toAccount.js'
import { type SignMessageErrorType } from '../../accounts/utils/signMessage.js'
import { type SignTransactionErrorType } from '../../accounts/utils/signTransaction.js'
import { type SignTypedDataErrorType } from '../../accounts/utils/signTypedData.js'
import type { ErrorType } from '../../errors/utils.js'
import type {
  Account,
  GetAccountParameter,
  LocalAccount,
} from '../../types/account.js'
import type { Hash } from '../../types/misc.js'
import type { ToHexErrorType } from '../../utils/encoding/toHex.js'
import {
  type ParseAccountErrorType,
  hashMessage,
  hashTypedData,
  keccak256,
  parseAccount,
  serializeTransaction,
} from '../../utils/index.js'

export type SmartAccount<
  TWalletAccount extends Account | undefined = Account | undefined,
> = LocalAccount<'zkSyncSmartAccount'> & {
  walletAccount?: TWalletAccount
}

export type ToSmartAccountParams<
  TWalletAccount extends Account | undefined = Account | undefined,
  TAccountRequired extends boolean = false,
> = GetAccountParameter<TWalletAccount, undefined, TAccountRequired> & {
  address: Address
}

export type SmartAccountParams<
  TSignPayloadType extends Object = Hash,
  TSignReturnType extends Object = Hash,
> = ToSmartAccountParams & {
  sign: (payload: TSignPayloadType) => Promise<TSignReturnType>
}

export type ToSmartAccountErrorType =
  | ToAccountErrorType
  | ParseAccountErrorType
  | ToHexErrorType
  | SignMessageErrorType
  | SignTransactionErrorType
  | SignTypedDataErrorType
  | ErrorType

export function toSmartAccount({
  address,
  account: account_,
  sign,
}: SmartAccountParams): SmartAccount {
  const account = toAccount({
    address,
    async signMessage({ message }) {
      return await sign(hashMessage(message))
    },
    async signTransaction(transaction, { serializer } = {}) {
      return await sign(
        keccak256(
          serializer
            ? serializer(transaction)
            : serializeTransaction(transaction),
        ),
      )
    },
    async signTypedData(typedData) {
      return await sign(hashTypedData(typedData))
    },
  })

  const walletAccount = account_ ? parseAccount(account_) : undefined

  return {
    ...account,
    walletAccount,
    source: 'zkSyncSmartAccount',
  }
}
