import { AbiEvent, Hex, Secp256k1 } from 'ox'
import { sendTransactionSync } from '../../../src/actions/wallet/sendTransactionSync.js'
import type { Client } from '../../../src/clients/createClient.js'
import type { Address } from '../../../src/index.js'
import * as Abis from '../../../src/tempo/Abis.js'
import * as Actions from '../../../src/tempo/actions/index.js'
import type * as Capabilities from '../../../src/tempo/Capabilities.js'
import { Account, Tick } from '../../../src/tempo/index.js'
import { simulateAndParseDiffs } from '../../../src/tempo/internal/relay/simulate.js'
import type { Call } from '../../../src/types/calls.js'
import { parseEventLogs } from '../../../src/utils/abi/parseEventLogs.js'
import { parseUnits } from '../../../src/utils/unit/parseUnits.js'
import { accounts, addresses, getClient, setupTokenPair } from './config.js'

/**
 * Compares the relay's balance diffs for `calls` with an oracle that reads the sender's
 * balances and allowances immediately before and after the calls in one simulated block.
 *
 * Returns one entry per token the calls moved or approved, plus the violated invariants.
 * An empty `violations` list means the preview matches the chain's own accounting.
 */
export async function verify(client: Client, options: verify.Options) {
  const { account, blockNumber, calls } = options
  const accountLower = account.toLowerCase()

  const [{ balanceDiffs }, traced] = await Promise.all([
    simulateAndParseDiffs(client, { account, blockNumber, calls }),
    Actions.simulate.simulateCalls(client, {
      account,
      blockNumber,
      calls: calls as Call[],
      traceTransfers: true,
    }),
  ])

  // Logs only name what to measure; every amount below comes from state reads.
  const logs = traced.results.flatMap(
    (result) => (result as { logs?: never[] | undefined }).logs ?? [],
  )
  const tokens = new Set<Address>()
  const gross = new Map<Address, { in: bigint; out: bigint }>()
  for (const log of parseEventLogs({
    abi: [AbiEvent.fromAbi(Abis.tip20, 'Transfer')],
    eventName: 'Transfer',
    logs,
  })) {
    const from = log.args.from.toLowerCase() === accountLower
    const to = log.args.to.toLowerCase() === accountLower
    if (!from && !to) continue
    const token = log.address.toLowerCase() as Address
    tokens.add(token)
    const entry = gross.get(token) ?? { in: 0n, out: 0n }
    // A transfer to oneself moves nothing.
    if (from && !to) entry.out += log.args.amount
    if (to && !from) entry.in += log.args.amount
    gross.set(token, entry)
  }
  const pairs = new Map<string, { spender: Address; token: Address }>()
  for (const log of parseEventLogs({
    abi: [AbiEvent.fromAbi(Abis.tip20, 'Approval')],
    eventName: 'Approval',
    logs,
  })) {
    if (log.args.owner.toLowerCase() !== accountLower) continue
    const token = log.address.toLowerCase() as Address
    tokens.add(token)
    pairs.set(`${token}:${log.args.spender.toLowerCase()}`, {
      spender: log.args.spender.toLowerCase() as Address,
      token,
    })
  }

  const reads = [
    ...[...tokens].map((token) =>
      Actions.token.getBalance.call(client, { account, token }),
    ),
    ...[...pairs.values()].map(({ spender, token }) =>
      Actions.token.getAllowance.call(client, { account, spender, token }),
    ),
  ]
  const oracle = await Actions.simulate.simulateCalls(client, {
    account,
    blockNumber,
    calls: [...reads, ...calls, ...reads] as Call[],
  })
  const read = (index: number) => {
    const { data } = oracle.results[index] as { data: Hex.Hex }
    return Hex.toBigInt(data)
  }
  const after = reads.length + calls.length

  const diffs = (Object.entries(balanceDiffs ?? {}).find(
    ([address]) => address.toLowerCase() === accountLower,
  )?.[1] ?? []) as readonly Capabilities.BalanceDiff[]

  const violations: string[] = []
  if (tokens.size > 0 && balanceDiffs === undefined)
    violations.push('preview omitted')
  const entries = [...tokens].map((token, index) => {
    const delta = read(after + index) - read(index)
    const approvals = [...pairs.values()].flatMap((pair, offset) =>
      pair.token === token
        ? [{ allowance: read(after + tokens.size + offset), ...pair }]
        : [],
    )
    const exposure = approvals.reduce(
      (sum, { allowance }) => sum + allowance,
      0n,
    )
    const matching = diffs.filter(
      (diff) => diff.address.toLowerCase() === token,
    )
    const amount = (direction: Capabilities.BalanceDiff['direction']) =>
      matching
        .filter((diff) => diff.direction === direction)
        .reduce((sum, diff) => sum + Hex.toBigInt(diff.value), 0n)
    const incoming = amount('incoming')
    const outgoing = amount('outgoing')
    const recipients = new Set(
      matching.flatMap((diff) =>
        diff.recipients.map((recipient) => recipient.toLowerCase()),
      ),
    )

    if (matching.filter((diff) => diff.direction === 'incoming').length > 1)
      violations.push(`${token}: duplicate incoming entries`)
    if (matching.filter((diff) => diff.direction === 'outgoing').length > 1)
      violations.push(`${token}: duplicate outgoing entries`)
    // The previewed transfers, net of approval exposure, must equal the balance change.
    if (incoming - (outgoing - exposure) !== delta)
      violations.push(
        `${token}: incoming ${incoming} - (outgoing ${outgoing} - exposure ${exposure}) != delta ${delta}`,
      )
    if (outgoing < exposure)
      violations.push(`${token}: outgoing ${outgoing} < exposure ${exposure}`)
    // Gross directions must match the emitted transfers, which must agree with state.
    const { in: in_, out } = gross.get(token) ?? { in: 0n, out: 0n }
    if (in_ - out !== delta)
      violations.push(`${token}: transfers ${in_ - out} != delta ${delta}`)
    if (incoming !== in_)
      violations.push(`${token}: incoming ${incoming} != transferred in ${in_}`)
    if (outgoing - exposure !== out)
      violations.push(
        `${token}: outgoing ${outgoing} - exposure ${exposure} != transferred out ${out}`,
      )
    for (const { allowance, spender } of approvals)
      if (allowance > 0n && !recipients.has(spender))
        violations.push(`${token}: approved spender ${spender} missing`)

    return { delta, exposure, incoming, outgoing, token }
  })
  // Every previewed token must be one the calls moved or approved.
  for (const diff of diffs)
    if (!tokens.has(diff.address.toLowerCase() as Address))
      violations.push(`${diff.address}: previewed without movement`)

  return { entries, results: traced.results, violations }
}

