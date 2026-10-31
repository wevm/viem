import type { Address } from 'abitype'
import { AbiEvent, Hex } from 'ox'
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
import * as Utils from './utils.js'
import { extractCalls } from './virtualAddress.js'

export function create(options: Relay.simulate.Options): Relay.Plugin {
  return {
    async handleRequest(context, next) {
      if (context.request.method !== 'eth_fillTransaction') return next()
      try {
        await next()
      } catch (error) {
        const parameters = context.request.params![0] as Record<string, unknown>
        if (
          isExecutionError(error) &&
          (parameters.capabilities as Record<string, unknown> | undefined)
            ?.errors === true
        )
          return formatError(
            error,
            parameters,
            context.client,
            context.getStore(options.store),
          )
        throw error
      }
    },
    async afterFill(result, context) {
      const parameters = context.request.params![0] as Record<string, unknown>
      const store = context.getStore(options.store)
      const signal = context.options.signal
      const transaction = Utils.normalizeTempoTransaction(result.tx)
      const feeToken = transaction.feeToken as Address | undefined
      // Balance diffs cost a simulation, so callers opt in; the fee is always estimated.
      const simulation =
        (parameters.capabilities as Record<string, unknown> | undefined)
          ?.balanceDiffs === true
          ? await simulateAndParseDiffs(context.client, {
              account: parameters.from as Address | undefined,
              calls: extractCalls(transaction),
              feeToken,
              gas: transaction.gas,
              maxFeePerGas: transaction.maxFeePerGas,
              store,
              signal,
            })
          : await computeFee(context.client, {
              feeToken,
              gas: transaction.gas,
              maxFeePerGas: transaction.maxFeePerGas,
              store,
              signal,
            }).then((fee) => ({ balanceDiffs: undefined, fee }))
      return {
        capabilities: {
          balanceDiffs: simulation.balanceDiffs,
          fee: simulation.fee,
        },
      }
    },
  }
}

export async function simulateAndParseDiffs(
  client: Client,
  options: simulateAndParseDiffs.Options,
) {
  const {
    account,
    blockNumber,
    calls,
    feeToken,
    gas,
    store,
    maxFeePerGas,
    signal,
  } = options
  signal?.throwIfAborted()

  try {
    // Including the fee token as a read target asks the node to return its metadata too.
    const probe =
      feeToken &&
      !calls.some((call) => call.to?.toLowerCase() === feeToken.toLowerCase())
        ? [
            Actions.token.getBalance.call(client, {
              account: account ?? zeroAddress,
              token: feeToken,
            }),
          ]
        : []
    const simulation = await Actions.simulate.simulateCalls(client, {
      account: account === zeroAddress ? undefined : account,
      blockNumber,
      calls: [...calls, ...probe] as Call[],
      traceTransfers: true,
    })
    const results = simulation.results.slice(0, calls.length)
    const { tokenMetadata } = simulation

    signal?.throwIfAborted()

    // Collect all logs across all call results.
    const logs: (typeof results)[number]['logs'] = []
    for (const result of results as {
      logs?: (typeof logs)[number][] | undefined
    }[])
      if (result.logs) logs.push(...result.logs)

    const allowances =
      account && account !== zeroAddress
        ? await readAllowances(client, { account, blockNumber, calls, logs })
        : undefined

    signal?.throwIfAborted()

    // Build per-token balance diffs relative to the sender.
    const balanceDiffs = account
      ? await buildBalanceDiffs(client, {
          account,
          allowances,
          store,
          signal,
          logs,
          tokenMetadata: tokenMetadata as never,
        })
      : {}

    // Compute fee breakdown.
    const fee = await computeFee(client, {
      feeToken,
      gas,
      store,
      signal,
      maxFeePerGas,
      tokenMetadata: tokenMetadata as never,
    })

    return { balanceDiffs, fee, tokenMetadata }
  } catch {
    signal?.throwIfAborted()
    // Simulation failures should not block the fill response —
    // return empty diffs with fee computed from transaction fields.
    const fee = await computeFee(client, {
      feeToken,
      gas,
      store,
      maxFeePerGas,
      signal,
    })
    return { balanceDiffs: undefined, fee, tokenMetadata: undefined }
  }
}

export declare namespace simulateAndParseDiffs {
  type Options = {
    account?: Address | undefined
    /** Block to simulate against. Defaults to the latest block. */
    blockNumber?: bigint | undefined
    calls: readonly Call[]
    feeToken?: Address | undefined
    gas?: bigint | undefined
    store?: Store.Store | undefined
    signal?: AbortSignal | undefined
    maxFeePerGas?: bigint | undefined
  }
}

