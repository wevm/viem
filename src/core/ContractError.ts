import type { Abi, Address } from 'abitype'
import { AbiError, AbiFunction, AbiItem, AbiParameters, Hex } from 'ox'
import type { Errors } from 'ox'

import { BaseError } from './Errors.js'
import * as RpcError from './RpcError.js'
import { getRevertData } from './internal/errors.js'
import * as Json from '../utils/Json.js'

/** JSON-RPC `eth_call` execution-reverted error code. */
const executionRevertedCode = 3

/**
 * Maps a raw error thrown while executing a contract function into the rich
 * {@link ContractFunctionExecutionError}, decoding the revert reason against the
 * provided `abi` where possible.
 */
export function fromError(
  error: Error,
  options: fromError.Options,
): ContractFunctionExecutionError {
  const { abi, address, args, docsPath, functionName, sender } = options

  const data = getRevertData(error)
  const reverted = data !== undefined || hasExecutionReverted(error)

  const cause = (() => {
    if (error instanceof AbiParameters.ZeroDataError)
      return new ContractFunctionZeroDataError({ cause: error, functionName })
    if (reverted)
      return new ContractFunctionRevertedError({
        abi,
        cause: error,
        data,
        functionName,
        message: getRevertMessage(error),
      })
    return error
  })()

  return new ContractFunctionExecutionError(cause, {
    abi,
    args,
    contractAddress: address,
    docsPath,
    functionName,
    sender,
  })
}

export declare namespace fromError {
  type Options = {
    /** ABI of the contract. */
    abi: Abi | readonly unknown[]
    /** Address of the contract. */
    address?: Address | undefined
    /** Arguments passed to the function. */
    args?: unknown | undefined
    /** Docs path appended to the error. */
    docsPath?: string | undefined
    /** Name of the function that was called. */
    functionName: string
    /** Address of the sender (`msg.sender`). */
    sender?: Address | undefined
  }

  type ErrorType = ContractFunctionExecutionError | Errors.GlobalErrorType
}

/**
 * Returns `true` when the error chain signals an EVM execution revert (a
 * {@link RpcError.ExecutionRevertedError}, the `3` error code, or an
 * `execution reverted` message).
 *
 * @internal
 */
function hasExecutionReverted(error: unknown): boolean {
  let current: unknown = error
  while (current && typeof current === 'object') {
    if (current instanceof RpcError.ExecutionRevertedError) return true
    const value = current as {
      code?: unknown
      data?: unknown
      message?: unknown
      cause?: unknown
    }
    if (value.code === executionRevertedCode) return true
    const data = value.data as { code?: unknown } | undefined
    if (data && typeof data === 'object' && data.code === executionRevertedCode)
      return true
    if (
      typeof value.message === 'string' &&
      /execution reverted/i.test(value.message)
    )
      return true
    current = value.cause
  }
  return false
}

/**
 * Extracts the most specific revert message string from the error chain, used
 * as the fallback reason when no decodable revert `data` is present.
 *
 * @internal
 */
function getRevertMessage(error: unknown): string | undefined {
  let current: unknown = error
  let fallback: string | undefined
  while (current && typeof current === 'object') {
    const value = current as {
      data?: unknown
      message?: unknown
      shortMessage?: unknown
      cause?: unknown
    }
    const data = value.data as { message?: unknown } | undefined
    if (data && typeof data === 'object' && typeof data.message === 'string')
      return data.message
    const message =
      typeof value.shortMessage === 'string'
        ? value.shortMessage
        : typeof value.message === 'string'
          ? value.message
          : undefined
    if (message) {
      if (/reverted/i.test(message)) return message
      fallback ??= message
    }
    current = value.cause
  }
  return fallback
}

/**
 * Walks the error chain for the underlying `call` error's `Request Arguments`
 * meta block (`data`, `to`, `value`, …) so contract errors can surface it.
 *
 * @internal
 */
