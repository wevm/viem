import * as AbiError from 'ox/AbiError'
import * as Address from 'ox/Address'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as RpcResponse from 'ox/RpcResponse'
import {
  FundingPolicy,
  type FundingRequirement,
  KeyAuthorization,
} from 'ox/tempo'
import { getChainId } from '../../actions/public/getChainId.js'
import { getStorageAt } from '../../actions/public/getStorageAt.js'
import type { Client } from '../../clients/createClient.js'
import type { BaseError } from '../../errors/base.js'
import type { RpcLog } from '../../types/rpc.js'
import { decodeFunctionData } from '../../utils/abi/decodeFunctionData.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type * as Funding from '../Funding.js'

const balance = 2n ** 96n
const insufficientBalance = AbiError.fromAbi(Abis.tip20, 'InsufficientBalance')

export const fundingErrors = /*#__PURE__*/ [
  ...Abis.accountKeychain,
  ...Abis.earnFundingSource,
  ...Abis.fundingPolicy,
  ...Abis.fundingSource,
  ...Abis.stablecoinDex,
  ...Abis.tip20Funder,
  ...Abis.tip403Registry,
].filter((item) => item.type === 'error')

export type FundingRequirementInput<quantity = bigint, index = number> = Omit<
  FundingRequirement.FundingRequirement<quantity, index>,
  'policyRules'
> & {
  /** Complete policy rules, decoded or ABI-encoded. */
  policyRules?: FundingPolicy.Rules | Hex.Hex | undefined
}

type NormalizedFundingRequirement<quantity, index> = Omit<
  FundingRequirementIntent<quantity, index>,
  'policyRules'
> & { policyRules?: Hex.Hex | undefined }

/** Funding intent accepted before the relay resolves sources. */
export type FundingRequirementIntent<quantity = bigint, index = number> = Omit<
  FundingRequirement.Request<quantity, index>,
  'policyRules'
> & { policyRules?: FundingPolicy.Rules | Hex.Hex | undefined }

export function normalizeRequireFunds<quantity, index>(
  requirements: readonly FundingRequirementInput<quantity, index>[] | undefined,
  ownerAuthorized?: boolean,
): readonly FundingRequirement.FundingRequirement<quantity, index>[] | undefined
export function normalizeRequireFunds<quantity, index>(
  requirements:
    | readonly FundingRequirementIntent<quantity, index>[]
    | undefined,
  ownerAuthorized?: boolean,
): readonly NormalizedFundingRequirement<quantity, index>[] | undefined
export function normalizeRequireFunds<quantity, index>(
  requirements:
    | true
    | readonly FundingRequirementIntent<quantity, index>[]
    | undefined,
  ownerAuthorized?: boolean,
): true | readonly NormalizedFundingRequirement<quantity, index>[] | undefined
export function normalizeRequireFunds<quantity, index>(
  requirements:
    | true
    | readonly FundingRequirementIntent<quantity, index>[]
    | undefined,
  ownerAuthorized = false,
): true | readonly NormalizedFundingRequirement<quantity, index>[] | undefined {
  if (requirements === true) return true
  return requirements?.map(({ policyRules, ...requirement }) => {
    if (policyRules === undefined || ownerAuthorized) return requirement
    return {
      ...requirement,
      policyRules:
        typeof policyRules === 'string'
          ? policyRules
          : FundingPolicy.encode(policyRules),
    }
  })
}

