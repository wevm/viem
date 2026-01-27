// TODO: Find opportunities to make this file less duplicated + more simplified with Viem v3.

import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import {
  type AuthorizationTempo,
  type KeyAuthorization,
  type TransactionReceipt as ox_TransactionReceipt,
  SignatureEnvelope,
  TxEnvelopeTempo as TxTempo,
} from 'ox/tempo'
import type { Account } from '../accounts/types.js'
import type { FeeValuesEIP1559 } from '../types/fee.js'
import type { Signature as viem_Signature } from '../types/misc.js'
import type {
  RpcTransaction as viem_RpcTransaction,
  RpcTransactionRequest as viem_RpcTransactionRequest,
} from '../types/rpc.js'
import type {
  AccessList,
  TransactionBase,
  TransactionRequestBase,
  TransactionSerializableBase,
  TransactionSerializedGeneric,
  Transaction as viem_Transaction,
  TransactionReceipt as viem_TransactionReceipt,
  TransactionRequest as viem_TransactionRequest,
  TransactionSerializable as viem_TransactionSerializable,
  TransactionSerialized as viem_TransactionSerialized,
  TransactionType as viem_TransactionType,
} from '../types/transaction.js'
import type { ExactPartial, OneOf, PartialBy } from '../types/utils.js'
import { getTransactionType as viem_getTransactionType } from '../utils/transaction/getTransactionType.js'
import {
  type ParseTransactionReturnType,
  parseTransaction as viem_parseTransaction,
} from '../utils/transaction/parseTransaction.js'
import { serializeTransaction as viem_serializeTransaction } from '../utils/transaction/serializeTransaction.js'

export type Transaction<
  bigintType = bigint,
  numberType = number,
  pending extends boolean = false,
> = OneOf<
  | viem_Transaction<bigintType, numberType, pending>
  | TransactionTempo<bigintType, numberType, pending>
>
export type TransactionRpc<pending extends boolean = false> = OneOf<
  | viem_RpcTransaction<pending>
  | (Omit<
      TransactionTempo<Hex.Hex, Hex.Hex, pending, '0x76'>,
      'authorizationList' | 'keyAuthorization' | 'signature'
    > & {
      authorizationList?: AuthorizationTempo.ListRpc | undefined
      keyAuthorization?: KeyAuthorization.Rpc | null | undefined
      signature: SignatureEnvelope.SignatureEnvelopeRpc
    })
>

export type TransactionTempo<
  quantity = bigint,
  index = number,
  isPending extends boolean = boolean,
  type = 'tempo',
> = PartialBy<
  Omit<TransactionBase<quantity, index, isPending>, 'input' | 'value' | 'to'>,
  'r' | 's' | 'v' | 'yParity'
> & {
  accessList: AccessList
  authorizationList?: AuthorizationTempo.ListSigned<quantity, index> | undefined
  calls: readonly TxTempo.Call<quantity>[]
  chainId: index
  feeToken?: Address | undefined
  feePayerSignature?: viem_Signature | undefined
  keyAuthorization?: KeyAuthorization.Signed<quantity, index> | null | undefined
  nonceKey?: quantity | undefined
  signature: SignatureEnvelope.SignatureEnvelope
  type: type
  validBefore?: index | undefined
  validAfter?: index | undefined
} & FeeValuesEIP1559<quantity>

export type TransactionRequest<
  bigintType = bigint,
  numberType = number,
> = OneOf<
  | viem_TransactionRequest<bigintType, numberType>
  | TransactionRequestTempo<bigintType, numberType>
>
export type TransactionRequestRpc = OneOf<
  viem_RpcTransactionRequest | TransactionRequestTempo<Hex.Hex, Hex.Hex, '0x76'>
>

export type TransactionReceipt<
  quantity = bigint,
  index = number,
  status = 'success' | 'reverted',
  type = TransactionType,
> = viem_TransactionReceipt<quantity, index, status, type> & {
  feePayer?: Address | undefined
  feeToken?: Address | undefined
}

export type TransactionReceiptRpc = TransactionReceipt<
  Hex.Hex,
  Hex.Hex,
  ox_TransactionReceipt.RpcStatus,
  ox_TransactionReceipt.RpcType
>

export type TransactionRequestTempo<
  quantity = bigint,
  index = number,
  type = 'tempo',
