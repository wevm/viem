import type { Address } from 'abitype'
import { Hex } from 'ox'
import type { Client } from '../../../clients/createClient.js'
import { zeroAddress } from '../../../constants/address.js'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import * as ExecutionError from '../../ExecutionError.js'
import type * as Store from './cache.js'
import { resolveTokenMetadata } from './feeToken.js'
import { simulateAndParseDiffs } from './simulate.js'
import * as Utils from './utils.js'
import { extractCalls, resolveVirtualAddresses } from './virtualAddress.js'

/** Distinguishes execution reverts from transport and plugin failures. */
export function isExecutionError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false

  const seen = new Set<unknown>()
  const pending: unknown[] = [error]
  while (pending.length) {
    const current = pending.pop()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)

    const candidate = current as Record<string, unknown>
    if (
      candidate.code === 3 ||
      candidate.name === 'UpstreamRevertError' ||
      candidate.name === 'ExecutionRevertedError' ||
      candidate.name === 'ContractFunctionRevertedError' ||
      [candidate.message, candidate.details].some(
        (message) =>
          typeof message === 'string' && /^execution reverted\b/i.test(message),
      )
    )
      return true

    pending.push(candidate.cause, candidate.error)
  }
  return false
}

export async function formatError(
  error: Error,
  parameters: Record<string, unknown>,
  client: Client,
  simulateStore?: Store.Store,
) {
  const revert = ExecutionError.from(error)

  const stub = {
    from: parameters.from,
    to: parameters.to ?? null,
    gas: '0x0',
    nonce: '0x0',
    value: '0x0',
    maxFeePerGas: '0x0',
    maxPriorityFeePerGas: '0x0',
  }

  if (revert.errorName === 'InsufficientBalance' && revert.args?.length === 3) {
    const [available, required, token] = revert.args

    const normalized = Utils.normalizeFillTransactionRequest(parameters)

    // Simulate from zero address for optimistic balance diffs.
    const optimisticCalls = normalized ? extractCalls(normalized) : undefined
    const [{ balanceDiffs, tokenMetadata }, virtualAddresses] = optimisticCalls
      ? await Promise.all([
          simulateAndParseDiffs(client, {
            account: zeroAddress,
            calls: optimisticCalls,
            store: simulateStore,
          }),
          resolveVirtualAddresses(client, { calls: optimisticCalls }).catch(
            () => undefined,
          ),
        ])
      : [{ balanceDiffs: undefined, tokenMetadata: undefined }, undefined]

    // Re-key balance diffs from zero address to the real sender.
    const senderDiffs =
      parameters.from && balanceDiffs
        ? { [parameters.from as Address]: balanceDiffs[zeroAddress] ?? [] }
        : balanceDiffs

    const metadata = await resolveTokenMetadata(client, {
      token,
      tokenMetadata,
      store: simulateStore,
    }).catch(() => undefined)
    const deficit = required - available

    return {
      tx: stub,
      capabilities: {
        balanceDiffs: senderDiffs,
        error: ExecutionError.serialize(revert),
        insufficientFunds: metadata
          ? {
              amount: Hex.fromNumber(deficit) as `0x${string}`,
              decimals: metadata.decimals,
              formatted: formatUnits(deficit, metadata.decimals),
              token,
              symbol: metadata.symbol,
            }
          : undefined,
        sponsored: false,
        ...(virtualAddresses ? { virtualAddresses } : {}),
      },
    }
  }

  const normalized = Utils.normalizeFillTransactionRequest(parameters)
  const virtualAddresses = normalized
    ? await resolveVirtualAddresses(client, {
        calls: extractCalls(normalized),
      }).catch(() => undefined)
    : undefined

  return {
    tx: stub,
    capabilities: {
      error: ExecutionError.serialize(revert),
      sponsored: false,
      ...(virtualAddresses ? { virtualAddresses } : {}),
    },
  }
}
