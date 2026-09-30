import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import { BaseError, type BaseErrorType } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import * as FrameTransaction from '../../frames/internal/transaction.js'
import type { Hex } from '../../types/misc.js'
import type {
  TransactionSerializable,
  TransactionSerialized,
} from '../../types/transaction.js'
import type { MaybePromise } from '../../types/utils.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import {
  type SerializeTransactionFn,
  serializeTransaction,
} from '../../utils/transaction/serializeTransaction.js'
import { signFrameTransaction } from './internal/signFrameTransaction.js'

import { privateKeyToAddress } from './privateKeyToAddress.js'
import { type SignErrorType, sign } from './sign.js'

export type SignTransactionParameters<
  serializer extends (
    ...args: never[]
  ) => MaybePromise<Hex> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
> = {
  privateKey: Hex
  transaction: transaction
  serializer?: serializer | undefined
}

export type SignTransactionReturnType<
  serializer extends (
    ...args: never[]
  ) => MaybePromise<Hex> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
> = TransactionSerialized<GetTransactionType<transaction>>

export type SignTransactionErrorType =
  | BaseErrorType
  | Keccak256ErrorType
  | SignErrorType
  | ErrorType

export async function signTransaction<
  serializer extends (
    ...args: never[]
  ) => MaybePromise<Hex> = SerializeTransactionFn<TransactionSerializable>,
  transaction extends Parameters<serializer>[0] = Parameters<serializer>[0],
>(
  parameters: SignTransactionParameters<serializer, transaction>,
): Promise<SignTransactionReturnType<serializer, transaction>> {
  const {
    privateKey,
    transaction: transaction_,
    serializer: serializer_ = serializeTransaction,
  } = parameters
  const serializer = serializer_ as SerializeTransactionFn
  const transaction = FrameTransaction.resolve(
    transaction_ as TransactionSerializable,
  )

  if (FrameTransaction.hasSigningFrames(transaction))
    return (await signFrameTransaction(
      transaction as FrameTransaction.Transaction,
      serializer,
    )) as SignTransactionReturnType<serializer, transaction>

  if (
    transaction.type === 'eip8141' ||
    (!transaction.type && transaction.frames !== undefined)
  ) {
    const {
      from: _from,
      gas: _gas,
      ...envelope
    } = transaction as FrameTransaction.Transaction & {
      from?: Hex | undefined
      gas?: bigint | undefined
    }
    const [entry, ...rest] = envelope.signatures ?? [
      { scheme: 'secp256k1' as const },
    ]
    const address = privateKeyToAddress(privateKey)
    if (
      envelope.sender.toLowerCase() !== address.toLowerCase() ||
      !entry ||
      (entry.scheme !== 'secp256k1' && entry.scheme !== 1) ||
      (entry.signer && entry.signer.toLowerCase() !== address.toLowerCase()) ||
      (entry.payload && entry.payload !== '0x') ||
      (entry.signature !== undefined && entry.signature !== '0x')
    )
      throw new BaseError(
        'Expected an unsigned secp256k1 entry for the transaction sender at signature index 0.',
      )
    if (
      envelope.frames.some(
        (frame) =>
          ((typeof frame.flags === 'number' && (frame.flags & 2) !== 0) ||
            frame.flags === 'approveExecution' ||
            frame.flags === 'approveExecutionAndPayment') &&
          frame.to !== undefined &&
          frame.to.toLowerCase() !== address.toLowerCase(),
      )
    )
      throw new BaseError(
        'Execution approval must target the transaction sender.',
      )

    const signature = await sign({
      hash: TxEnvelopeEip8141.getSignPayload({
        ...envelope,
        signatures: [{ ...entry, signature: undefined }, ...rest],
        nonceKeys: envelope.nonceKeys ?? [0n],
        nonce: BigInt(envelope.nonce ?? 0),
      }),
      privateKey,
    })
    return (await serializer({
      ...envelope,
      signatures: [
        {
          ...entry,
          signature: {
            r: BigInt(signature.r),
            s: BigInt(signature.s),
            yParity: signature.v === 28n ? 1 : 0,
          },
        },
        ...rest,
      ],
    })) as SignTransactionReturnType<serializer, transaction>
  }

  const signableTransaction = (() => {
    // For EIP-4844 Transactions, we want to sign the transaction payload body (tx_payload_body) without the sidecars (ie. without the network wrapper).
    // See: https://github.com/ethereum/EIPs/blob/e00f4daa66bd56e2dbd5f1d36d09fd613811a48b/EIPS/eip-4844.md#networking
    if (transaction.type === 'eip4844')
      return {
        ...transaction,
        sidecars: false as const,
      }
    return transaction
  })()

  const signature = await sign({
    hash: keccak256(await serializer(signableTransaction)),
    privateKey,
  })
  return (await serializer(
    transaction,
    signature,
  )) as SignTransactionReturnType<serializer, transaction>
}