export declare namespace verify {
  type Options = {
    /** Sender of the calls. */
    account: Address
    /** Block to simulate against. Defaults to the latest block. */
    blockNumber?: bigint | undefined
    /** Calls to preview. */
    calls: readonly Call[]
  }
}

/** A balance-affecting call on Tempo precompiles, built for one sender. */
export type Operation =
  | { amount: bigint; kind: 'approve'; spender: Party; token: number }
  | { amount: bigint; kind: 'buy' | 'sell' }
  | { amount: bigint; kind: 'liquidity' }
  | { amount: bigint; kind: 'place'; side: 'buy' | 'sell' }
  | { kind: 'preference'; token: number }
  | {
      amount: bigint
      kind: 'transfer' | 'transferFrom'
      memo: boolean
      to: Party
      token: number
    }
  | { amount: bigint; kind: 'withdraw'; token: number }

/** Counterparty of an operation: the sender itself or one of two other accounts. */
export type Party = 'other' | 'second' | 'self'

/** Accounts and tokens operations draw from. */
export type Context = {
  /** Sender. */
  account: Address
  /** DEX base token, quoted in `quote`. */
  base: Address
  /** Client building token calls. */
  client: Client
  /** Counterparties other than the sender. */
  others: readonly [Address, Address]
  /** DEX quote token. */
  quote: Address
  /** TIP-20 tokens indexed by operations. */
  tokens: readonly Address[]
}