function getCallArgsMeta(error: unknown): readonly string[] | undefined {
  let current: unknown = error
  while (current && typeof current === 'object') {
    const meta = (current as { metaMessages?: unknown }).metaMessages
    if (Array.isArray(meta) && meta.includes('Request Arguments:'))
      return meta as readonly string[]
    current = (current as { cause?: unknown }).cause
  }
  return undefined
}

/** Renders an ABI item with its argument values (e.g. `mint(1, 2)`). */
function formatArgs(args: readonly unknown[] | undefined): string {
  if (!args || args.length === 0) return '()'
  const stringify = (arg: unknown) =>
    JSON.stringify(arg, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    )
  return `(${args
    .map((arg) => (typeof arg === 'object' ? stringify(arg) : arg))
    .join(', ')})`
}

/** Thrown when an unknown error occurs while executing a contract function. */
export class ContractFunctionExecutionError extends BaseError<Error> {
  abi: Abi | readonly unknown[]
  args?: readonly unknown[] | undefined
  contractAddress?: Address | undefined
  formattedArgs?: string | undefined
  functionName: string
  sender?: Address | undefined

  override readonly name = 'ContractFunctionExecutionError'

  constructor(cause: Error, options: ContractFunctionExecutionError.Options) {
    const { abi, args, contractAddress, docsPath, functionName, sender } =
      options

    const abiItem = (() => {
      try {
        return AbiFunction.fromAbi(abi, functionName, {
          args: args as never,
        })
      } catch {
        return undefined
      }
    })()
    const formattedArgs = abiItem
      ? formatArgs(args as readonly unknown[] | undefined)
      : undefined
    const functionWithParams = abiItem ? AbiFunction.format(abiItem) : undefined

    const prettyArgs = Json.prettyPrint(
      {
        address: contractAddress,
        function: functionWithParams,
        args:
          formattedArgs && formattedArgs !== '()'
            ? `${' '.repeat(functionName.length)}${formattedArgs}`
            : undefined,
        sender,
      },
      { indent: 2 },
    )

    const shortMessage =
      'shortMessage' in cause && typeof cause.shortMessage === 'string'
        ? cause.shortMessage
        : (cause.message ??
          `An unknown error occurred while executing the contract function "${functionName}".`)
    const causeMeta =
      'metaMessages' in cause && Array.isArray(cause.metaMessages)
        ? (cause.metaMessages as string[])
        : undefined

    // The underlying `call` error renders the raw call arguments (`data`, `to`,
    // …). Surface them alongside the decoded reason. When the immediate cause is
    // itself the call error, `causeMeta` already holds them — don't duplicate.
    const callArgsMeta = getCallArgsMeta(cause)
    const decodedMeta = causeMeta === callArgsMeta ? undefined : causeMeta

    super(shortMessage, {
      cause,
      docsPath,
      metaMessages: [
        ...(decodedMeta ? [...decodedMeta, ' '] : []),
        ...(prettyArgs ? ['Contract Call:', prettyArgs] : []),
        ...(callArgsMeta ? [' ', ...callArgsMeta] : []),
      ],
    })

    this.abi = abi
    this.args = args as readonly unknown[] | undefined
    this.contractAddress = contractAddress
    this.formattedArgs = formattedArgs
    this.functionName = functionName
    this.sender = sender
  }
}

export declare namespace ContractFunctionExecutionError {
  type Options = {
    /** ABI of the contract. */
    abi: Abi | readonly unknown[]
    /** Arguments passed to the function. */
    args?: unknown | undefined
    /** Address of the contract. */
    contractAddress?: Address | undefined
    /** Docs path appended to the error. */
    docsPath?: string | undefined
    /** Name of the function that was called. */
    functionName: string
    /** Address of the sender (`msg.sender`). */
    sender?: Address | undefined
  }
}

