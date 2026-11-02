import type { Abi, Address } from 'ox'
import { Value } from 'ox'

import type * as Client from '../../core/Client.js'
import type { read } from '../../core/actions/contract/read.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../core/actions/internal/contract.js'
import type * as ExecutionError from '../ExecutionError.js'
import type { TempoExecutionError } from '../errors.js'

/** Action-specific steps to resolve errors, keyed by error name. Listed before the default steps. */
export type Hints = {
  [name in TempoExecutionError.ErrorName]?: readonly string[]
}

/** Builds a specific error for a decoded Tempo error, or returns `undefined` when it does not apply. */
type Resolver = (
  context: Context,
) => Promise<TempoExecutionError | undefined> | TempoExecutionError | undefined

/** Resolvers keyed by error signature. */
export type Resolvers = {
  [signature in keyof typeof ExecutionError.messages]?: Resolver
}

/** Context passed to {@link Resolver}s. */
export type Context = {
  /** Parameters for the base `TempoExecutionError`. */
  base: TempoExecutionError.Parameters
  client: Client.Client
  /** Signer, with its access key when signing with one. */
  signer:
    | { address: Address.Address; accessKey: Address.Address | undefined }
    | undefined
  /** Contract call that failed, when the action made one. */
  call:
    | {
        address: Address.Address
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
  /** Reads a contract. Resolves `undefined` when the read fails. */
  read: <
    const abi extends Abi.Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
    const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  >(
    options: read.Options<abi, functionName, args>,
  ) => Promise<read.ReturnType<abi, functionName, args> | undefined>
}

/**
 * Runs an action so failures with a decoded Tempo error throw a {@link TempoExecutionError}.
 * Other errors are rethrown unchanged.
 *
 * @internal
 */
export async function withExecutionError<result>(
  fn: () => Promise<result>,
  options: withExecutionError.Options,
): Promise<result> {
  try {
    return await fn()
  } catch (error) {
    // Loaded on failure only, so resolvers and error tables stay out of the success path.
    const { toExecutionError } = await import('./resolveError.js')
    throw await toExecutionError(error, options)
  }
}

export declare namespace withExecutionError {
  type Options = {
    client: Client.Client
    /** Action-specific steps to resolve errors. */
    hints?: Hints | undefined
    /** Action options, including the contract call. */
    parameters: object
  }
}

/** Fee token from the action parameters or chain, when set. */
export function getFeeToken(context: Context): Address.Address | undefined {
  const feeToken =
    context.parameters.feeToken ??
    (context.client.chain as { feeToken?: Address.Address } | undefined)
      ?.feeToken
  return feeToken ?? undefined
}

/** Formats an amount as `formatted (raw)` when decimals are known. */
export function formatAmount(
  value: bigint | undefined,
  decimals: number | undefined,
) {
  if (value === undefined) return undefined
  if (decimals === undefined) return value.toString()
  return `${Value.format(value, decimals)} (${value})`
}

/** Formats Unix seconds as an ISO 8601 string. */
export function formatTime(seconds: bigint | number | undefined) {
  if (!seconds) return undefined
  const milliseconds = Number(seconds) * 1000
  // `Date` cannot represent times past ±8.64e15 milliseconds.
  if (!(Math.abs(milliseconds) <= 8.64e15)) return seconds.toString()
  return new Date(milliseconds).toISOString()
}
