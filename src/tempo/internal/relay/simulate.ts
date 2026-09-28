import type { Address } from 'abitype'
import { AbiEvent, Hex } from 'ox'
import { simulateCalls } from '../../../actions/public/simulateCalls.js'
import type { Client } from '../../../clients/createClient.js'
import { zeroAddress } from '../../../constants/address.js'
import type { Call } from '../../../types/calls.js'
import type { Log } from '../../../types/log.js'
import { parseEventLogs } from '../../../utils/abi/parseEventLogs.js'
import { formatUnits } from '../../../utils/unit/formatUnits.js'
import * as Abis from '../../Abis.js'
import * as Actions from '../../actions/index.js'
import type * as Capabilities from '../../Capabilities.js'
import type * as Relay from '../../Relay.js'
import type * as Store from './cache.js'
import { formatError, isExecutionError } from './error.js'
import { resolveTokenMetadata } from './feeToken.js'
import * as Plugin from './plugin.js'
import * as Request from './request.js'
import * as Utils from './utils.js'
import { extractCalls } from './virtualAddress.js'

export function create(options: Relay.simulate.Options): Relay.Plugin {
  return Plugin.from((next) =>
    Request.wrap(next, async (request, context) => {
      if (request.method !== 'eth_fillTransaction')
        return next(request, context.options)

      const parameters = request.params![0] as Record<string, unknown>
      const store = context.getStore(options.store)
      const result: Request.Result = await Request.fill(
        context.client,
        Utils.normalizeFillTransactionRequest(parameters),
      ).catch((error) => {
        if (
          isExecutionError(error) &&
          (parameters.capabilities as Record<string, unknown> | undefined)
            ?.errors === true
        )
          return formatError(error, parameters, context.client, store)

        throw error
      })
      if (result.capabilities?.error) return result

      const transaction = Utils.normalizeTempoTransaction(result.tx)
      const feeToken = transaction.feeToken as Address | undefined
      return Request.enrich(result, async () => {
        const simulation =
          (parameters.capabilities as Record<string, unknown> | undefined)
            ?.balanceDiffs !== false
            ? await simulateAndParseDiffs(context.client, {
                account: parameters.from as Address | undefined,
                calls: extractCalls(transaction),
                feeToken,
                gas: transaction.gas,
                maxFeePerGas: transaction.maxFeePerGas,
                store,
              })
            : await computeFee(context.client, {
                feeToken,
                gas: transaction.gas,
                maxFeePerGas: transaction.maxFeePerGas,
                store,
              })
                .catch(() => undefined)
                .then((fee) => ({ balanceDiffs: undefined, fee }))

        return { capabilities: simulation }
      })
    }),
  )
}

// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function simulate(client: Client, options: simulate.Options) {
  const { account, calls } = options
  try {
    return await Actions.simulate.simulateCalls(client, {
      ...(account ? { account } : {}),
      calls: calls as Call[],
      traceTransfers: true,
    })
  } catch (error) {
    // TODO: Remove fallback once all nodes support tempo_simulateV1.
    // Fall back to viem's simulateCalls (eth_simulateV1) if the Tempo
    // method (tempo_simulateV1) is not supported.
    const code =
      (error as { code?: number | undefined }).code ??
      (error as { cause?: { code?: number | undefined } | undefined }).cause
        ?.code
    if (code !== -32601) throw error
    const { results } = await simulateCalls(client, {
      ...(account ? { account } : {}),
      calls: calls as Call[],
    })
    return { results, tokenMetadata: undefined }
  }
}

declare namespace simulate {
  type Options = {
    account?: Address | undefined
    calls: readonly Call[]
  }
}

export async function simulateAndParseDiffs(
  client: Client,
  options: simulateAndParseDiffs.Options,
) {
  const { account, calls, feeToken, gas, store, maxFeePerGas } = options

  try {
    const { results, tokenMetadata } = await simulate(client, {
      account: account === zeroAddress ? undefined : account,
      calls,
    })

    // Collect all logs across all call results.
    const logs: (typeof results)[number]['logs'] = []
    for (const result of results as {
      logs?: (typeof logs)[number][] | undefined
    }[])
      if (result.logs) logs.push(...result.logs)

    // Build per-token balance diffs relative to the sender.
    const balanceDiffs = account
      ? await buildBalanceDiffs(client, {
          account,
          store,
          logs,
          tokenMetadata: tokenMetadata as never,
        })
      : {}

    // Compute fee breakdown.
    const fee = await computeFee(client, {
      feeToken,
      gas,
      store,
      maxFeePerGas,
      tokenMetadata: tokenMetadata as never,
    }).catch(() => undefined)

    return { balanceDiffs, fee }
  } catch {
    // Simulation failures should not block the fill response —
    // return empty diffs with fee computed from transaction fields.
    const fee = await computeFee(client, { feeToken, gas, store, maxFeePerGas })
    return { balanceDiffs: undefined, fee }
  }
}

export declare namespace simulateAndParseDiffs {
  type Options = {
    account?: Address | undefined
    calls: readonly Call[]
    feeToken?: Address | undefined
    gas?: bigint | undefined
    store?: Store.Store | undefined
    maxFeePerGas?: bigint | undefined
  }
}

