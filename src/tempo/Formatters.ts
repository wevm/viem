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

  const {
    feePayerSignature,
    gasPrice: _,
    nonce,
    ...tx
  } = ox_Transaction.fromRpc(transaction as never) as ox_Transaction.Tempo

  return {
    ...tx,
    accessList: tx.accessList!,
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

  // If we have marked the transaction as intended to be paid
  // by a fee payer (feePayer: true), we will not use the fee token
  // as the fee payer will choose their fee token.
  if (request.feePayer === true) delete request.feeToken

  // Normalize RPC-shaped quantities (e.g. `"0x"`) back to typed values for `ox`.
  const coerceQuantity = (value: unknown) => {
    if (typeof value !== 'string') return value
    if (value === '0x') return 0n
    return Hex.toBigInt(value as Hex.Hex)
  }
  if (typeof request.value !== 'undefined')
    request.value = coerceQuantity(request.value) as never
  if (request.calls?.length)
    request.calls = request.calls.map((call) => {
      const c = call as Record<string, unknown>
      return {
        ...call,
        ...(typeof c.value !== 'undefined'
          ? { value: coerceQuantity(c.value) }
          : {}),
      }
    }) as never

  const rpc = ox_TransactionRequest.toRpc({
    ...request,
    type: 'tempo',
  } as never)

  if (action === 'estimateGas') {
    rpc.maxFeePerGas = undefined
    rpc.maxPriorityFeePerGas = undefined
  }

  // JSON-RPC accounts (wallets) don't support Tempo transactions yet,
  // we will omit the type to attempt to make them compatible
  // with the base transaction structure.
  // TODO: `calls` will not be supported by a lot of JSON-RPC accounts (wallet),
  // use `wallet_sendCalls` or sequential `eth_sendTransaction` to mimic the
  // behavior of `calls`.
  if (account?.type === 'json-rpc') {
    if (rpc.calls?.length && rpc.calls.length > 1)
      throw new Error(
        'Batch calls are not supported with JSON-RPC accounts yet.',
      )
    rpc.data = rpc.calls?.at(0)?.data
    rpc.to = rpc.calls?.at(0)?.to
    rpc.type = undefined
  }

  // We rely on `calls` for Tempo transactions.
  // However, `calls` may not be supported by JSON-RPC accounts (wallets) yet,
  // so we will not remove the `data`, `to`, and `value` fields to make it
  // compatible with the base transaction structure.
  if (account?.type !== 'json-rpc') {
    rpc.to = undefined
    rpc.data = undefined
    rpc.value = undefined
  }

  const [keyType, keyData] = (() => {
    const type =
      account && 'keyType' in account ? account.keyType : account?.source
    if (!type) return [undefined, undefined]
    if (type === 'webAuthn')
      // TODO: derive correct bytes size of key data based on webauthn create metadata.
      return ['webAuthn', `0x${'ff'.repeat(1400)}`]
    if (['p256', 'secp256k1'].includes(type)) return [type, undefined]
    return [undefined, undefined]
  })()

  return {
    ...rpc,
    ...(keyType ? { keyType } : {}),
    ...(keyData ? { keyData } : {}),
    ...(request.feePayer
      ? {
          feePayer:
            typeof request.feePayer === 'object'
              ? parseAccount(request.feePayer)
              : request.feePayer,
        }
      : {}),
  } as never
}
