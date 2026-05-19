import type * as Hex from 'ox/Hex'
import * as ox_Hex from 'ox/Hex'
import * as ox_Log from 'ox/Log'

export * from 'ox/Log'

export type Log<
  pending extends boolean = false,
  bigintType = bigint,
  numberType = number,
> = ox_Log.Log<pending, bigintType, numberType> & {
  /** Timestamp of block containing this log or `null` if pending. */
  blockTimestamp?: (pending extends true ? null : bigintType) | undefined
}

export type Rpc<pending extends boolean = false> = ox_Log.Rpc<pending> & {
  /** Timestamp of block containing this log or `null` if pending. */
  blockTimestamp?: (pending extends true ? null : Hex.Hex) | undefined
}

/**
 * Converts a {@link Log.Rpc} to a {@link Log.Log}.
 */
export function fromRpc<
  const log extends Rpc<boolean>,
  pending extends boolean = false,
>(
  log: log | Rpc<boolean>,
  options: fromRpc.Options<pending> = {},
): Log<pending> {
  return {
    ...ox_Log.fromRpc(log, options),
    blockTimestamp:
      log.blockTimestamp === null
        ? null
        : log.blockTimestamp === undefined
          ? undefined
          : ox_Hex.toBigInt(log.blockTimestamp),
  } as Log<pending>
}

export declare namespace fromRpc {
  type Options<pending extends boolean = false> =
    ox_Log.fromRpc.Options<pending>

  type ErrorType = ox_Log.fromRpc.ErrorType | ox_Hex.toBigInt.ErrorType
}

/**
 * Converts a {@link Log.Log} to a {@link Log.Rpc}.
 */
export function toRpc<
  const log extends Log<boolean>,
  pending extends boolean = false,
>(log: log | Log<boolean>, options: toRpc.Options<pending> = {}): Rpc<pending> {
  return {
    ...ox_Log.toRpc(log, options),
    blockTimestamp:
      log.blockTimestamp === null
        ? null
        : log.blockTimestamp === undefined
          ? undefined
          : ox_Hex.fromNumber(log.blockTimestamp),
  } as Rpc<pending>
}

export declare namespace toRpc {
  type Options<pending extends boolean = false> = ox_Log.toRpc.Options<pending>

  type ErrorType = ox_Log.toRpc.ErrorType | ox_Hex.fromNumber.ErrorType
}
