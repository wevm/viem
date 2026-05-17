// TODO: Find opportunities to make this file less duplicated + more simplified with Viem v3.

import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import {
  Transaction as ox_Transaction,
  TransactionRequest as ox_TransactionRequest,
} from 'ox/tempo'
import type { Account as viem_Account } from '../accounts/types.js'
import { parseAccount } from '../accounts/utils/parseAccount.js'
import { formatTransaction as viem_formatTransaction } from '../utils/formatters/transaction.js'
import { formatTransactionReceipt as viem_formatTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { formatTransactionRequest as viem_formatTransactionRequest } from '../utils/formatters/transactionRequest.js'
import type { Account } from './Account.js'
import {
  isTempo,
  type Transaction,
  type TransactionReceipt,
  type TransactionReceiptRpc,
  type TransactionRequest,
  type TransactionRequestRpc,
  type TransactionRpc,
} from './Transaction.js'

export function formatTransaction(
  transaction: TransactionRpc,
): Transaction<bigint, number, boolean> {
  if (!isTempo(transaction)) return viem_formatTransaction(transaction as never)

  // TODO: upstream `blockTimestamp` formatting into `ox`.
  const blockTimestamp =
    transaction.blockTimestamp == null
      ? undefined
      : BigInt(transaction.blockTimestamp)
  const {
    feePayerSignature,
    gasPrice: _,
    nonce,
    ...tx
  } = ox_Transaction.fromRpc(transaction as never) as ox_Transaction.Tempo

  return {
    ...tx,
    accessList: tx.accessList!,
    ...(typeof blockTimestamp !== 'undefined' && { blockTimestamp }),
    feePayerSignature: feePayerSignature
      ? {
          r: Hex.fromNumber(feePayerSignature.r, { size: 32 }),
          s: Hex.fromNumber(feePayerSignature.s, { size: 32 }),
          v: BigInt(feePayerSignature.v ?? 27),
          yParity: feePayerSignature.yParity,
        }
      : undefined,
    nonce: Number(nonce),
    typeHex:
      ox_Transaction.toRpcType[
        tx.type as keyof typeof ox_Transaction.toRpcType
      ],
    type: tx.type as 'tempo',
  }
}

export function formatTransactionReceipt(
  receipt: TransactionReceiptRpc,
): TransactionReceipt {
  return viem_formatTransactionReceipt(receipt as never)
}

export function formatTransactionRequest(
  r: TransactionRequest,
  action?: string | undefined,
): TransactionRequestRpc {
  const request = r as TransactionRequest & {
    account?: viem_Account | Address | undefined
    feePayerSignature?:
      | { r: Hex.Hex; s: Hex.Hex; yParity: number; v?: number | undefined }
      | null
      | undefined
    keyData?: Hex.Hex | undefined
    keyId?: Address | undefined
    keyType?: 'p256' | 'secp256k1' | 'webAuthn' | undefined
  }
  const account = request.account
    ? parseAccount<Account | viem_Account | Address>(request.account)
    : undefined

  // If the request is not a Tempo transaction, route to Viem formatter.
  if (!isTempo(request))
    return viem_formatTransactionRequest(
      r as never,
      action,
    ) as TransactionRequestRpc

  if (action)
    request.calls = request.calls ?? [
      {
        to:
          r.to ||
          (!r.data || r.data === '0x'
            ? '0x0000000000000000000000000000000000000000'
            : undefined),
        value: r.value,
        data: r.data,
      },
    ]

  // If we have marked the transaction as intended to be paid by a fee
  // payer (feePayer: true), we strip the fee token from the sender's
  // sign payload — per TIP-76 the sender does not commit to it; the fee
  // payer chooses and commits to the token via its own signature.
  //
  // Once the fee payer has signed (`feePayerSignature` is populated),
  // the relay has chosen a token and signed over it. The broadcast
  // envelope must therefore include `feeToken` so the chain can verify
  // the fee payer's signature and identify which token to charge.
  if (request.feePayer === true && !request.feePayerSignature)
    delete request.feeToken

  const rpc = ox_TransactionRequest.toRpc({
    ...request,
    type: 'tempo',
  } as never)

  if (action === 'estimateGas') {
    rpc.maxFeePerGas = undefined
    rpc.maxPriorityFeePerGas = undefined
  }

  rpc.to = undefined
  rpc.data = undefined
  rpc.value = undefined

  const [keyType, keyData] = (() => {
    const type =
      account && 'keyType' in account ? account.keyType : account?.source
    if (!type) return [request.keyType, shimKeyData(request.keyData)]
    if (type === 'webAuthn')
      // Send a 2-byte big-endian length hint (1400 = 0x0578) instead of a
      // 1400-byte dummy blob.  The node's gas estimator expects key_data to
      // be 1, 2, or 4 bytes encoding the desired WebAuthn signature size;
      // anything else falls back to the 800-byte default.
      return ['webAuthn', '0x0578']
    if (['p256', 'secp256k1'].includes(type)) return [type, undefined]
    return [request.keyType, shimKeyData(request.keyData)]
  })()

  const keyId =
    account && 'accessKeyAddress' in account
      ? account.accessKeyAddress
      : request.keyId

  if (account) rpc.from = account.address

  return {
    ...rpc,
    ...(request.capabilities ? { capabilities: request.capabilities } : {}),
    ...(keyData ? { keyData } : {}),
    ...(keyId ? { keyId } : {}),
    ...(keyType ? { keyType } : {}),
    ...(typeof request.feePayer !== 'undefined'
      ? {
          feePayer:
            typeof request.feePayer === 'object'
              ? parseAccount(request.feePayer)
              : request.feePayer,
        }
      : {}),
    ...('feePayerSignature' in request &&
    request.feePayerSignature !== undefined
      ? { feePayerSignature: request.feePayerSignature }
      : {}),
  } as never
}

/**
 * Auto-shim user-provided keyData that is longer than 4 bytes into a
 * 2-byte big-endian length hint.  The node gas estimator only accepts
 * 1, 2, or 4-byte key_data as a size hint; anything else silently falls
 * back to the 800-byte default.
 */
function shimKeyData(data: Hex.Hex | undefined): Hex.Hex | undefined {
  if (!data) return data
  const byteLength = (data.length - 2) / 2 // subtract "0x" prefix
  if (byteLength <= 4) return data
  return Hex.fromNumber(byteLength, { size: 2 })
}
