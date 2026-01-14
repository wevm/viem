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

// ============================================================================
// Read Actions
// ============================================================================

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
 * const validators = await Actions.validatorConfig.getValidators(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns Array of all validators with their information.
 */
export async function getValidators<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getValidators.Parameters = {},
): Promise<getValidators.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getValidators.call(),
  })
}

export namespace getValidators {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validatorConfig,
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
   *   contracts: [Actions.validatorConfig.getValidators.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
      args: [],
      functionName: 'getValidators',
    })
  }
}

/**
 * Gets the owner of the validator config precompile.
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
 * const owner = await Actions.validatorConfig.getOwner(client)
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
    typeof Abis.validatorConfig,
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
   *   contracts: [Actions.validatorConfig.getOwner.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
      args: [],
      functionName: 'owner',
    })
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
 * const epoch = await Actions.validatorConfig.getNextFullDkgCeremony(client)
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
    typeof Abis.validatorConfig,
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
   *   contracts: [Actions.validatorConfig.getNextFullDkgCeremony.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
      args: [],
      functionName: 'getNextFullDkgCeremony',
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
 * const validator = await Actions.validatorConfig.getValidator(client, {
 *   validator: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The validator information.
 */
export async function getValidator<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getValidator.Parameters,
): Promise<getValidator.ReturnValue> {
  const { validator, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getValidator.call({ validator }),
  })
}

export namespace getValidator {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Validator address. */
    validator: Address
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validatorConfig,
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
   *     Actions.validatorConfig.getValidator.call({ validator: '0x...' }),
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const validatorAddress = await Actions.validatorConfig.getValidatorByIndex(client, {
 *   index: 0n,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The validator address at the given index.
 */
export async function getValidatorByIndex<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getValidatorByIndex.Parameters,
): Promise<getValidatorByIndex.ReturnValue> {
  const { index, ...rest } = parameters
  return readContract(client, {
    ...rest,
    ...getValidatorByIndex.call({ index }),
  })
}

export namespace getValidatorByIndex {
  export type Parameters = ReadParameters & Args

  export type Args = {
    /** Validator index. */
    index: bigint
  }

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validatorConfig,
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
   *     Actions.validatorConfig.getValidatorByIndex.call({ index: 0n }),
   *     Actions.validatorConfig.getValidatorByIndex.call({ index: 1n }),
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const count = await Actions.validatorConfig.getValidatorCount(client)
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The total number of validators.
 */
export async function getValidatorCount<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: getValidatorCount.Parameters = {},
): Promise<getValidatorCount.ReturnValue> {
  return readContract(client, {
    ...parameters,
    ...getValidatorCount.call(),
  })
}

export namespace getValidatorCount {
  export type Parameters = ReadParameters

  export type ReturnValue = ReadContractReturnType<
    typeof Abis.validatorConfig,
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
   *   contracts: [Actions.validatorConfig.getValidatorCount.call()],
   * })
   * ```
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
      args: [],
      functionName: 'validatorCount',
    })
  }
}

// ============================================================================
// Write Actions
// ============================================================================

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
 * const hash = await Actions.validatorConfig.addValidator(client, {
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
export async function addValidator<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: addValidator.Parameters<chain, account>,
): Promise<addValidator.ReturnValue> {
  return addValidator.inner(writeContract, client, parameters)
}

export namespace addValidator {
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
    const callData = addValidator.call({
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
   *     Actions.validatorConfig.addValidator.call({
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const { receipt } = await Actions.validatorConfig.addValidatorSync(client, {
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
export async function addValidatorSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: addValidatorSync.Parameters<chain, account>,
): Promise<addValidatorSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await addValidator.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace addValidatorSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = addValidator.Parameters<chain, account>

  export type Args = addValidator.Args

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
 * const hash = await Actions.validatorConfig.updateValidator(client, {
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
export async function updateValidator<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateValidator.Parameters<chain, account>,
): Promise<updateValidator.ReturnValue> {
  return updateValidator.inner(writeContract, client, parameters)
}

export namespace updateValidator {
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
    const callData = updateValidator.call({
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
   *     Actions.validatorConfig.updateValidator.call({
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const { receipt } = await Actions.validatorConfig.updateValidatorSync(client, {
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
export async function updateValidatorSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: updateValidatorSync.Parameters<chain, account>,
): Promise<updateValidatorSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await updateValidator.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace updateValidatorSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = updateValidator.Parameters<chain, account>

  export type Args = updateValidator.Args

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
 * const hash = await Actions.validatorConfig.changeValidatorStatus(client, {
 *   validator: '0x...',
 *   active: false,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function changeValidatorStatus<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeValidatorStatus.Parameters<chain, account>,
): Promise<changeValidatorStatus.ReturnValue> {
  return changeValidatorStatus.inner(writeContract, client, parameters)
}

export namespace changeValidatorStatus {
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
    const callData = changeValidatorStatus.call({ validator, active })
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
   *     Actions.validatorConfig.changeValidatorStatus.call({
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const { receipt } = await Actions.validatorConfig.changeValidatorStatusSync(client, {
 *   validator: '0x...',
 *   active: false,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction receipt.
 */
export async function changeValidatorStatusSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: changeValidatorStatusSync.Parameters<chain, account>,
): Promise<changeValidatorStatusSync.ReturnValue> {
  const { throwOnReceiptRevert = true, ...rest } = parameters
  const receipt = await changeValidatorStatus.inner(writeContractSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt }
}

export namespace changeValidatorStatusSync {
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = changeValidatorStatus.Parameters<chain, account>

  export type Args = changeValidatorStatus.Args

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
 * const hash = await Actions.validatorConfig.changeOwner(client, {
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
   *     Actions.validatorConfig.changeOwner.call({
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const { receipt } = await Actions.validatorConfig.changeOwnerSync(client, {
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
 * const hash = await Actions.validatorConfig.setNextFullDkgCeremony(client, {
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
   *     Actions.validatorConfig.setNextFullDkgCeremony.call({
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
      address: Addresses.validatorConfig,
      abi: Abis.validatorConfig,
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
 * const { receipt } = await Actions.validatorConfig.setNextFullDkgCeremonySync(client, {
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
