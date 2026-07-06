import type * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'

import type * as Account from '../../core/Account.js'
import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { read } from '../../core/actions/contract/read.js'
import { write } from '../../core/actions/contract/write.js'
import { writeSync } from '../../core/actions/contract/writeSync.js'
import * as Abis from '../Abis.js'
import * as Addresses from '../Addresses.js'
import type { ReadParameters, WriteParameters } from '../internal/types.js'
import { defineCall } from '../internal/utils.js'

/**
 * Adds a new validator (owner only).
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.add(client, {
 *   active: true,
 *   inboundAddress: '192.168.1.1:8080',
 *   newValidatorAddress: '0x…',
 *   outboundAddress: '192.168.1.1:8080',
 *   publicKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function add<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: add.Options,
): Promise<add.ReturnType> {
  return add.inner(write, client, options)
}

export namespace add {
  export type Args = {
    /** Whether the validator should be active. */
    active: boolean
    /** The validator's inbound address `<hostname|ip>:<port>` for incoming connections. */
    inboundAddress: string
    /** The address of the new validator. */
    newValidatorAddress: Address.Address
    /** The validator's outbound IP address `<ip>:<port>` for firewall whitelisting (IP only, no hostnames). */
    outboundAddress: string
    /** The validator's communication public key. */
    publicKey: Hex.Hex
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: add.Options,
  ): Promise<ActionReturnType<action>> {
    const {
      active,
      inboundAddress,
      newValidatorAddress,
      outboundAddress,
      publicKey,
      ...rest
    } = options
    return (await action(client, {
      ...rest,
      ...add.call({
        active,
        inboundAddress,
        newValidatorAddress,
        outboundAddress,
        publicKey,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `addValidator` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const {
      active,
      inboundAddress,
      newValidatorAddress,
      outboundAddress,
      publicKey,
    } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [
        newValidatorAddress,
        publicKey,
        active,
        inboundAddress,
        outboundAddress,
      ],
      functionName: 'addValidator',
    } as never)
  }
}

/**
 * Adds a new validator (owner only), and waits for the transaction to be
 * confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.addSync(client, {
 *   active: true,
 *   inboundAddress: '192.168.1.1:8080',
 *   newValidatorAddress: '0x…',
 *   outboundAddress: '192.168.1.1:8080',
 *   publicKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function addSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: addSync.Options,
): Promise<addSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await add.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace addSync {
  type Args = add.Args

  type Options = add.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Changes the owner of the validator config precompile.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.changeOwner(client, {
 *   newOwner: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function changeOwner<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeOwner.Options,
): Promise<changeOwner.ReturnType> {
  return changeOwner.inner(write, client, options)
}

export namespace changeOwner {
  export type Args = {
    /** The new owner address. */
    newOwner: Address.Address
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: changeOwner.Options,
  ): Promise<ActionReturnType<action>> {
    const { newOwner, ...rest } = options
    return (await action(client, {
      ...rest,
      ...changeOwner.call({ newOwner }),
    } as never)) as never
  }

  /**
   * Defines a call to the `changeOwner` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { newOwner } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [newOwner],
      functionName: 'changeOwner',
    } as never)
  }
}

/**
 * Changes the owner of the validator config precompile, and waits for the
 * transaction to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.changeOwnerSync(client, {
 *   newOwner: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function changeOwnerSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeOwnerSync.Options,
): Promise<changeOwnerSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await changeOwner.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace changeOwnerSync {
  type Args = changeOwner.Args

  type Options = changeOwner.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Changes validator active status (owner only).
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.changeStatus(client, {
 *   active: false,
 *   validator: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function changeStatus<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeStatus.Options,
): Promise<changeStatus.ReturnType> {
  return changeStatus.inner(write, client, options)
}

export namespace changeStatus {
  export type Args = {
    /** Whether the validator should be active. */
    active: boolean
    /** The validator address. */
    validator: Address.Address
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: changeStatus.Options,
  ): Promise<ActionReturnType<action>> {
    const { active, validator, ...rest } = options
    return (await action(client, {
      ...rest,
      ...changeStatus.call({ active, validator }),
    } as never)) as never
  }

  /**
   * Defines a call to the `changeValidatorStatus` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { active, validator } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [validator, active],
      functionName: 'changeValidatorStatus',
    } as never)
  }
}

/**
 * Changes validator active status, and waits for the transaction to be
 * confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.changeStatusSync(client, {
 *   active: false,
 *   validator: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function changeStatusSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: changeStatusSync.Options,
): Promise<changeStatusSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await changeStatus.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace changeStatusSync {
  type Args = changeStatus.Args

  type Options = changeStatus.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Gets validator information by address.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const validator = await Actions.validator.get(client, {
 *   validator: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The validator information.
 */