/** Builds a complete preview within the metadata lookup budget. */
export async function buildBalanceDiffs(
  client: Client,
  options: buildBalanceDiffs.Options,
) {
  const { account, store, logs, tokenMetadata } = options
  const accountLower = account.toLowerCase()

  const transferLogs = parseEventLogs({
    abi: [AbiEvent.fromAbi(Abis.tip20, 'Transfer')],
    eventName: 'Transfer',
    logs,
  })
  const approvalLogs = parseEventLogs({
    abi: [AbiEvent.fromAbi(Abis.tip20, 'Approval')],
    eventName: 'Approval',
    logs,
  })

  // Track net movement per token: incoming vs outgoing.
  const tokenMap = new Map<
    string,
    {
      incoming: bigint
      outgoing: bigint
      recipients: Set<Address>
      token: Address
    }
  >()

  for (const log of transferLogs) {
    const token = log.address.toLowerCase()
    const fromLower = log.args.from.toLowerCase()
    const toLower = log.args.to.toLowerCase()

    const entry = tokenMap.get(token) ?? {
      incoming: 0n,
      outgoing: 0n,
      recipients: new Set<Address>(),
      token: log.address,
    }
    if (fromLower === accountLower) {
      entry.outgoing += log.args.amount
      entry.recipients.add(log.args.to)
    }
    if (toLower === accountLower) entry.incoming += log.args.amount
    tokenMap.set(token, entry)
  }

  // Approvals replace allowances; retain the last event for each token and spender.
  const approvals = new Map<string, (typeof approvalLogs)[number]>()
  for (const log of approvalLogs) {
    if (log.args.owner.toLowerCase() !== accountLower) continue
    approvals.set(
      `${log.address.toLowerCase()}:${log.args.spender.toLowerCase()}`,
      log,
    )
  }

  // Transfers do not identify allowance consumption, so retain final approval exposure.
  for (const log of approvals.values()) {
    if (log.args.amount === 0n) continue
    const token = log.address.toLowerCase()

    const entry = tokenMap.get(token) ?? {
      incoming: 0n,
      outgoing: 0n,
      recipients: new Set<Address>(),
      token: log.address,
    }
    entry.outgoing += log.args.amount
    entry.recipients.add(log.args.spender)
    tokenMap.set(token, entry)
  }

  // Collect unique tokens that need decimals.
  const entries = [...tokenMap.values()].filter((e) => {
    const net =
      e.outgoing > e.incoming
        ? e.outgoing - e.incoming
        : e.incoming - e.outgoing
    return net > 0n
  })
  if (entries.length === 0) return {}
  // Omit an unavailable preview rather than returning a partial set of movements.
  if (entries.length > 100) return undefined

  // Bound metadata work for a single fill independently of the RPC batch limit.
  const metadataMap = new Map<
    string,
    { decimals: number; symbol: string; name: string }
  >()
  let index = 0
  await Promise.all(
    Array.from({ length: Math.min(10, entries.length) }, async () => {
      while (index < entries.length) {
        const entry = entries[index++]!
        try {
          const metadata = await resolveTokenMetadata(client, {
            token: entry.token,
            tokenMetadata,
            store,
          })
          metadataMap.set(entry.token.toLowerCase(), metadata)
        } catch {}
      }
    }),
  )
  if (metadataMap.size !== entries.length) return undefined

  // Build the diff array for this account.
  const diffs: Capabilities.BalanceDiff[] = []
  for (const entry of entries) {
    const net =
      entry.outgoing > entry.incoming
        ? entry.outgoing - entry.incoming
        : entry.incoming - entry.outgoing

    const direction = entry.outgoing > entry.incoming ? 'outgoing' : 'incoming'
    const meta = metadataMap.get(entry.token.toLowerCase())!
    const decimals = meta.decimals
    diffs.push({
      address: entry.token,
      decimals,
      direction,
      formatted: formatUnits(net, decimals),
      name: meta.name,
      symbol: meta.symbol,
      recipients: [...entry.recipients] as Address[],
      value: Hex.fromNumber(net) as `0x${string}`,
    })
  }

  return { [account]: diffs }
}

export declare namespace buildBalanceDiffs {
  type Options = {
    account: Address
    store?: Store.Store | undefined
    logs: Log[]
    tokenMetadata: Record<
      Address,
      { name: string; symbol: string; currency: string }
    >
  }
}

// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function computeFee(client: Client, options: computeFee.Options) {
  const { feeToken, gas, store, maxFeePerGas, tokenMetadata } = options
  if (!feeToken || !gas || !maxFeePerGas) return undefined

  try {
    const metadata = await resolveTokenMetadata(client, {
      token: feeToken,
      tokenMetadata,
      store,
    })
    const raw = gas * maxFeePerGas
    const scale = 10n ** BigInt(Math.max(0, 18 - metadata.decimals))
    const amount = (raw + scale - 1n) / scale
    return {
      amount: Hex.fromNumber(amount) as `0x${string}`,
      decimals: metadata.decimals,
      formatted: formatUnits(amount, metadata.decimals),
      symbol: metadata.symbol,
    }
  } catch {
    return undefined
  }
}

declare namespace computeFee {
  type Options = {
    feeToken?: Address | undefined
    gas?: bigint | undefined
    store?: Store.Store | undefined
    maxFeePerGas?: bigint | undefined
    tokenMetadata?:
      | Record<Address, { name: string; symbol: string; currency: string }>
      | undefined
  }
}