/** Builds the calls of one operation. */
export function build(context: Context, operation: Operation): readonly Call[] {
  const { account, base, client, others, quote, tokens } = context
  const party = (value: Party) =>
    value === 'self' ? account : value === 'other' ? others[0] : others[1]
  const token = (index: number) => tokens[index % tokens.length]!
  const call = ({ data, to }: { data: Hex.Hex; to: Address }) => ({ data, to })
  switch (operation.kind) {
    case 'approve':
      return [
        call(
          Actions.token.approve.call(client, {
            amount: operation.amount,
            spender: party(operation.spender),
            token: token(operation.token),
          }),
        ),
      ]
    case 'buy':
      return [
        call(
          Actions.dex.buy.call({
            amountOut: operation.amount,
            maxAmountIn: operation.amount * 2n,
            tokenIn: quote,
            tokenOut: base,
          }),
        ),
      ]
    case 'sell':
      return [
        call(
          Actions.dex.sell.call({
            amountIn: operation.amount,
            minAmountOut: 0n,
            tokenIn: base,
            tokenOut: quote,
          }),
        ),
      ]
    case 'liquidity':
      return [
        call(
          Actions.amm.mint.call({
            to: account,
            userTokenAddress: base,
            validatorTokenAddress: token(0),
            validatorTokenAmount: operation.amount,
          }),
        ),
      ]
    case 'place':
      return [
        call(
          Actions.dex.place.call({
            amount: operation.amount,
            tick: 0,
            token: base,
            type: operation.side,
          }),
        ),
      ]
    case 'preference':
      return [
        call(Actions.fee.setUserToken.call({ token: token(operation.token) })),
      ]
    case 'transfer':
    case 'transferFrom':
      return [
        call(
          Actions.token.transfer.call(client, {
            amount: operation.amount,
            // Spending an allowance the sender granted itself.
            ...(operation.kind === 'transferFrom' ? { from: account } : {}),
            ...(operation.memo ? { memo: Hex.padLeft('0x01', 32) } : {}),
            to: party(operation.to),
            token: token(operation.token),
          }),
        ),
      ]
    case 'withdraw':
      return [
        call(
          Actions.dex.withdraw.call({
            amount: operation.amount,
            token: operation.token % 2 === 0 ? base : quote,
          }),
        ),
      ]
  }
}

/**
 * Funds a fresh sender with faucet tokens and both sides of a new DEX pair with resting
 * orders on each side, so operations can transfer, approve, and trade.
 */
export async function setup(client: Client): Promise<Context> {
  const maker = getClient({ account: accounts[0] })
  const holder = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  const { base, quote } = await setupTokenPair(maker)
  await Actions.faucet.fundSync(maker, { account: holder, timeout: 60_000 })
  await sendTransactionSync(maker, {
    calls: [base, quote].map((token) =>
      Actions.token.transfer.call(maker, {
        amount: parseUnits('100', 6),
        to: holder.address,
        token,
      }),
    ),
  })
  for (const [type, price] of [
    ['sell', '1.001'],
    ['buy', '0.999'],
  ] as const)
    await Actions.dex.placeSync(maker, {
      amount: parseUnits('500', 6),
      tick: Tick.fromPrice(price),
      token: base,
      type,
    })
  return {
    account: holder.address,
    base,
    client,
    others: [accounts[7]!.address, accounts[6]!.address],
    quote,
    tokens: [
      addresses.alphaUsd,
      '0x20c0000000000000000000000000000000000002',
      base,
      quote,
    ],
  }
}
