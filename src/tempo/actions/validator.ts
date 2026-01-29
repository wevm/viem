import type { Address } from 'abitype'
import type { Hex } from 'ox/Hex'
import type { Account } from '../../accounts/types.js'
import type { ReadContractReturnType } from '../../actions/public/readContract.js'
import { readContract } from '../../actions/public/readContract.js'
import type { WriteContractReturnType } from '../../actions/wallet/writeContract.js'
import { writeContract } from '../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../actions/wallet/writeContractSync.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { BaseErrorType } from '../../errors/base.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionReceipt } from '../../types/transaction.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Adds a new validator (owner only).
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.add(client, {
 *   newValidatorAddress: '0x...',
 *   publicKey: '0x...',
 *   active: true,
 *   inboundAddress: '192.168.1.1:8080',
 *   outboundAddress: '192.168.1.1:8080',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function add<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: add.Parameters<chain, account>,
): Promise<add.ReturnValue> {
  return add.inner(writeContract, client, parameters)
}

export namespace add {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The address of the new validator. */
    newValidatorAddress: Address
    /** The validator's communication public key. */
    publicKey: Hex
    /** Whether the validator should be active. */
    active: boolean
    /** The validator's inbound address `<hostname|ip>:<port>` for incoming connections. */
    inboundAddress: string
    /** The validator's outbound IP address `<ip>:<port>` for firewall whitelisting (IP only, no hostnames). */
    outboundAddress: string
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      newValidatorAddress,
      publicKey,
      active,
      inboundAddress,
      outboundAddress,
      ...rest
    } = parameters
    const callData = add.call({
      newValidatorAddress,
      publicKey,
      active,
      inboundAddress,
      outboundAddress,
    })
    return (await action(client, {
      ...rest,
      ...callData,
    } as never)) as never
  }

  /**
   * Defines a call to the `addValidator` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.validator.add.call({
   *       newValidatorAddress: '0x...',
   *       publicKey: '0x...',
   *       active: true,
   *       inboundAddress: '192.168.1.1:8080',
   *       outboundAddress: '192.168.1.1:8080',
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      newValidatorAddress,
      publicKey,
      active,
      inboundAddress,
      outboundAddress,
    } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [
        newValidatorAddress,
        publicKey,
        active,
        inboundAddress,
        outboundAddress,
      ],
      functionName: 'addValidator',
    })
  }
}

/**
 * Adds a new validator (owner only) and waits for the transaction receipt.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.addSync(client, {
 *   newValidatorAddress: '0x...',
 *   publicKey: '0x...',
 *   active: true,
 *   inboundAddress: '192.168.1.1:8080',
 *   outboundAddress: '192.168.1.1:8080',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function addSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: addSync.Parameters<chain, account>,
): Promise<addSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await add.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace addSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = add.Parameters<chain, account>

  export type Args = add.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}

/**
 * Changes the owner of the validator config precompile.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.changeOwner(client, {
 *   newOwner: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function changeOwner<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeOwner.Parameters<chain, account>,
): Promise<changeOwner.ReturnValue> {
  return changeOwner.inner(writeContract, client, parameters)
}

export namespace changeOwner {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The new owner address. */
    newOwner: Address
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { newOwner, ...rest } = parameters
    const callData = changeOwner.call({ newOwner })
    return (await action(client, {
      ...rest,
      ...callData,
    } as never)) as never
  }

  /**
   * Defines a call to the `changeOwner` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.validator.changeOwner.call({
   *       newOwner: '0x...',
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { newOwner } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [newOwner],
      functionName: 'changeOwner',
    })
  }
}

/**
 * Changes the owner and waits for the transaction receipt.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.changeOwnerSync(client, {
 *   newOwner: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function changeOwnerSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeOwnerSync.Parameters<chain, account>,
): Promise<changeOwnerSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await changeOwner.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace changeOwnerSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = changeOwner.Parameters<chain, account>

  export type Args = changeOwner.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}

/**
 * Changes validator active status (owner only).
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.changeStatus(client, {
 *   validator: '0x...',
 *   active: false,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function changeStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeStatus.Parameters<chain, account>,
): Promise<changeStatus.ReturnValue> {
  return changeStatus.inner(writeContract, client, parameters)
}

export namespace changeStatus {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The validator address. */
    validator: Address
    /** Whether the validator should be active. */
    active: boolean
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { validator, active, ...rest } = parameters
    const callData = changeStatus.call({ validator, active })
    return (await action(client, {
      ...rest,
      ...callData,
    } as never)) as never
  }

  /**
   * Defines a call to the `changeValidatorStatus` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.validator.changeStatus.call({
   *       validator: '0x...',
   *       active: false,
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { validator, active } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [validator, active],
      functionName: 'changeValidatorStatus',
    })
  }
}

/**
 * Changes validator active status and waits for the transaction receipt.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.changeStatusSync(client, {
 *   validator: '0x...',
 *   active: false,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function changeStatusSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeStatusSync.Parameters<chain, account>,
): Promise<changeStatusSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await changeStatus.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace changeStatusSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = changeStatus.Parameters<chain, account>

  export type Args = changeStatus.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}

/**
 * Gets the next epoch for a full DKG ceremony.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const epoch = await Actions.validator.getNextFullDkgCeremony(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The epoch number for the next full DKG ceremony.
 */
