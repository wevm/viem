import type { Abi, Address } from 'abitype'
import { TokenId } from 'ox/tempo'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import {
  type MulticallParameters,
  type MulticallReturnType,
  multicall,
} from '../../actions/public/multicall.js'
import type { Client } from '../../clients/createClient.js'
import { BaseError } from '../../errors/base.js'
import type { ContractFunctionParameters } from '../../types/contract.js'
import { formatAbiItem } from '../../utils/abi/formatAbiItem.js'
import { toFunctionSelector } from '../../utils/hash/toFunctionSelector.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
// Resolvers are read lazily: these modules import this one.
import * as accessKey from '../actions/accessKey.js'
import * as amm from '../actions/amm.js'
import * as channel from '../actions/channel.js'
import * as dex from '../actions/dex.js'
import * as fee from '../actions/fee.js'
import * as nonce from '../actions/nonce.js'
import * as policy from '../actions/policy.js'
import * as token from '../actions/token.js'
import * as ExecutionError from '../ExecutionError.js'
import { TempoExecutionError } from '../errors.js'

/** Action-specific steps to resolve errors, keyed by error name. Listed before the default steps. */
export type Hints = {
  [name in TempoExecutionError.ErrorName]?: readonly string[]
}

/** Builds a specific error for a decoded Tempo error, or returns `undefined` when it does not apply. */
export type Resolver = (
  context: Context,
) => Promise<TempoExecutionError | undefined> | TempoExecutionError | undefined

/** Resolvers keyed by error signature. */
export type Resolvers = {
  [signature in keyof typeof ExecutionError.messages]?: Resolver
}

export type Context = {
  /** Parameters for the base `TempoExecutionError`. */
  base: TempoExecutionError.Parameters
  client: Client
  /** Signer, with its access key when signing with one. */
  signer: { address: Address; accessKey: Address | undefined } | undefined
  /** Contract call that failed, when the action made one. */
  call:
    | {
        address: Address
        args: readonly unknown[]
        functionName: string
        /** Reads an argument by its ABI input name. */
        arg: <type = unknown>(name: string) => type | undefined
      }
    | undefined
  /** Whether the error came from transaction validation or fee payment rather than a revert. */
  validation: boolean
  /** Raw node message. */
  details: string
  parameters: Record<string, any>
  /** Multicall with `allowFailure: true`. Resolves an empty array when the request fails. */
  read: <const contracts extends readonly unknown[]>(
    contracts: MulticallParameters<contracts>['contracts'],
  ) => Promise<Partial<MulticallReturnType<contracts, true>>>
}

/**
 * Wraps an action so failures with a decoded Tempo error throw a {@link TempoExecutionError}.
 * Other errors are rethrown unchanged.
 *
 * @internal
 */
export function withExecutionError<
  action extends (client: any, parameters: any) => Promise<any>,
>(action: action, options: { hints?: Hints | undefined } = {}): action {
  return (async (client: Client, parameters: Record<string, any>) => {
    try {
      return await action(client, parameters)
    } catch (error) {
      throw await toExecutionError(error, { ...options, client, parameters })
    }
  }) as action
}

/** Node messages that carry no revert data, mapped to the error they describe. */
const messages = [
  [/Access key expired: expiry \d+ <= min allowed \d+/, 'ExpiryInPast()'],
] as const

async function toExecutionError(
  cause: unknown,
  options: {
    client: Client
    hints?: Hints | undefined
    parameters: Record<string, any>
  },
) {
  if (!(cause instanceof BaseError)) return cause
  const details = cause.details ?? ''
  let error: ExecutionError.ExecutionError = ExecutionError.from(cause)
  if (error.errorName === 'unknown') {
    const signature = messages.find(([pattern]) => pattern.test(details))?.[1]
    if (!signature) return cause
    error = ExecutionError.from(toFunctionSelector(signature))
  }
  if (error.errorName === 'unknown') return cause

  const { client, parameters } = options
  const signature = formatAbiItem(
    error.abiItem,
  ) as keyof typeof ExecutionError.messages
  const hints = [
    ...(options.hints?.[error.errorName] ?? []),
    ...(ExecutionError.hints[signature] ?? []),
  ]
  const base = { cause, error, hints } as TempoExecutionError.Parameters

  const account_ = parameters.account ?? client.account
  const account = account_ ? parseAccount(account_) : undefined
  const context: Context = {
    base,
    call: getCall(parameters),
    client,
    details,
    parameters,
    read: (contracts) =>
      multicall(client, {
        allowFailure: true,
        contracts: contracts as readonly ContractFunctionParameters[],
        deployless: true,
      }).catch(() => []) as never,
    signer: account && {
      address: account.address,
      accessKey:
        account.source === 'accessKey' && 'accessKeyAddress' in account
          ? (account.accessKeyAddress as Address)
          : undefined,
    },
    validation: !/execution reverted/i.test(details),
  }

  for (const resolvers of [
    accessKey.errorResolvers,
    amm.errorResolvers,
    channel.errorResolvers,
    dex.errorResolvers,
    fee.errorResolvers,
    nonce.errorResolvers,
    policy.errorResolvers,
    token.errorResolvers,
  ] as readonly Resolvers[]) {
    const result = await resolvers[signature]?.(context)
    if (result) return result
  }
  return new TempoExecutionError(base)
}

function getCall(parameters: Record<string, any>): Context['call'] {
  const {
    abi,
    address,
    args = [],
    functionName,
  } = parameters as {
    abi?: Abi
    address?: Address
    args?: readonly unknown[]
    functionName?: string
  }
  if (!address || !functionName) return undefined
  const item = abi?.find(
    (item) => item.type === 'function' && item.name === functionName,
  )
  const inputs = item?.type === 'function' ? item.inputs : []
  return {
    address,
    args,
    functionName,
    arg: (name) =>
      args[inputs.findIndex((input) => input.name === name)] as never,
  }
}

/** Fee token from the action parameters or chain, when set. */
export function getFeeToken(context: Context) {
  const feeToken =
    context.parameters.feeToken ??
    (
      context.client.chain as
        | { feeToken?: TokenId.TokenIdOrAddress }
        | undefined
    )?.feeToken
  return feeToken === undefined || feeToken === null
    ? undefined
    : TokenId.toAddress(feeToken)
}

/** Whether `address` is a TIP-20 token. */
export function isTip20(address: Address | undefined): address is Address {
  return !!address?.toLowerCase().startsWith('0x20c0')
}

/** Formats an amount as `formatted (raw)` when decimals are known. */
export function formatAmount(
  value: bigint | undefined,
  decimals: number | undefined,
) {
  if (value === undefined) return undefined
  if (decimals === undefined) return value.toString()
  return `${formatUnits(value, decimals)} (${value})`
}

/** Formats Unix seconds as an ISO 8601 string. */
export function formatTime(seconds: bigint | number | undefined) {
  if (!seconds) return undefined
  return new Date(Number(seconds) * 1000).toISOString()
}