/** Preserves single-action funding defaults, including zero amounts without transfer logs. */
export function getDefaults(
  transaction: Pick<Funding.handleRequest.Transaction, 'calls' | 'to' | 'data'>,
) {
  const calls = transaction.calls?.length
    ? transaction.calls
    : [{ to: transaction.to, data: transaction.data }]
  if (calls.length !== 1) return undefined
  const call = calls[0]!
  if (!call.to || !call.data) return undefined
  const tip20 = call.to.toLowerCase().startsWith('0x20c0')
  const dex = Address.isEqual(call.to, Addresses.stablecoinDex)
  if (!tip20 && !dex) return undefined
  const decoded = (() => {
    try {
      return decodeFunctionData({
        abi: tip20 ? Abis.tip20 : Abis.stablecoinDex,
        data: call.data,
      })
    } catch {
      // Unrecognized calldata falls back to simulation.
      return undefined
    }
  })()
  if (!decoded) return undefined
  const { functionName, args } = decoded
  if (tip20) {
    if (
      functionName === 'transferFrom' ||
      functionName === 'transferFromWithMemo'
    )
      throw new RpcResponse.InvalidParamsError({
        message:
          'When `from` is set, specify `token` and `amount` in each `requireFunds` entry; funding targets the transaction sender, not `from`.',
      })
    if (functionName === 'transfer' || functionName === 'transferWithMemo')
      return { token: call.to, amount: args[1] as bigint }
    if (functionName === 'burn' || functionName === 'burnWithMemo')
      return { token: call.to, amount: args[0] as bigint }
  }
  if (dex && functionName === 'swapExactAmountIn')
    return { token: args[0] as Address.Address, amount: args[2] as bigint }
  return undefined
}

/** Infers known call balances locally, otherwise simulates with retained overrides across retries. */
export async function infer(
  client: Client,
  options: {
    tokens: readonly Address.Address[]
    transaction: Omit<Funding.handleRequest.Transaction, 'signatures'>
  },
): Promise<readonly Pick<FundingRequirement.Rpc, 'token' | 'amount'>[]> {
  const { transaction } = options
  let blockHash: Hex.Hex | undefined
  const { from } = transaction

  if (!from)
    throw new RpcResponse.InvalidParamsError({
      message: 'Funding inference requires the transaction sender (`from`).',
    })

  if (transaction.multisigSimulation)
    throw new RpcResponse.InvalidParamsError({
      message: 'Multisig funding requires explicit token, amount, and sources.',
    })

  const requirements = (() => {
    const calls = transaction.calls?.length
      ? transaction.calls
      : [{ to: transaction.to, data: transaction.data }]
    const balances = new Map<Address.Address, { spent: bigint; peak: bigint }>()
    for (const call of calls) {
      if (!call.to || !call.data) return undefined
      const token = Address.checksum(call.to)
      if (!token.toLowerCase().startsWith('0x20c0')) return undefined
      const decoded = (() => {
        try {
          return decodeFunctionData({
            abi: Abis.tip20,
            data: call.data,
          })
        } catch {
          return undefined
        }
      })()
      if (!decoded) return undefined
      const { functionName, args } = decoded
      const transfer =
        functionName === 'transfer' || functionName === 'transferWithMemo'
      const burn = functionName === 'burn' || functionName === 'burnWithMemo'
      if (!transfer && !burn) return undefined
      const amount = args[transfer ? 1 : 0] as bigint
      const previous = balances.get(token) ?? { spent: 0n, peak: 0n }
      const spent = previous.spent + amount
      // Self-transfers need the balance during execution but return it for later calls.
      balances.set(token, {
        spent:
          transfer && Address.isEqual(args[0] as Address.Address, from)
            ? previous.spent
            : spent,
        peak: spent > previous.peak ? spent : previous.peak,
      })
    }
    return [...balances].flatMap(([token, { peak }]) =>
      peak > 0n ? [{ token, amount: Hex.fromNumber(peak) }] : [],
    )
  })()
  if (requirements) return requirements

  // TIP-20 packs transferPolicyId with nextQuoteToken; balances occupies slot 9.
  const slot = Hash.keccak256(
    Hex.concat(Hex.padLeft(from, 32), Hex.fromNumber(9, { size: 32 })),
  )

  const balances = new Map<Address.Address, bigint>()
  for (const token of options.tokens)
    balances.set(Address.checksum(token), balance)

  const failures = new Set<string>()

  for (let attempt = 0; attempt < 16; attempt++) {
    const result = await simulateFunding(client, {
      blockHash,
      transaction: { ...transaction, requireFunds: undefined },
      stateOverrides: Object.fromEntries(
        [...balances].map(([token, value]) => [
          token,
          { stateDiff: { [slot]: Hex.fromNumber(value, { size: 32 }) } },
        ]),
      ),
    })
    blockHash = result.blockHash

    if (result.status === '0x1') return getRequirements(result.logs, from)

    const data = result.error?.data
    if (
      !data ||
      !data.startsWith(AbiError.getSelector(insufficientBalance)) ||
      failures.has(`${data}:${result.gasUsed}`)
    )
      throw new RpcResponse.InvalidParamsError({
        message: `Funding inference failed: ${result.error?.message ?? 'simulation reverted'}. Supply explicit token and amount requirements.`,
      })

    failures.add(`${data}:${result.gasUsed}`)

    const [available, required, token_] = AbiError.decode(
      insufficientBalance,
      data,
    )
    const token = Address.checksum(token_)

    if (!token.toLowerCase().startsWith('0x20c0') || required <= available)
      throw new RpcResponse.InvalidParamsError({
        message: 'Funding inference could not resolve a TIP-20 shortfall.',
      })

    const current =
      balances.get(token) ??
      BigInt(
        (await getStorageAt(client, {
          address: token,
          blockHash,
          slot,
        })) ?? '0x0',
      )

    if (current + required - available >= 2n ** 256n)
      throw new RpcResponse.InvalidParamsError({
        message: 'Funding inference balance exceeds uint256.',
      })

    balances.set(token, current + required - available)
  }

  throw new RpcResponse.InvalidParamsError({
    message:
      'Funding inference exceeded 16 simulations; supply explicit token and amount requirements.',
  })
}