export async function getNextFullDkgCeremony<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getNextFullDkgCeremony.Parameters = {},
): Promise<getNextFullDkgCeremony.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getNextFullDkgCeremony.call(),
  })
}

export namespace getNextFullDkgCeremony {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'getNextFullDkgCeremony',
    never
  >

  /**
   * Defines a call to the `getNextFullDkgCeremony` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [Actions.validator.getNextFullDkgCeremony.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [],
      functionName: 'getNextFullDkgCeremony',
    })
  }
}

/**
 * Gets the contract owner.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const owner = await Actions.validator.getOwner(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The owner address.
 */
export async function getOwner<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getOwner.Parameters = {},
): Promise<getOwner.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getOwner.call(),
  })
}

export namespace getOwner {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'owner',
    never
  >

  /**
   * Defines a call to the `owner` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [Actions.validator.getOwner.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [],
      functionName: 'owner',
    })
  }
}

/**
 * Gets validator information by address.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const validator = await Actions.validator.get(client, {
 *   validator: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The validator information.
 */
export async function get<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: get.Parameters,
): Promise<get.ReturnValue> {
  const { validator, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...get.call({ validator }),
  })
}

export namespace get {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Validator address. */
    validator: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'validators',
    never
  >

  /**
   * Defines a call to the `validators` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.validator.get.call({ validator: '0x...' }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { validator } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [validator],
      functionName: 'validators',
    })
  }
}

/**
 * Gets validator address by index.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const validatorAddress = await Actions.validator.getByIndex(client, {
 *   index: 0n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The validator address at the given index.
 */
export async function getByIndex<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getByIndex.Parameters,
): Promise<getByIndex.ReturnValue> {
  const { index, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getByIndex.call({ index }),
  })
}

export namespace getByIndex {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Validator index. */
    index: bigint
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'validatorsArray',
    never
  >

  /**
   * Defines a call to the `validatorsArray` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [
   *     Actions.validator.getByIndex.call({ index: 0n }),
   *     Actions.validator.getByIndex.call({ index: 1n }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { index } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [index],
      functionName: 'validatorsArray',
    })
  }
}

/**
 * Gets the total number of validators.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const count = await Actions.validator.getCount(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The total number of validators.
 */
export async function getCount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getCount.Parameters = {},
): Promise<getCount.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getCount.call(),
  })
}

export namespace getCount {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'validatorCount',
    never
  >

  /**
   * Defines a call to the `validatorCount` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [Actions.validator.getCount.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [],
      functionName: 'validatorCount',
    })
  }
}

/**
 * Gets the complete set of validators.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const validators = await Actions.validator.list(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Array of all validators with their information.
 */
export async function list<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: list.Parameters = {},
): Promise<list.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...list.call(),
  })
}

export namespace list {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validator,
    'getValidators',
    never
  >

