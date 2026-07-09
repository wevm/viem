import { AbiError, AbiFunction, Hex } from 'ox'
import type { Address } from 'ox'
import type { Execute } from 'ox/erc7821'

import * as ContractError from '../../ContractError.js'
import { BaseError } from '../../Errors.js'
import { getRevertData } from '../../internal/errors.js'
import type { Call } from '../internal/calls.js'

/** Revert selector a Solady `Receiver` returns for unknown selectors. */
const fnSelectorNotRecognizedSelector = AbiError.getSelector(
  AbiError.from('error FnSelectorNotRecognized()'),
)

/**
 * Maps an error thrown while broadcasting an ERC-7821 `execute` transaction
 * to the call that reverted (decoding against each call's `abi`), falling
 * back to the original error when no call matches.
 *
 * @internal
 */
export function getExecuteError(
  error: Error,
  options: { calls: readonly Call[]; sender?: Address.Address | undefined },
): Error {
  const data = getRevertData(error)
  if (!data || data === '0x') return error
  if (data === fnSelectorNotRecognizedSelector)
    return new FunctionSelectorNotRecognizedError()
  if (Hex.size(data) < 4) return error

  const selector = Hex.slice(data, 0, 4)
  const call = options.calls.find((call) => {
    if (!call.abi) return false
    try {
      return Boolean(AbiError.fromAbi(call.abi, selector))
    } catch {
      return false
    }
  })
  if (!call?.abi || !call.functionName) return error

  return ContractError.fromError(error, {
    abi: call.abi,
    address: call.to,
    args: call.args,
    functionName: call.functionName,
    sender: options.sender,
  })
}

export declare namespace getExecuteError {
  type ErrorType =
    | ContractError.fromError.ErrorType
    | FunctionSelectorNotRecognizedError
}

/**
 * Normalizes a batch of {@link Call}s (raw or contract-style) into the raw
 * `{ data, to, value }` shape ERC-7821 execution data encodes.
 *
 * @internal
 */
export function normalizeCalls(calls: readonly Call[]): Execute.Call[] {
  return calls.map((call) => {
    const data = call.abi
      ? AbiFunction.encodeData(
          AbiFunction.fromAbi(call.abi, call.functionName, {
            args: call.args,
          }),
          call.args,
        )
      : call.data
    return {
      data: call.dataSuffix && data ? Hex.concat(data, call.dataSuffix) : data,
      to: call.to,
      value: call.value,
    }
  })
}

/** Thrown when a call in the batch targets a function the contract does not recognize. */
export class FunctionSelectorNotRecognizedError extends BaseError {
  override readonly name = 'Actions.erc7821.FunctionSelectorNotRecognizedError'

  constructor() {
    super('Function is not recognized.', {
      metaMessages: [
        'This could be due to any of the following:',
        '  - The contract does not have the function,',
        '  - The address is not a contract.',
      ],
    })
  }
}