> = TransactionRequestBase<quantity, index, type> &
  ExactPartial<FeeValuesEIP1559<quantity>> & {
    accessList?: AccessList | undefined
    keyAuthorization?: KeyAuthorization.Signed<quantity, index> | undefined
    calls?: readonly TxTempo.Call<quantity>[] | undefined
    feePayer?: Account | true | undefined
    feeToken?: Address | bigint | undefined
    nonceKey?: 'random' | quantity | undefined
    validBefore?: index | undefined
    validAfter?: index | undefined
  }

export type TransactionSerializable = OneOf<
  viem_TransactionSerializable | TransactionSerializableTempo
>

export type TransactionSerializableTempo<
  quantity = bigint,
  index = number,
> = TransactionSerializableBase<quantity, index> &
  ExactPartial<FeeValuesEIP1559<quantity>> & {
    accessList?: AccessList | undefined
    calls: readonly TxTempo.Call<quantity>[]
    chainId: number
    feeToken?: Address | bigint | undefined
    feePayerSignature?: viem_Signature | null | undefined
    keyAuthorization?: KeyAuthorization.Signed<quantity, index> | undefined
    nonceKey?: quantity | undefined
    signature?: SignatureEnvelope.SignatureEnvelope<quantity, index> | undefined
    validBefore?: index | undefined
    validAfter?: index | undefined
    type?: 'tempo' | undefined
  }

export type TransactionSerialized<
  type extends TransactionType = TransactionType,
> = viem_TransactionSerialized<type> | TransactionSerializedTempo

export type TransactionSerializedTempo = `0x76${string}`

export type TransactionType = viem_TransactionType | 'tempo'

export function getType(
  transaction: Record<string, unknown>,
): Transaction['type'] {
  const account = transaction.account as
    | { keyType?: string | undefined }
    | undefined
  if (
    (account?.keyType && account.keyType !== 'secp256k1') ||
    typeof transaction.calls !== 'undefined' ||
    typeof transaction.feePayer !== 'undefined' ||
    typeof transaction.feeToken !== 'undefined' ||
    typeof transaction.keyAuthorization !== 'undefined' ||
    typeof transaction.nonceKey !== 'undefined' ||
    typeof transaction.signature !== 'undefined' ||
    typeof transaction.validBefore !== 'undefined' ||
    typeof transaction.validAfter !== 'undefined'
  )
    return 'tempo' as never
  if (transaction.type) return transaction.type as never
  return viem_getTransactionType(transaction) as never
}

export function isTempo(transaction: Record<string, unknown>) {
  try {
    const type = getType(transaction)
    return type === 'tempo'
  } catch {
    return false
  }
}

export function deserialize<
  const serialized extends TransactionSerializedGeneric,
>(serializedTransaction: serialized): deserialize.ReturnValue<serialized> {
  const type = Hex.slice(serializedTransaction, 0, 1)
  if (type === '0x76') {
    const from =
      Hex.slice(serializedTransaction, -6) === '0xfeefeefeefee'
        ? Hex.slice(serializedTransaction, -26, -6)
        : undefined
    return {
      ...deserializeTempo(serializedTransaction as `0x76${string}`),
      from,
    } as never
  }
  return viem_parseTransaction(serializedTransaction) as never
}

export declare namespace deserialize {
  export type ReturnValue<
    serialized extends
      TransactionSerializedGeneric = TransactionSerializedGeneric,
  > = serialized extends TransactionSerializedTempo
    ? TransactionSerializableTempo
    : ParseTransactionReturnType<serialized>
}

export async function serialize(
  transaction: TransactionSerializable & {
    feePayer?: Account | true | undefined
    from?: Address | undefined
  },
  signature?:
    | OneOf<SignatureEnvelope.SignatureEnvelope | viem_Signature>
    | undefined,
) {
  // If the transaction is not a Tempo transaction, route to Viem serializer.
  if (!isTempo(transaction)) {
    if (signature && 'type' in signature && signature.type !== 'secp256k1')
      throw new Error(
        'Unsupported signature type. Expected `secp256k1` but got `' +
          signature.type +
          '`.',
      )
    if (signature && 'type' in signature) {
      const { r, s, yParity } = signature?.signature!
      return viem_serializeTransaction(transaction as never, {
        r: Hex.fromNumber(r, { size: 32 }),
        s: Hex.fromNumber(s, { size: 32 }),
        yParity,
      })
    }
    return viem_serializeTransaction(transaction as never, signature)
  }

  const type = getType(transaction)
  if (type === 'tempo')
    return serializeTempo(
      transaction as TransactionSerializableTempo,
      signature,
    )

  throw new Error('Unsupported transaction type')
}