/** Registers rule content with a local handler or remote relay before submission. */
export async function registerPolicyRules(
  client: Client,
  parameters: {
    chainId?: number | undefined
    rules: FundingPolicy.Rules
  },
) {
  const { rules } = parameters
  const chainId =
    parameters.chainId ?? client.chain?.id ?? (await getChainId(client))
  try {
    await client.request<Funding.RpcSchema[0]>({
      method: 'funding_registerPolicyRules',
      params: [
        {
          chainId: Hex.fromNumber(chainId),
          rules: FundingPolicy.encode(rules),
        },
      ],
    })
  } catch (error) {
    // Ordinary node transports do not provide relay storage. Other failures must
    // stop submission so callers know the rules were not registered.
    const name = (error as BaseError).name
    if (
      name !== 'MethodNotFoundRpcError' &&
      name !== 'MethodNotSupportedRpcError'
    )
      throw error
  }
}

/** Resolves only the policy ID, preserving the owner's unsigned authorization fields. */
export async function resolvePolicyId(
  client: Client,
  parameters: {
    account: `0x${string}`
    authorization: KeyAuthorization.Unsigned
  },
): Promise<bigint> {
  const authorization = KeyAuthorization.toRpcUnsigned(parameters.authorization)
  const result = await client.request<Funding.RpcSchema[1]>({
    method: 'eth_fillKeyAuthorization',
    params: [
      {
        account: parameters.account,
        keyAuthorization: { ...authorization, fundingPolicy: true },
      },
    ],
  })
  if (
    !result?.keyAuthorization ||
    result.keyAuthorization.signature !== undefined
  )
    throw new RpcResponse.InvalidParamsError({
      message:
        '`eth_fillKeyAuthorization` must return an unsigned `keyAuthorization`.',
    })
  const policyId = result.keyAuthorization.fundingPolicy
  if (
    typeof policyId !== 'string' ||
    !Hex.validate(policyId) ||
    policyId === '0x' ||
    BigInt(policyId) <= 0n ||
    BigInt(policyId) > 0xffffffffffffffffn
  )
    throw new RpcResponse.InvalidParamsError({
      message:
        '`eth_fillKeyAuthorization` must resolve `fundingPolicy` to a nonzero uint64 policy ID.',
    })
  const filled = (() => {
    try {
      return KeyAuthorization.fromRpcUnsigned(result.keyAuthorization)
    } catch {
      throw new RpcResponse.InvalidParamsError({
        message:
          '`eth_fillKeyAuthorization` returned invalid authorization fields.',
      })
    }
  })()
  const normalized = KeyAuthorization.toRpcUnsigned(filled)
  for (const field of new Set([
    ...Object.keys(authorization),
    ...Object.keys(normalized),
  ])) {
    if (field === 'fundingPolicy') continue
    const key = field as keyof typeof authorization
    if (JSON.stringify(authorization[key]) !== JSON.stringify(normalized[key]))
      throw new RpcResponse.InvalidParamsError({
        message: `\`eth_fillKeyAuthorization\` changed \`keyAuthorization.${field}\`.`,
      })
  }
  return BigInt(policyId)
}