  /**
   * Defines a call to the `getValidators` function.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`multicall`](https://viem.sh/docs/contract/multicall): execute multiple calls in parallel
   *
   * @example
   * ```ts
   * import { createClient, http } from 'viem'
   * import { tempo } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * })
   *
   * const result = await client.multicall({
   *   contracts: [Actions.validator.list.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [],
      functionName: 'getValidators',
    })
  }
}

/**
 * Sets the next epoch for a full DKG ceremony.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.setNextFullDkgCeremony(client, {
 *   epoch: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function setNextFullDkgCeremony<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setNextFullDkgCeremony.Parameters<chain, account>,
): Promise<setNextFullDkgCeremony.ReturnValue> {
  return setNextFullDkgCeremony.inner(writeContract, client, parameters)
}

export namespace setNextFullDkgCeremony {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The epoch number for the next full DKG ceremony. */
    epoch: bigint
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const { epoch, ...rest } = parameters
    const callData = setNextFullDkgCeremony.call({ epoch })
    return (await action(client, {
      ...rest,
      ...callData,
    } as never)) as never
  }

  /**
   * Defines a call to the `setNextFullDkgCeremony` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.validator.setNextFullDkgCeremony.call({
   *       epoch: 100n,
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { epoch } = args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [epoch],
      functionName: 'setNextFullDkgCeremony',
    })
  }
}

/**
 * Sets the next epoch for a full DKG ceremony and waits for the transaction receipt.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.setNextFullDkgCeremonySync(client, {
 *   epoch: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function setNextFullDkgCeremonySync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: setNextFullDkgCeremonySync.Parameters<chain, account>,
): Promise<setNextFullDkgCeremonySync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await setNextFullDkgCeremony.inner(
    writeContractSync,
    client,
    {
      ...rest,
      throwOnReceiptRevert,
    } as never,
  )
  return { receipt }
}

export namespace setNextFullDkgCeremonySync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = setNextFullDkgCeremony.Parameters<chain, account>

  export type Args = setNextFullDkgCeremony.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}

/**
 * Updates validator information (only callable by the validator themselves).
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.update(client, {
 *   newValidatorAddress: '0x...',
 *   publicKey: '0x...',
 *   inboundAddress: '192.168.1.1:8080',
 *   outboundAddress: '192.168.1.1:8080',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function update<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: update.Parameters<chain, account>,
): Promise<update.ReturnValue> {
  return update.inner(writeContract, client, parameters)
}

export namespace update {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args

  export type Args = {
    /** The new address for this validator. */
    newValidatorAddress: Address
    /** The validator's new communication public key. */
    publicKey: Hex
    /** The validator's inbound address `<hostname|ip>:<port>` for incoming connections. */
    inboundAddress: string
    /** The validator's outbound IP address `<ip>:<port>` for firewall whitelisting (IP only, no hostnames). */
    outboundAddress: string
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
    parameters: Parameters<chain, account>,
  ): Promise<ReturnType<action>> {
    const {
      newValidatorAddress,
      publicKey,
      inboundAddress,
      outboundAddress,
      ...rest
    } = parameters
    const callData = update.call({
      newValidatorAddress,
      publicKey,
      inboundAddress,
      outboundAddress,
    })
    return (await action(client, {
      ...rest,
      ...callData,
    } as never)) as never
  }

  /**
   * Defines a call to the `updateValidator` function.
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
   *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
   *   transport: http(),
   * }).extend(walletActions)
   *
   * const { result } = await client.sendCalls({
   *   calls: [
   *     Actions.validator.update.call({
   *       newValidatorAddress: '0x...',
   *       publicKey: '0x...',
   *       inboundAddress: '192.168.1.1:8080',
   *       outboundAddress: '192.168.1.1:8080',
   *     }),
   *   ],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { newValidatorAddress, publicKey, inboundAddress, outboundAddress } =
      args
    return defineCall({
      address: Addresses.validator,
      abi: Abis.validator,
      args: [newValidatorAddress, publicKey, inboundAddress, outboundAddress],
      functionName: 'updateValidator',
    })
  }
}

/**
 * Updates validator information and waits for the transaction receipt.
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
 *   chain: tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }),
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.updateSync(client, {
 *   newValidatorAddress: '0x...',
 *   publicKey: '0x...',
 *   inboundAddress: '192.168.1.1:8080',
 *   outboundAddress: '192.168.1.1:8080',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function updateSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateSync.Parameters<chain, account>,
): Promise<updateSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await update.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace updateSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = update.Parameters<chain, account>

  export type Args = update.Args

  export type ReturnValue = {
    receipt: TransactionReceipt
  }
}
