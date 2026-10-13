import type { Abi, Address } from 'abitype'
import { parseAccount } from '../../accounts/utils/parseAccount.js'
import { call } from '../../actions/public/call.js'
import { multicall } from '../../actions/public/multicall.js'
import type { Client } from '../../clients/createClient.js'
import { BaseError } from '../../errors/base.js'
import { TransactionReceiptRevertedError } from '../../errors/transaction.js'
import type { ContractFunctionParameters } from '../../types/contract.js'
import { formatAbiItem } from '../../utils/abi/formatAbiItem.js'
import { toFunctionSelector } from '../../utils/hash/toFunctionSelector.js'
import * as Abis from '../Abis.js'
import {
  errorResolvers as accessKeyResolvers,
  resolveKeychainError,
} from '../actions/accessKey.js'
import { errorResolvers as ammResolvers } from '../actions/amm.js'
import { errorResolvers as channelResolvers } from '../actions/channel.js'
import { errorResolvers as dexResolvers } from '../actions/dex.js'
import { errorResolvers as feeResolvers } from '../actions/fee.js'
import { errorResolvers as nonceResolvers } from '../actions/nonce.js'
import { errorResolvers as policyResolvers } from '../actions/policy.js'
import { errorResolvers as tokenResolvers } from '../actions/token.js'
import * as ExecutionError from '../ExecutionError.js'
import { TempoExecutionError } from '../errors.js'
import type { Context, Hints, Resolvers } from './errors.js'

/** Node messages that carry no revert data, mapped to the error they describe. */
const messages = [
  [/Access key expired: expiry \d+ <= min allowed \d+/, 'ExpiryInPast()'],
] as const

export async function toExecutionError(
  cause: unknown,
  options: {
    client: Client
    hints?: Hints | undefined
    parameters: Record<string, any>
  },
) {
  if (!(cause instanceof BaseError)) return cause
  const { client, parameters } = options
  const source = (await replay(cause, client, parameters)) ?? cause
  const details = source.details ?? ''
  let error: ExecutionError.ExecutionError = ExecutionError.from(source)
  if (error.errorName === 'unknown') {
    const signature = messages.find(([pattern]) => pattern.test(details))?.[1]
    if (!signature) return cause
    error = ExecutionError.from(toFunctionSelector(signature))
  }
  if (error.errorName === 'unknown') return cause

  const signature = formatAbiItem(
    error.abiItem,
  ) as keyof typeof ExecutionError.messages
  // Solidity `Error(string)` and `Panic(uint256)` are not Tempo errors.
  if (!(signature in ExecutionError.messages)) return cause
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
    validation: !hasRevertData(source),
  }

  for (const resolvers of [
    accessKeyResolvers,
    ammResolvers,
    channelResolvers,
    dexResolvers,
    feeResolvers,
    nonceResolvers,
    policyResolvers,
    tokenResolvers,
  ] as readonly Resolvers[]) {
    const result = await resolvers[signature]?.(context)
    if (result) return result
  }
  const keychain = Abis.accountKeychain.some(
    (item) => item.type === 'error' && formatAbiItem(item) === signature,
  )
  return (
    (keychain && resolveKeychainError(context)) || new TempoExecutionError(base)
  )
}

/** Replays a call whose receipt reverted, to recover its revert data. */
async function replay(
  cause: BaseError,
  client: Client,
  parameters: Record<string, any>,
) {
  const reverted = cause.walk(
    (error) => error instanceof TransactionReceiptRevertedError,
  ) as TransactionReceiptRevertedError | null
  const to = parameters.to ?? parameters.address
  if (!reverted || !to || !parameters.data) return undefined
  // ponytail: replays on the parent block, so earlier transactions in the same block are not applied.
  return call(client, {
    account: parameters.account ?? client.account,
    blockNumber: reverted.receipt.blockNumber - 1n,
    data: parameters.data,
    to,
    value: parameters.value,
  }).then(
    () => undefined,
    (error) => (error instanceof BaseError ? error : undefined),
  )
}

/** Whether an error carries revert data, which only execution reverts have. */
function hasRevertData(error: BaseError) {
  return !!error.walk((error) => {
    const { data, raw } = error as { data?: unknown; raw?: unknown }
    const hex =
      typeof data === 'object' && data !== null
        ? (data as { data?: unknown }).data
        : (data ?? raw)
    return typeof hex === 'string' && hex.length >= 10
  })
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