/** Simulates the complete Tempo batch without charging transaction fees. */
async function simulateFunding(
  client: Client,
  options: {
    blockHash?: Hex.Hex | undefined
    transaction: Omit<Funding.handleRequest.Transaction, 'signatures'>
    stateOverrides?:
      | Record<Address.Address, { stateDiff: Record<Hex.Hex, Hex.Hex> }>
      | undefined
  },
) {
  const { blockHash, stateOverrides, transaction } = options
  const { calls, requireFunds, ...rest } = transaction

  const batch = calls?.length
    ? calls
    : [{ to: transaction.to, data: transaction.data, value: transaction.value }]
  const last = batch[batch.length - 1]!

  // The simulation RPC appends its top-level call after the supplied batch prefix.
  const response = await client.request<{
    Method: 'tempo_simulateV1'
    Parameters: readonly [unknown, 'latest' | { blockHash: Hex.Hex }]
    ReturnType: {
      blocks: readonly { parentHash: Hex.Hex; calls: readonly Simulation[] }[]
    }
  }>({
    method: 'tempo_simulateV1',
    params: [
      {
        blockStateCalls: [
          {
            calls: [
              {
                ...rest,
                calls: batch
                  .slice(0, -1)
                  .map((call) => ({ ...call, value: call.value ?? '0x0' })),
                to: last.to,
                data: last.data ?? '0x',
                value: last.value ?? '0x0',
                requireFunds,
                maxFeePerGas: '0x0',
                maxPriorityFeePerGas: '0x0',
                type: '0x76',
              },
            ],
            stateOverrides,
          },
        ],
        validation: false,
      },
      blockHash ? { blockHash } : 'latest',
    ],
  })

  const block = response.blocks[0]
  const result = block?.calls[0]

  if (!result || !block)
    throw new RpcResponse.InvalidParamsError({
      message: 'Funding simulation returned no transaction result.',
    })

  return { ...result, blockHash: block.parentHash }
}

type Simulation = {
  gasUsed: Hex.Hex
  status: Hex.Hex
  logs: readonly RpcLog[]
  error?: { message: string; data?: Hex.Hex | undefined } | undefined
}

/** Tracks peak sender debits, including temporary outflows and self-transfers. */
function getRequirements(logs: readonly RpcLog[], account: Address.Address) {
  const amounts = new Map<
    Address.Address,
    { spent: bigint; required: bigint }
  >()

  for (const log of parseEventLogs({
    abi: Abis.tip20,
    eventName: 'Transfer',
    logs: [...logs],
  })) {
    if (!log.address.toLowerCase().startsWith('0x20c0')) continue

    const token = Address.checksum(log.address)
    const amount = amounts.get(token) ?? { spent: 0n, required: 0n }

    if (Address.isEqual(log.args.from, account)) {
      amount.spent += log.args.amount
      if (amount.spent > amount.required) amount.required = amount.spent
    }
    if (Address.isEqual(log.args.to, account)) amount.spent -= log.args.amount
    amounts.set(token, amount)
  }

  return [...amounts].flatMap(([token, { required }]) =>
    required > 0n ? [{ token, amount: Hex.fromNumber(required) }] : [],
  )
}