/** Thrown when a contract function reverts (carrying the decoded reason). */
export class ContractFunctionRevertedError extends BaseError<Error> {
  data?: { args?: readonly unknown[] | undefined; name: string } | undefined
  raw?: Hex.Hex | undefined
  reason?: string | undefined
  signature?: Hex.Hex | undefined

  override readonly name = 'ContractFunctionRevertedError'

  constructor(options: ContractFunctionRevertedError.Options) {
    const { abi, cause: error, data, functionName, message } = options

    let cause: Error | undefined
    let decoded:
      | { args?: readonly unknown[] | undefined; name: string }
      | undefined
    let metaMessages: string[] | undefined
    let reason: string | undefined
    let signature: Hex.Hex | undefined

    if (data && data !== '0x') {
      const selector = Hex.slice(data, 0, 4)
      try {
        const abiItem = AbiError.fromAbi(abi, selector)
        const args = AbiError.decode(abiItem, data)
        const errorArgs = Array.isArray(args)
          ? args
          : args === undefined
            ? []
            : [args]
        decoded = { args: errorArgs, name: abiItem.name }
        if (abiItem.name === 'Error') reason = errorArgs[0] as string
        else if (abiItem.name === 'Panic')
          reason = AbiError.panicReasons[Number(errorArgs[0])]
        else {
          const errorWithParams = AbiError.format(abiItem)
          const formattedArgs = formatArgs(errorArgs)
          metaMessages = [
            `Error: ${errorWithParams}`,
            formattedArgs && formattedArgs !== '()'
              ? `       ${' '.repeat(abiItem.name.length)}${formattedArgs}`
              : '',
          ]
        }
      } catch (err) {
        if (err instanceof AbiItem.NotFoundError) {
          signature = selector
          metaMessages = [
            `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
            'Make sure you are using the correct ABI and that the error exists on it.',
          ]
        } else cause = err as Error
      }
    } else if (message) reason = message

    super(
      (reason && reason !== 'execution reverted') || signature
        ? [
            `The contract function "${functionName}" reverted with the following ${
              signature ? 'signature' : 'reason'
            }:`,
            reason || signature,
          ].join('\n')
        : `The contract function "${functionName}" reverted.`,
      { cause: cause ?? error, metaMessages },
    )

    this.data = decoded
    this.raw = data
    this.reason = reason
    this.signature = signature
  }
}

export declare namespace ContractFunctionRevertedError {
  type Options = {
    /** ABI of the contract. */
    abi: Abi | readonly unknown[]
    /** Original error that triggered the revert. */
    cause?: Error | undefined
    /** Raw revert data returned by the node. */
    data?: Hex.Hex | undefined
    /** Name of the function that reverted. */
    functionName: string
    /** Fallback message when no revert data is present. */
    message?: string | undefined
  }
}

/** Thrown when a contract function call returns no data (`0x`). */
export class ContractFunctionZeroDataError extends BaseError<Error> {
  override readonly name = 'ContractFunctionZeroDataError'

  constructor(options: { cause?: Error | undefined; functionName: string }) {
    super(
      `The contract function "${options.functionName}" returned no data ("0x").`,
      {
        cause: options.cause,
        metaMessages: [
          'This could be due to any of the following:',
          `  - The contract does not have the function "${options.functionName}",`,
          '  - The parameters passed to the contract function may be invalid, or',
          '  - The address is not a contract.',
        ],
      },
    )
  }
}

/** A raw contract error carrying the revert `data` returned by a node. */
export class RawContractError extends BaseError<Error> {
  code = executionRevertedCode

  data?: Hex.Hex | { data?: Hex.Hex | undefined } | undefined

  override readonly name = 'RawContractError'

  constructor(
    options: {
      cause?: Error | undefined
      data?: Hex.Hex | { data?: Hex.Hex | undefined } | undefined
      message?: string | undefined
    } = {},
  ) {
    super(options.message ?? '', { cause: options.cause })
    this.data = options.data
  }
}
