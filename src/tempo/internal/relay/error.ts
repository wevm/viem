import type { Address } from 'abitype'
import { Hex } from 'ox'
import type { Client } from '../../../clients/createClient.js'
import { zeroAddress } from '../../../constants/address.js'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import type * as Store from './cache.js'
import * as ExecutionError from './executionError.js'
import { resolveTokenMetadata } from './feeToken.js'
import { simulateAndParseDiffs } from './simulate.js'
import * as Utils from './utils.js'
import { extractCalls, resolveVirtualAddresses } from './virtualAddress.js'

export async function formatError(
  error: Error,
  parameters: Record<string, unknown>,
  client: Client,
  simulateStore?: Store.Store,
) {
  const revert = ExecutionError.parse(error)

  const stub = {
    from: parameters.from,
    to: parameters.to ?? null,
    gas: '0x0',
    nonce: '0x0',
    value: '0x0',
    maxFeePerGas: '0x0',
    maxPriorityFeePerGas: '0x0',
  }

  if (revert?.errorName === 'InsufficientBalance') {
    const args = revert.args as [bigint, bigint, Address]
    const [available, required, token] = args

    const normalized = Utils.normalizeFillTransactionRequest(parameters)

    // Simulate from zero address for optimistic balance diffs.
    const optimisticCalls = normalized ? extractCalls(normalized) : undefined
    const [{ balanceDiffs }, virtualAddresses] = optimisticCalls
      ? await Promise.all([
          simulateAndParseDiffs(client, {
            account: zeroAddress,
            calls: optimisticCalls,
            store: simulateStore,
          }),
          resolveVirtualAddresses(client, { calls: optimisticCalls }),
        ])
      : [{ balanceDiffs: undefined }, undefined]

    // Re-key balance diffs from zero address to the real sender.
    const senderDiffs =
      parameters.from && balanceDiffs
        ? { [parameters.from as Address]: balanceDiffs[zeroAddress] ?? [] }
        : balanceDiffs

    const metadata = await resolveTokenMetadata(client, {
      token,
      store: simulateStore,
    }).catch(() => undefined)
    const deficit = required - available
    return {
      tx: stub,
      capabilities: {
        balanceDiffs: senderDiffs,
        error: ExecutionError.serialize(revert),
        requireFunds: metadata
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
