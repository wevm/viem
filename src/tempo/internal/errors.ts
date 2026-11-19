import type { Address } from 'abitype'
import { TokenId } from 'ox/tempo'
import type {
  MulticallParameters,
  MulticallReturnType,
} from '../../actions/public/multicall.js'
import type { Client } from '../../clients/createClient.js'
import { formatUnits } from '../../utils/unit/formatUnits.js'
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
      // Loaded on failure only, so resolvers and error tables stay out of the success path.
      const { toExecutionError } = await import('./resolveError.js')
      throw await toExecutionError(error, { ...options, client, parameters })
    }
  }) as action
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
  const milliseconds = Number(seconds) * 1000
  // `Date` cannot represent times past ±8.64e15 milliseconds.
  if (!(Math.abs(milliseconds) <= 8.64e15)) return seconds.toString()
  return new Date(milliseconds).toISOString()
}
