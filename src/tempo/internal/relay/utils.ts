import { Hex, RpcResponse } from 'ox'
import {
  Transaction as core_Transaction,
  KeyAuthorization,
  TxEnvelopeTempo,
} from 'ox/tempo'
import type { Client } from '../../../clients/createClient.js'

export function resolveChainId(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string') {
    if (Hex.validate(value)) return Hex.toNumber(value)
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return undefined
}

export function formatFillTransactionRequest(
  client: Client,
  value: Record<string, unknown>,
) {
  const format = client.chain?.formatters?.transactionRequest?.format
  if (!format) return value
  return format({ ...value } as never, 'fillTransaction') as Record<
    string,
    unknown
  >
}

export function normalizeFillTransactionRequest(
  tx: Record<string, unknown>,
): Record<string, unknown> & { calls: unknown[] } {
  const { to, data, value, ...rest } = tx
  const keyAuthorization = normalizeKeyAuthorization(tx.keyAuthorization)
  const withKeyAuthorization = keyAuthorization ? { keyAuthorization } : {}
  if (Array.isArray(tx.calls) && tx.calls.length > 0)
    return {
      ...tx,
      ...withKeyAuthorization,
      calls: tx.calls.map((call) => ({
        ...call,
        value: normalizeFillValue(call.value),
      })),
    }
  const call = {
    ...(typeof to !== 'undefined' ? { to } : {}),
    ...(typeof data !== 'undefined' ? { data } : {}),
    ...(typeof value !== 'undefined'
      ? { value: normalizeFillValue(value) }
      : {}),
  }
  return { ...rest, ...withKeyAuthorization, calls: [call] }
}

/**
 * Forwards `keyAuthorization` to the chain in RPC shape. Pass-through
 * when already RPC; convert via `KeyAuthorization.toRpc` when internal.
 */
function normalizeKeyAuthorization(value: unknown) {
  if (!value || typeof value !== 'object') return undefined
  const ka = value as Record<string, unknown>
  const signature = ka.signature as Record<string, unknown> | undefined
  if (!signature || typeof signature !== 'object') return undefined
  const isInternal =
    typeof signature.signature === 'object' && signature.signature !== null
  return isInternal ? KeyAuthorization.toRpc(value as never) : value
}

function normalizeFillValue(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('0x')) return value
  return BigInt(value === '0x' ? '0x0' : value)
}

/** Returns whether a raw transaction uses a Tempo sender or fee-payer wire prefix. */
export function isSerializedTempoTransaction(
  value: unknown,
): value is `0x76${string}` | `0x78${string}` {
  if (typeof value !== 'string') return false
  // `0x78` is Tempo's fee-payer handoff magic, not a separate EIP-2718 type.
  return (
    value.startsWith(TxEnvelopeTempo.serializedType) ||
    value.startsWith(TxEnvelopeTempo.feePayerMagic)
  )
}

export function normalizeTempoTransaction(
  value: Record<string, unknown> | undefined,
) {
  if (!value) throw new Error('Expected `tx` in eth_fillTransaction response.')
  return core_Transaction.fromRpc({
    type: '0x76',
    ...value,
  } as core_Transaction.Rpc)!
}

/** Preserves upstream RPC errors and the relay's expired-transaction contract. */
export function toRpcError(error: unknown): RpcResponse.BaseError {
  let current: unknown = error
  let deepest: { code: number; message: string; data?: unknown } | undefined
  const seen = new Set<unknown>()
  while (current && typeof current === 'object' && !seen.has(current)) {
    seen.add(current)
    const candidate = current as Record<string, unknown>
    if (
      typeof candidate.code === 'number' &&
      typeof candidate.message === 'string'
    )
      deepest = {
        code: candidate.code,
        message: candidate.message,
        data: candidate.data,
      }
    current = candidate.cause
  }
  if (!deepest)
    return new RpcResponse.InternalError({
      message: 'Internal error',
      data: { code: 'internal_error' },
    })
  if (
    deepest.code === -32603 &&
    /^Revm error: transaction expired(?:\.|: .+)?$/.test(deepest.message)
  )
    return new RpcResponse.TransactionRejectedError({
      message: 'Transaction expired.',
      data: { code: 'transaction_expired' },
    })
  return new RpcResponse.BaseError(deepest)
}

/** Preserves envelope inputs omitted by the node, including calls and chain ID. Filled fields take precedence; legacy calls are normalized separately. */
export function mergeCallsFromRequest(
  resultTx: Record<string, unknown>,
  request: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...request, ...resultTx }
  const resultCalls = resultTx.calls
  if (Array.isArray(resultCalls) && resultCalls.length > 0) return merged

  const reqCalls = request.calls
  if (Array.isArray(reqCalls) && reqCalls.length > 0) {
    merged.calls = reqCalls
    return merged
  }

  const { to, data, value } = request
  if (
    typeof to === 'undefined' &&
    typeof data === 'undefined' &&
    typeof value === 'undefined'
  )
    return merged

  merged.calls = [
    {
      ...(typeof to !== 'undefined' ? { to } : {}),
      ...(typeof data !== 'undefined' ? { data } : {}),
      ...(typeof value !== 'undefined' ? { value } : {}),
    },
  ]
  return merged
}
