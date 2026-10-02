import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { erc4337AccountAbi } from '../abis.js'
import type { AaCall, AaCalls } from '../types/transaction.js'

/** An {@link AaCall} with `value`/`data` normalized to defined values. */
export type NormalizedAaCall = {
  to: Address
  data: Hex
  value: bigint
}

/**
 * Parameters passed to an {@link EncodeExecute} function: the account whose
 * wallet bytecode runs the batch, and the (value-bearing) calls in a phase.
 */
export type EncodeExecuteParameters = {
  /** The EIP-8130 account whose wallet bytecode executes the batch. */
  account: Address
  /** The phase's calls, with normalized `value`/`data`. */
  calls: readonly NormalizedAaCall[]
}

/**
 * Encodes a phase of (potentially value-bearing) calls into a single value-less
 * wire call `[to, data]` routed through the account's wallet bytecode.
 *
 * The default ({@link defaultEncodeExecute}) self-calls the account's
 * `executeBatch(Call[])`. Wallets whose bytecode does not expose `executeBatch`
 * MUST supply their own encoder mapping the call intent to a wallet call.
 */
export type EncodeExecute = (parameters: EncodeExecuteParameters) => AaCall

/**
 * Default executor encoding: a self-call to the account's
 * `executeBatch(Call[])`, which performs each value-bearing `CALL`.
 */
export const defaultEncodeExecute: EncodeExecute = ({ account, calls }) => ({
  to: account,
  data: encodeFunctionData({
    abi: erc4337AccountAbi,
    functionName: 'executeBatch',
    args: [
      calls.map((call) => ({
        target: call.to,
        value: call.value,
        data: call.data,
      })),
    ],
  }) as Hex,
})

/**
 * Normalizes a phased call list into the EIP-8130 wire shape (value-less
 * `[to, data]` per call).
 *
 * A phase that contains no value-bearing call passes through unchanged (each
 * call emitted directly as `[to, data]`). A phase that contains any value-bearing
 * call is collapsed into a single wallet-routed call via `encodeExecute`
 * (default: a self-call to `executeBatch`), preserving the phase's atomicity.
 *
 * @example
 * const wire = encodeWalletCalls({
 *   account: account.address,
 *   calls: [[{ to, value: parseEther('1'), data }]],
 * })
 */
export function encodeWalletCalls(parameters: {
  account: Address
  calls: AaCalls
  encodeExecute?: EncodeExecute | undefined
}): AaCalls {
  const { account, calls, encodeExecute = defaultEncodeExecute } = parameters

  return calls.map((phase) => {
    const hasValue = phase.some((call) => call.value && call.value !== 0n)
    if (!hasValue)
      return phase.map((call) => ({ to: call.to, data: call.data ?? '0x' }))

    const normalized = phase.map(
      (call): NormalizedAaCall => ({
        to: call.to,
        value: call.value ?? 0n,
        data: call.data ?? '0x',
      }),
    )
    return [encodeExecute({ account, calls: normalized })]
  })
}
