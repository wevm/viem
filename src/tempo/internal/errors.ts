import type { Abi, Address } from 'abitype'
import { TokenId } from 'ox/tempo'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { multicall } from '../../actions/public/multicall.js'
import type { Client } from '../../clients/createClient.js'
import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'
import { formatAbiItem } from '../../utils/abi/formatAbiItem.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import * as ExecutionError from '../ExecutionError.js'
import {
  AccessKeyCallNotAllowedError,
  AccessKeyError,
  AccessKeyExpiredError,
  AccessKeySpendingLimitExceededError,
  TempoExecutionError,
} from '../errors.js'

/** Action-specific steps to resolve errors, keyed by error name. Listed before the default steps. */
export type Hints = {
  [name in TempoExecutionError.ErrorName]?: readonly string[]
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

const keychainErrors = new Set<string>(
  Abis.accountKeychain.flatMap((item) =>
    item.type === 'error' ? [item.name] : [],
  ),
)

async function toExecutionError(
  cause: unknown,
  options: {
    client: Client
    hints?: Hints | undefined
    parameters: Record<string, any>
  },
) {
  if (!(cause instanceof BaseError)) return cause
  const error = ExecutionError.from(cause)
  if (error.errorName === 'unknown') return cause

  const { client, parameters } = options
  const hints = [
    ...(options.hints?.[error.errorName] ?? []),
    ...(ExecutionError.hints[
      formatAbiItem(error.abiItem) as keyof typeof ExecutionError.hints
    ] ?? []),
  ]
  const base = { cause, error, hints }

  const account_ = parameters.account ?? client.account
  const account = account_ ? parseAccount(account_) : undefined
  if (
    account?.source !== 'accessKey' ||
    !('accessKeyAddress' in account) ||
    !keychainErrors.has(error.errorName)
  )
    return new TempoExecutionError(base)

  const keyed = {
    ...base,
    account: account.address,
    accessKey: account.accessKeyAddress as Address,
  }
  const keychain = {
    address: Addresses.accountKeychain,
    abi: Abis.accountKeychain,
  } as const

  if (error.errorName === 'SpendingLimitExceeded') {
    // Reverts come from the call itself. Without revert data, the fee payment exceeded the limit.
    const fee = !/execution reverted/i.test(cause.details)
    const { amount, token } = fee
      ? { amount: undefined, token: getFeeToken(client, parameters) }
      : getSpend(parameters)
    if (!token)
      return new AccessKeySpendingLimitExceededError({
        ...keyed,
        fee,
        hints: fee ? [...hints, 'Pay fees with another token.'] : hints,
      })
    const args = [keyed.account, keyed.accessKey, token] as const
    const [withPeriod, legacy, decimals] = await multicall(client, {
      allowFailure: true,
      contracts: [
        // `getRemainingLimitWithPeriod` is T3+; `getRemainingLimit` covers earlier hardforks.
        { ...keychain, functionName: 'getRemainingLimitWithPeriod', args },
        { ...keychain, functionName: 'getRemainingLimit', args },
        { address: token, abi: Abis.tip20, functionName: 'decimals' },
      ],
      deployless: true,
    }).catch(() => [])
    return new AccessKeySpendingLimitExceededError({
      ...keyed,
      amount,
      decimals: decimals?.result,
      fee,
      periodEnd: withPeriod?.result?.[1] || undefined,
      remaining: withPeriod?.result?.[0] ?? legacy?.result,
      token,
    })
  }

  if (error.errorName === 'KeyExpired') {
    const [key] = await multicall(client, {
      allowFailure: true,
      contracts: [
        {
          ...keychain,
          functionName: 'getKey',
          args: [keyed.account, keyed.accessKey],
        },
      ],
      deployless: true,
    }).catch(() => [])
    return new AccessKeyExpiredError({ ...keyed, expiry: key?.result?.expiry })
  }

  if (error.errorName === 'CallNotAllowed')
    return new AccessKeyCallNotAllowedError({
      ...keyed,
      selector: (parameters.data as Hex | undefined)?.slice(0, 10) as Hex,
      target: parameters.to ?? parameters.address,
    })

  return new AccessKeyError(keyed)
}

/** Reads the TIP-20 token and `amount` argument of a call. */
function getSpend(parameters: Record<string, any>) {
  const { abi, address, args, functionName } = parameters as {
    abi?: Abi
    address?: Address
    args?: readonly unknown[]
    functionName?: string
  }
  if (!address?.toLowerCase().startsWith('0x20c0')) return {}
  const item = abi?.find(
    (item) => item.type === 'function' && item.name === functionName,
  )
  const index =
    item?.type === 'function'
      ? item.inputs.findIndex((input) => input.name === 'amount')
      : -1
  const amount = index >= 0 ? args?.[index] : undefined
  return {
    amount: typeof amount === 'bigint' ? amount : undefined,
    token: address,
  }
}

function getFeeToken(client: Client, parameters: Record<string, any>) {
  const feeToken =
    parameters.feeToken ??
    (client.chain as { feeToken?: TokenId.TokenIdOrAddress } | undefined)
      ?.feeToken
  return feeToken === undefined || feeToken === null
    ? undefined
    : TokenId.toAddress(feeToken)
}