export async function get<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: get.Options,
): Promise<get.ReturnType> {
  const { validator, ...rest } = options
  return (await read(client, {
    ...rest,
    ...get.call({ validator }),
  } as never)) as get.ReturnType
}

export namespace get {
  export type Args = {
    /** Validator address. */
    validator: Address.Address
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validators'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `validators` function. Can be passed to any action
   * that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { validator } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [validator],
      functionName: 'validators',
    } as never)
  }
}

/**
 * Gets validator address by index.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const validatorAddress = await Actions.validator.getByIndex(client, {
 *   index: 0n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The validator address at the given index.
 */
export async function getByIndex<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getByIndex.Options,
): Promise<getByIndex.ReturnType> {
  const { index, ...rest } = options
  return (await read(client, {
    ...rest,
    ...getByIndex.call({ index }),
  } as never)) as getByIndex.ReturnType
}

export namespace getByIndex {
  export type Args = {
    /** Validator index. */
    index: bigint
  }

  export type Options = ReadParameters & Args

  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validatorsArray'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `validatorsArray` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { index } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [index],
      functionName: 'validatorsArray',
    } as never)
  }
}

/**
 * Gets the total number of validators.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const count = await Actions.validator.getCount(client)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The total number of validators.
 */
export async function getCount<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getCount.Options = {},
): Promise<getCount.ReturnType> {
  return (await read(client, {
    ...options,
    ...getCount.call(),
  } as never)) as getCount.ReturnType
}

export namespace getCount {
  export type Options = ReadParameters

  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'validatorCount'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `validatorCount` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'validatorCount',
    } as never)
  }
}

/**
 * Gets the next epoch for a full DKG ceremony.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const epoch = await Actions.validator.getNextFullDkgCeremony(client)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The epoch number for the next full DKG ceremony.
 */
export async function getNextFullDkgCeremony<
  chain extends Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getNextFullDkgCeremony.Options = {},
): Promise<getNextFullDkgCeremony.ReturnType> {
  return (await read(client, {
    ...options,
    ...getNextFullDkgCeremony.call(),
  } as never)) as getNextFullDkgCeremony.ReturnType
}

