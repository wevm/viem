import type { Address } from 'abitype'
import * as Hex from 'ox/Hex'
import type { Account } from '../../accounts/types.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { zeroAddress } from '../../constants/address.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { GetEventArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { Compute } from '../../types/utils.js'
import { parseEventLogs } from '../../utils/abi/parseEventLogs.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'
import type { TransactionReceipt } from '../Transaction.js'

/**
 * Gets the master address for a given master ID.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const address = await Actions.virtualAddress.getMasterAddress(client, {
 *   masterId: '0xdeadbeef',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The master address, or null if unregistered.
 */
export async function getMasterAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getMasterAddress.Parameters,
): Promise<getMasterAddress.ReturnValue> {
  const address = await readContract(client, {
    ...parameters,
    ...getMasterAddress.call({ masterId: parameters.masterId }),
  })
  if (address === zeroAddress) return null
  return address
}

export namespace getMasterAddress {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The master ID (bytes4). */
    masterId: Hex
  }

  export type ReturnValue = Address | null

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /**
   * Defines a call to the `getMaster` function.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { masterId } = args
    return defineCall({
      address: Addresses.addressRegistry,
      abi: Abis.addressRegistry,
      args: [masterId],
      functionName: 'getMaster',
    })
  }
}

/**
 * Resolves a virtual address to its master address.
 *
 * - Non-virtual addresses are returned unchanged.
 * - Virtual addresses with a registered master return the master address.
 * - Virtual addresses with an unregistered master return null.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const recipient = await Actions.virtualAddress.resolve(client, {
 *   address: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The resolved address, or null if virtual and unregistered.
 */
export async function resolve<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: resolve.Parameters,
): Promise<resolve.ReturnValue> {
  if (!isVirtual(parameters.address)) return parameters.address

  const masterId = Hex.slice(parameters.address, 0, 4)
  return getMasterAddress(client, { ...parameters, masterId })
}

export namespace resolve {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** The address to resolve. */
    address: Address
  }

  export type ReturnValue = Address | null

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Registers a virtual master address.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const hash = await Actions.virtualAddress.registerMaster(client, {
 *   salt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function registerMaster<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: registerMaster.Parameters<chain, account>,
): Promise<registerMaster.ReturnValue> {
  return registerMaster.inner(writeContract, client, parameters)
}

export namespace registerMaster {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The salt (bytes32) used for proof-of-work master ID derivation. */
    salt: Hex
  }

  export type ReturnValue = WriteContractReturnType

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType

  /** @internal */
  export async function inner<
    action extends typeof writeContract | typeof writeContractSync,
    chain extends Chain | undefined,
    account extends Account | undefined,
  >(
    action: action,
    client: Client<Transport, chain, account>,
    parameters: registerMaster.Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { salt, ...rest } = parameters
    const call = registerMaster.call({ salt })
    return (await action(client, {
      ...rest,
      ...call,
    } as never)) as never
  }

  /**
   * Defines a call to the `registerVirtualMaster` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.virtualAddress.registerMaster.call({
   *       salt: '0x...',
   *     }),
   *   ]
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { salt } = args
    return defineCall({
      address: Addresses.addressRegistry,
      abi: Abis.addressRegistry,
      functionName: 'registerVirtualMaster',
      args: [salt],
    })
  }

  export function extractEvent(logs: import('../../types/log.js').Log[]) {
    const [log] = parseEventLogs({
      abi: Abis.addressRegistry,
      logs,
      eventName: 'MasterRegistered',
      strict: true,
    })
    if (!log) throw new Error('`MasterRegistered` event not found.')
    return log
  }
}

/**
 * Registers a virtual master address and waits for confirmation.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 * import { privateKeyToAccount } from 'viem/accounts'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: tempo.extend({ feeToken: '0x20c0000000000000000000000000000000000001' })
 *   transport: http(),
 * })
 *
 * const { receipt, masterId, masterAddress } = await Actions.virtualAddress.registerMasterSync(client, {
 *   salt: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt and extracted event data.
 */
export async function registerMasterSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: registerMasterSync.Parameters<chain, account>,
): Promise<registerMasterSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await registerMaster.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  const { args } = registerMaster.extractEvent(receipt.logs)
  return {
    ...args,
    receipt,
  } as never
}

export namespace registerMasterSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = registerMaster.Parameters<chain, account>

  export type Args = registerMaster.Args

  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.addressRegistry,
      'MasterRegistered',
      { IndexedOnly: false; Required: true }
    > & {
      receipt: TransactionReceipt
    }
  >

  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

const virtualMagic = '0xfdfdfdfdfdfdfdfdfdfd'

/** @internal */
function isVirtual(address: string): boolean {
  return Hex.slice(address as Hex.Hex, 4, 14).toLowerCase() === virtualMagic
}