////////////////////////////////////////////////////////////////////////////////////
// Internal

/** @internal */
function deserializeTempo(
  serializedTransaction: TransactionSerializedTempo,
): TransactionSerializableTempo {
  const { feePayerSignature, nonce, ...tx } = TxTempo.deserialize(
    serializedTransaction,
  )
  return {
    ...tx,
    nonce: Number(nonce ?? 0n),
    feePayerSignature: feePayerSignature
      ? {
          r: Hex.fromNumber(feePayerSignature.r, { size: 32 }),
          s: Hex.fromNumber(feePayerSignature.s, { size: 32 }),
          yParity: feePayerSignature.yParity,
        }
      : feePayerSignature,
  } satisfies TransactionSerializableTempo
}

/** @internal */
async function serializeTempo(
  transaction: TransactionSerializableTempo & {
    feePayer?: Account | true | undefined
    from?: Address | undefined
  },
  sig?: OneOf<SignatureEnvelope.SignatureEnvelope | viem_Signature> | undefined,
) {
  const signature = (() => {
    if (transaction.signature) return transaction.signature
    if (sig && 'type' in sig) return sig as SignatureEnvelope.SignatureEnvelope
    if (sig)
      return SignatureEnvelope.from({
        r: BigInt(sig.r!),
        s: BigInt(sig.s!),
        yParity: Number(sig.yParity!),
      })
    return undefined
  })()

  const { chainId, feePayer, feePayerSignature, nonce, ...rest } = transaction

  const transaction_ox = {
    ...rest,
    calls: rest.calls?.length
      ? rest.calls
      : [
          {
            to:
              rest.to ||
              (!rest.data || rest.data === '0x'
                ? '0x0000000000000000000000000000000000000000'
                : undefined),
            value: rest.value,
            data: rest.data,
          },
        ],
    chainId: Number(chainId),
    feePayerSignature: feePayerSignature
      ? {
          r: BigInt(feePayerSignature.r!),
          s: BigInt(feePayerSignature.s!),
          yParity: Number(feePayerSignature.yParity),
        }
      : feePayer
        ? null
        : undefined,
    type: 'tempo',
    ...(nonce ? { nonce: BigInt(nonce) } : {}),
  } satisfies TxTempo.TxEnvelopeTempo

  // If we have marked the transaction as intended to be paid
  // by a fee payer (feePayer: true), we will not use the fee token
  // as the fee payer will choose their fee token.
  if (feePayer === true) delete transaction_ox.feeToken

  if (signature && typeof transaction.feePayer === 'object') {
    const tx = TxTempo.from(transaction_ox, {
      signature,
    })

    const sender = (() => {
      if (transaction.from) return transaction.from
      if (signature.type === 'secp256k1')
        return Secp256k1.recoverAddress({
          payload: TxTempo.getSignPayload(tx),
          signature: signature.signature,
        })
      throw new Error('Unable to extract sender from transaction or signature.')
    })()

    const hash = TxTempo.getFeePayerSignPayload(tx, {
      sender,
    })

    const feePayerSignature = await transaction.feePayer.sign!({
      hash,
    })

    return TxTempo.serialize(tx, {
      feePayerSignature: Signature.from(feePayerSignature),
    })
  }

  if (feePayer === true) {
    const serialized = TxTempo.serialize(transaction_ox, {
      feePayerSignature: null,
      signature,
    })
    // if the transaction is ready to be sent off (signed), add the sender
    // and a fee marker to the serialized transaction, so the fee payer proxy
    // can infer the sender address.
    if (transaction.from && signature)
      return Hex.concat(serialized, transaction.from, '0xfeefeefeefee')
    return serialized
  }

  return TxTempo.serialize(
    // If we have specified a fee payer, the user will not be signing over the fee token.
    // Defer the fee token signing to the fee payer.
    { ...transaction_ox, ...(feePayer ? { feeToken: undefined } : {}) },
    {
      feePayerSignature: undefined,
      signature,
    },
  )
}

// Export types required for inference.
// biome-ignore lint/performance/noBarrelFile: _
export {
  /** @deprecated */
  KeyAuthorization as z_KeyAuthorization,
  /** @deprecated */
  SignatureEnvelope as z_SignatureEnvelope,
  /** @deprecated */
  TxEnvelopeTempo as z_TxEnvelopeTempo,
} from 'ox/tempo'