/** Builds a complete preview within the metadata lookup budget. @internal */
export async function buildBalanceDiffs(
  client: Client,
  options: buildBalanceDiffs.Options,
) {
  const { account, allowances, store, logs, tokenMetadata, signal } = options
  signal?.throwIfAborted()
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

  // Track gross movement per token, so a token received and passed on in one transaction stays visible.
  const tokenMap = new Map<
    string,
    {
      incoming: bigint
      outgoing: bigint
      approved: bigint
      recipients: Set<Address>
      token: Address
    }
  >()

  for (const log of transferLogs) {
    const token = log.address.toLowerCase()
    const fromLower = log.args.from.toLowerCase()
    const toLower = log.args.to.toLowerCase()
    // Transfers to oneself move nothing.
    if (fromLower === accountLower && toLower === accountLower) continue

    const entry = tokenMap.get(token) ?? {
      incoming: 0n,
      outgoing: 0n,
      approved: 0n,
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

  // Transfers do not identify allowance consumption, so exposure is the allowance read after the calls, else the final approval.
  for (const log of approvals.values()) {
    const token = log.address.toLowerCase()
    const amount =
      allowances?.get(`${token}:${log.args.spender.toLowerCase()}`) ??
      log.args.amount
    if (amount === 0n) continue

    const entry = tokenMap.get(token) ?? {
      incoming: 0n,
      outgoing: 0n,
      approved: 0n,
      recipients: new Set<Address>(),
      token: log.address,
    }
    entry.approved += amount
    entry.recipients.add(log.args.spender)
    tokenMap.set(token, entry)
  }

  // Collect unique tokens that need decimals.
  const entries = [...tokenMap.values()].filter(
    (e) => e.incoming > 0n || e.outgoing > 0n || e.approved > 0n,
  )
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
        } catch {
          signal?.throwIfAborted()
        }
      }
    }),
  )
  signal?.throwIfAborted()
  if (metadataMap.size !== entries.length) return undefined

  // Build the diff array for this account.
  const diffs: Capabilities.BalanceDiff[] = []
  for (const entry of entries) {
    const { incoming } = entry
    const outgoing = entry.outgoing + entry.approved
    const meta = metadataMap.get(entry.token.toLowerCase())!
    const decimals = meta.decimals
    const metadata = {
      address: entry.token,
      decimals,
      name: meta.name,
      symbol: meta.symbol,
    }
    if (incoming > 0n)
      diffs.push({
        ...metadata,
        direction: 'incoming',
        formatted: formatUnits(incoming, decimals),
        recipients: [],
        value: Hex.fromNumber(incoming),
      })
    if (outgoing > 0n)
      diffs.push({
        ...metadata,
        direction: 'outgoing',
        formatted: formatUnits(outgoing, decimals),
        recipients: [...entry.recipients],
        value: Hex.fromNumber(outgoing),
      })
  }

  return { [account]: diffs }
}

export declare namespace buildBalanceDiffs {
  type Options = {
    account: Address
    /** Allowances read after the calls, keyed by lowercase `token:spender`. */
    allowances?: ReadonlyMap<string, bigint> | undefined
    store?: Store.Store | undefined
    signal?: AbortSignal | undefined
    logs: Log[]
    tokenMetadata: Record<
      Address,
      { name: string; symbol: string; currency: string }
    >
  }
}

// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function computeFee(client: Client, options: computeFee.Options) {
  const { feeToken, gas, store, maxFeePerGas, tokenMetadata, signal } = options
  signal?.throwIfAborted()
  if (!feeToken || !gas || !maxFeePerGas) return undefined

  try {
    const metadata = await resolveTokenMetadata(client, {
      token: feeToken,
      tokenMetadata,
      store,
    })
    signal?.throwIfAborted()
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
    signal?.throwIfAborted()
    return undefined
  }
}

declare namespace computeFee {
  type Options = {
    feeToken?: Address | undefined
    gas?: bigint | undefined
    store?: Store.Store | undefined
    signal?: AbortSignal | undefined
    maxFeePerGas?: bigint | undefined
    tokenMetadata?:
      | Record<Address, { name: string; symbol: string; currency: string }>
      | undefined
  }
}

/**
 * Reads, after the calls, the allowance of every spender the account approved during them,
 * so approval exposure is net of what spenders consumed however the approval was made.
 */
// biome-ignore lint/correctness/noUnusedVariables: declaration merge
async function readAllowances(
  client: Client,
  options: readAllowances.Options,
): Promise<ReadonlyMap<string, bigint> | undefined> {
  const { account, blockNumber, calls, logs } = options
  const accountLower = account.toLowerCase()
  const pairs = new Map<string, { spender: Address; token: Address }>()
  for (const log of parseEventLogs({
    abi: [AbiEvent.fromAbi(Abis.tip20, 'Approval')],
    eventName: 'Approval',
    logs,
  })) {
    if (log.args.owner.toLowerCase() !== accountLower) continue
    pairs.set(
      `${log.address.toLowerCase()}:${log.args.spender.toLowerCase()}`,
      { spender: log.args.spender, token: log.address },
    )
  }
  // Previews over the token budget are omitted, so their reads are skipped too.
  if (pairs.size === 0 || pairs.size > 100) return undefined
  try {
    const entries = [...pairs.entries()]
    const simulation = await Actions.simulate.simulateCalls(client, {
      account,
      blockNumber,
      calls: [
        ...calls,
        ...entries.map(([, { spender, token }]) =>
          Actions.token.getAllowance.call(client, { account, spender, token }),
        ),
      ] as Call[],
    })
    const allowances = new Map<string, bigint>()
    for (const [index, [key]] of entries.entries()) {
      const result = simulation.results[calls.length + index] as
        | { data?: Hex.Hex | undefined; status?: string | undefined }
        | undefined
      if (result?.status !== 'success' || !result.data || result.data === '0x')
        continue
      allowances.set(key, Hex.toBigInt(result.data))
    }
    return allowances
  } catch {
    // Without the reads, exposure falls back to each pair's final approved amount.
    return undefined
  }
}

declare namespace readAllowances {
  type Options = {
    /** Owner whose allowances are read. */
    account: Address
    /** Block the calls were simulated against. */
    blockNumber?: bigint | undefined
    /** Calls preceding the reads. */
    calls: readonly Call[]
    /** Logs the calls emitted. */
    logs: Log[]
  }
}