export namespace getNextFullDkgCeremony {
  export type Options = ReadParameters

  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'getNextFullDkgCeremony'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getNextFullDkgCeremony` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'getNextFullDkgCeremony',
    } as never)
  }
}

/**
 * Gets the contract owner.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const owner = await Actions.validator.getOwner(client)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The owner address.
 */
export async function getOwner<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getOwner.Options = {},
): Promise<getOwner.ReturnType> {
  return (await read(client, {
    ...options,
    ...getOwner.call(),
  } as never)) as getOwner.ReturnType
}

export namespace getOwner {
  export type Options = ReadParameters

  export type ReturnType = read.ReturnType<typeof Abis.validatorConfig, 'owner'>

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `owner` function. Can be passed to any action that
   * accepts a contract call.
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'owner',
    } as never)
  }
}

/**
 * Gets the complete set of validators.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({ chain: tempo, transport: http() })
 *
 * const validators = await Actions.validator.list(client)
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns Array of all validators with their information.
 */
export async function list<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: list.Options = {},
): Promise<list.ReturnType> {
  return (await read(client, {
    ...options,
    ...list.call(),
  } as never)) as list.ReturnType
}

export namespace list {
  export type Options = ReadParameters

  export type ReturnType = read.ReturnType<
    typeof Abis.validatorConfig,
    'getValidators'
  >

  export type ErrorType = read.ErrorType | Errors.GlobalErrorType

  /**
   * Defines a call to the `getValidators` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @returns The call.
   */
  export function call() {
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [],
      functionName: 'getValidators',
    } as never)
  }
}

/**
 * Sets the next epoch for a full DKG ceremony.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.setNextFullDkgCeremony(client, {
 *   epoch: 100n,
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function setNextFullDkgCeremony<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setNextFullDkgCeremony.Options,
): Promise<setNextFullDkgCeremony.ReturnType> {
  return setNextFullDkgCeremony.inner(write, client, options)
}

export namespace setNextFullDkgCeremony {
  export type Args = {
    /** The epoch number for the next full DKG ceremony. */
    epoch: bigint
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: setNextFullDkgCeremony.Options,
  ): Promise<ActionReturnType<action>> {
    const { epoch, ...rest } = options
    return (await action(client, {
      ...rest,
      ...setNextFullDkgCeremony.call({ epoch }),
    } as never)) as never
  }

  /**
   * Defines a call to the `setNextFullDkgCeremony` function. Can be passed to
   * any action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { epoch } = args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [epoch],
      functionName: 'setNextFullDkgCeremony',
    } as never)
  }
}

/**
 * Sets the next epoch for a full DKG ceremony, and waits for the transaction
 * to be confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.setNextFullDkgCeremonySync(
 *   client,
 *   { epoch: 100n },
 * )
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function setNextFullDkgCeremonySync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: setNextFullDkgCeremonySync.Options,
): Promise<setNextFullDkgCeremonySync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await setNextFullDkgCeremony.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace setNextFullDkgCeremonySync {
  type Args = setNextFullDkgCeremony.Args

  type Options = setNextFullDkgCeremony.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/**
 * Updates validator information (only callable by the validator themselves).
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.validator.update(client, {
 *   inboundAddress: '192.168.1.1:8080',
 *   newValidatorAddress: '0x…',
 *   outboundAddress: '192.168.1.1:8080',
 *   publicKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function update<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: update.Options,
): Promise<update.ReturnType> {
  return update.inner(write, client, options)
}

export namespace update {
  export type Args = {
    /** The validator's inbound address `<hostname|ip>:<port>` for incoming connections. */
    inboundAddress: string
    /** The new address for this validator. */
    newValidatorAddress: Address.Address
    /** The validator's outbound IP address `<ip>:<port>` for firewall whitelisting (IP only, no hostnames). */
    outboundAddress: string
    /** The validator's new communication public key. */
    publicKey: Hex.Hex
  }

  export type Options = WriteParameters & Args

  export type ReturnType = write.ReturnType

  export type ErrorType = write.ErrorType | Errors.GlobalErrorType

  /** @internal */
  export async function inner<action extends typeof write | typeof writeSync>(
    action: action,
    client: Client.Client,
    options: update.Options,
  ): Promise<ActionReturnType<action>> {
    const {
      inboundAddress,
      newValidatorAddress,
      outboundAddress,
      publicKey,
      ...rest
    } = options
    return (await action(client, {
      ...rest,
      ...update.call({
        inboundAddress,
        newValidatorAddress,
        outboundAddress,
        publicKey,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to the `updateValidator` function. Can be passed to any
   * action that accepts a contract call.
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    const { inboundAddress, newValidatorAddress, outboundAddress, publicKey } =
      args
    return defineCall({
      abi: Abis.validatorConfig,
      address: Addresses.validator,
      args: [newValidatorAddress, publicKey, inboundAddress, outboundAddress],
      functionName: 'updateValidator',
    } as never)
  }
}

/**
 * Updates validator information, and waits for the transaction to be
 * confirmed.
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromPrivateKey('0x…'),
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { receipt } = await Actions.validator.updateSync(client, {
 *   inboundAddress: '192.168.1.1:8080',
 *   newValidatorAddress: '0x…',
 *   outboundAddress: '192.168.1.1:8080',
 *   publicKey: '0x…',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction receipt.
 */
export async function updateSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: updateSync.Options,
): Promise<updateSync.ReturnType<chain>> {
  const { throwOnReceiptRevert = true, ...rest } = options
  const receipt = await update.inner(writeSync, client, {
    ...rest,
    throwOnReceiptRevert,
  } as never)
  return { receipt } as never
}

export declare namespace updateSync {
  type Args = update.Args

  type Options = update.Options

  type ReturnType<chain extends Chain.Chain | undefined = undefined> = {
    /** Transaction receipt. */
    receipt: writeSync.ReturnType<chain>
  }

  type ErrorType = writeSync.ErrorType | Errors.GlobalErrorType
}

/** The awaited return type of a contract write action. @internal */
type ActionReturnType<action extends (...args: never[]) => unknown> = Awaited<
  ReturnType<action>
>
