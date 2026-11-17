import type { Abi, Address, Hex } from 'ox'
import { AbiFunction, AbiItem } from 'ox'

import * as Account from '../../core/Account.js'
import type * as Client from '../../core/Client.js'
import { call } from '../../core/actions/call.js'
import { read } from '../../core/actions/contract/read.js'
import { TransactionReceiptRevertedError } from '../../core/actions/transaction/sendRawSync.js'
import { BaseError } from '../../core/Errors.js'
import * as ExecutionError from '../ExecutionError.js'
import { errorResolvers as accessKeyResolvers } from '../actions/accessKey/errors.js'
import { errorResolvers as ammResolvers } from '../actions/amm/errors.js'
import { errorResolvers as channelResolvers } from '../actions/channel/errors.js'
import { errorResolvers as dexResolvers } from '../actions/dex/errors.js'
import { errorResolvers as feeResolvers } from '../actions/fee/errors.js'
import { errorResolvers as nonceResolvers } from '../actions/nonce/errors.js'
import { errorResolvers as policyResolvers } from '../actions/policy/errors.js'
import { errorResolvers as tokenResolvers } from '../actions/token/errors.js'
import { TempoExecutionError } from '../errors.js'
import type { Context, Resolvers, withExecutionError } from './errors.js'

/** Node messages that carry no revert data, mapped to the error they describe. */
const messages = [
  [/Access key expired: expiry \d+ <= min allowed \d+/, 'ExpiryInPast()'],
] as const

/** Converts an action failure into a {@link TempoExecutionError} when it carries a decoded Tempo error. */
export async function toExecutionError(
  cause: unknown,
  options: withExecutionError.Options,
) {
  if (!(cause instanceof BaseError)) return cause
  const { client } = options
  const parameters = options.parameters as Record<string, any>
  const source = (await replay(cause, client, parameters)) ?? cause
  const details = source.details ?? ''
  const error = (() => {
    const error = ExecutionError.from(source)
    if (error.errorName !== 'unknown') return error
    const signature = messages.find(([pattern]) => pattern.test(details))?.[1]
    if (!signature) return undefined
    const decoded = ExecutionError.from(AbiItem.getSelector(signature))
    return decoded.errorName === 'unknown' ? undefined : decoded
  })()
  if (!error) return cause

  const signature = AbiItem.getSignature(
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
  const account = account_ ? Account.from(account_) : undefined
  const context: Context = {
    base,
    call: getCall(parameters),
    client,
    details,
    parameters,
    read: (options) =>
      read(client, options as read.Options).then(
        (result) => result as never,
        () => undefined,
      ),
    signer: account && {
      address: account.address,
      accessKey:
        'accessKeyAddress' in account
          ? (account.accessKeyAddress as Address.Address | undefined)
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
  return new TempoExecutionError(base)
}

/** Replays a call whose receipt reverted, to recover its revert data. */
async function replay(
  cause: BaseError,
  client: Client.Client,
  parameters: Record<string, any>,
) {
  const reverted = cause.walk(
    (error) => error instanceof TransactionReceiptRevertedError,
  ) as TransactionReceiptRevertedError | null
  // The reverted error carries the full receipt at runtime.
  const blockNumber = (
    reverted?.receipt as { blockNumber?: bigint | undefined } | undefined
  )?.blockNumber
  const to = parameters.to ?? parameters.address
  const data: Hex.Hex | undefined =
    parameters.data ??
    (parameters.abi && parameters.functionName
      ? AbiFunction.encodeData(
          AbiFunction.fromAbi(parameters.abi, parameters.functionName, {
            args: parameters.args,
          }),
          parameters.args,
        )
      : undefined)
  if (!reverted || blockNumber === undefined || !to || !data) return undefined
  // Replays on the parent block, so earlier transactions in the same block are not applied.
  return call(client, {
    account: parameters.account ?? client.account,
    blockNumber: blockNumber - 1n,
    data,
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
    abi?: Abi.Abi
    address?: Address.Address
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
    arg: <type>(name: string) =>
      args[inputs.findIndex((input) => input.name === name)] as
        | type
        | undefined,
  }
}
