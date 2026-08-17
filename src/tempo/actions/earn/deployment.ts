import { AbiEvent, Address, Hex } from 'ox'
import type { Errors } from 'ox'

import * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { BaseError } from '../../../core/Errors.js'
import { getCode } from '../../../core/actions/address/getCode.js'
import { read } from '../../../core/actions/contract/read.js'
import { simulate } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import { writeSync } from '../../../core/actions/contract/writeSync.js'
import { getLogs } from '../../../core/actions/event/getLogs.js'
import { TransactionReceiptRevertedError } from '../../../core/actions/transaction/sendRawSync.js'
import type { Compute } from '../../../core/internal/types.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type {
  WriteParameters,
  WriteSyncParameters,
} from '../../internal/types.js'
import {
  defineCall,
  pickWriteParameters,
  pickWriteSyncParameters,
} from '../../internal/utils.js'
import type { TransactionReceipt } from '../../chainConfig.js'

const maxUint64 = 2n ** 64n - 1n
const maxUint256 = 2n ** 256n - 1n
const zeroAddress =
  '0x0000000000000000000000000000000000000000' as const satisfies Address.Address

/** @experimental Factory addresses for one reviewed Tempo Earn release. */
export type EarnFactoryAddresses = {
  /** `ERC4626EngineFactory` address. */
  erc4626Engine: Address.Address
  /** `EarnFactory` address from the same release. */
  earn: Address.Address
}

/** @experimental Deployment-fixed engine migration policy. */
export type EngineMigrationMode = 'operatorEnabled' | 'userOnly'

/** @experimental Initial controls for an Earn vault. */
export type EarnVaultControls = {
  /** Request-cancellation liveness seat. @default zero address */
  asyncJanitor?: Address.Address | undefined
  /** Fast pause-only seat. @default zero address */
  emergencyGuardian?: Address.Address | undefined
  /** Maximum actively managed assets. Zero means unlimited. @default 0 */
  maxManagedAssets?: bigint | undefined
  /** Whole-pool migration policy. @default 'userOnly' */
  migrationMode?: EngineMigrationMode | undefined
}

/** @experimental Optional protected fee-distributor configuration. */
export type EarnDistributorConfiguration = {
  /**
   * Distributor address. The first entry in `fees.fixedFees` is its protected
   * fee.
   */
  distributor: Address.Address
  /** Delay before a distributor fee update can execute, in seconds. */
  updateDelay: number
}

/** @experimental Initial Earn fee configuration. Omit to deploy fee-free. */
export type EarnFeeConfiguration = {
  /** Optional fee on returns above an annual target. */
  excess?:
    | {
        /** Fee recipient. */
        account: Address.Address
        /** Annual target rate in basis points. */
        annualTargetRateBps: number
        /** Rate charged above the target in basis points. */
        rateBps: number
      }
    | undefined
  /**
   * Fixed fee recipients and rates, limited to four entries. When a
   * distributor is enabled, the first entry is its protected fee and the
   * remaining entries are operator-controlled.
   */
  fixedFees?:
    | readonly {
        /** Fee recipient. */
        account: Address.Address
        /** Fee rate in basis points. */
        rateBps: number
      }[]
    | undefined
}

/**
 * Deploys a deterministic ERC-4626 Earn engine.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 *
 * const hash = await Actions.earn.createErc4626Engine(client, {
 *   deploymentId: '0x...',
 *   factory: '0x...',
 *   venue: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function createErc4626Engine<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: createErc4626Engine.Parameters,
): Promise<createErc4626Engine.ReturnValue> {
  return createErc4626Engine.inner(write, client, parameters)
}

export namespace createErc4626Engine {
  export type Args = {
    /** Stable deterministic deployment identifier. */
    deploymentId: Hex.Hex
    /** Reviewed `ERC4626EngineFactory` address. */
    factory: Address.Address
    /** Optional engine name override. Empty derives the venue name. */
    name?: string | undefined
    /** Final engine owner. */
    owner: Address.Address
    /** Optional engine symbol override. Empty derives the venue symbol. */
    symbol?: string | undefined
    /** ERC-4626 venue address. */
    venue: Address.Address
  }

  export type Parameters = WriteParameters &
    Omit<Args, 'owner'> & {
      /** Final engine owner. @default `account.address` */
      owner?: Account.Account | Address.Address | undefined
    }

  export type ReturnValue = write.ReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    parameters: Parameters,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      deploymentId,
      factory,
      name,
      owner: owner_ = account,
      symbol,
      venue,
      ...rest
    } = parameters
    if (!account) throw new Account.NotFoundError()
    if (!owner_) throw new Error('`owner` is required.')
    const owner = Account.from(owner_).address
    return (await action(client, {
      ...rest,
      account,
      chain,
      ...createErc4626Engine.call({
        deploymentId,
        factory,
        name,
        owner,
        symbol,
        venue,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to `ERC4626EngineFactory.deploy`.
   *
   * Can be passed as a parameter to:
   * - [`Actions.contract.estimateGas`](https://viem.sh/docs/actions/public/contract/estimateGas): estimate the gas cost of the call
   * - [`Actions.contract.simulate`](https://viem.sh/docs/actions/public/contract/simulate): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { Client, http } from 'viem/tempo'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = Client.create({ chain: tempoModerato, transport: http() })
   * await client.transaction.send({
   *   calls: [Actions.earn.createErc4626Engine.call({
   *     deploymentId: '0x...',
   *     factory: '0x...',
   *     owner: '0x...',
   *     venue: '0x...',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    validateDeploymentId(args.deploymentId)
    return defineCall({
      address: args.factory,
      abi: Abis.erc4626EngineFactory,
      functionName: 'deploy',
      args: [
        args.deploymentId,
        args.venue,
        args.owner,
        args.name ?? '',
        args.symbol ?? '',
      ],
    })
  }

  /**
   * Predicts the deterministic engine address.
   *
   * @param client - Client.
   * @param args - Engine deployment arguments.
   * @returns The predicted engine address.
   */
  export async function predict<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
    args: Args,
  ) {
    validateDeploymentId(args.deploymentId)
    return read(client, {
      address: args.factory,
      abi: Abis.erc4626EngineFactory,
      functionName: 'predictEngine',
      args: [
        args.deploymentId,
        args.venue,
        args.owner,
        args.name ?? '',
        args.symbol ?? '',
      ],
    })
  }

  /**
   * Extracts the `ERC4626EngineDeployed` event from factory logs.
   *
   * @param logs - The logs.
   * @param parameters - Factory address used to filter the logs.
   * @returns The deployment event.
   */
  export function extractEvent<
    const logs extends readonly (AbiEvent.extractLogs.Log & {
      address: Address.Address
    })[],
  >(logs: logs, parameters: { factory: Address.Address }) {
    const [log] = AbiEvent.extractLogs(
      Abis.erc4626EngineFactory,
      logs.filter((log): log is logs[number] =>
        Address.isEqual(log.address, parameters.factory),
      ),
      {
        eventName: 'ERC4626EngineDeployed',
        strict: true,
      },
    )
    if (!log) throw new Error('`ERC4626EngineDeployed` event not found.')
    return log
  }
}

/**
 * Deploys an ERC-4626 engine and waits for confirmation.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const result = await Actions.earn.createErc4626EngineSync(client, {
 *   deploymentId: '0x...',
 *   factory: '0x...',
 *   venue: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The receipt and deployed engine metadata.
 */
export async function createErc4626EngineSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: createErc4626EngineSync.Parameters,
): Promise<createErc4626EngineSync.ReturnValue> {
  const { factory, throwOnReceiptRevert = true } = parameters
  const receipt = await createErc4626Engine.inner(writeSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = createErc4626Engine.extractEvent(receipt.logs, { factory })
  return { ...args, receipt }
}

export namespace createErc4626EngineSync {
  export type Args = createErc4626Engine.Args
  export type Parameters = createErc4626Engine.Parameters & WriteSyncParameters
  export type ReturnValue = Compute<
    ReturnType<typeof createErc4626Engine.extractEvent>['args'] & {
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Creates an EarnShare, EarnVault, and EarnFees stack around an unbound engine.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const hash = await Actions.earn.createStack(client, {
 *   deploymentId: '0x...',
 *   engine: '0x...',
 *   factory: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function createStack<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: createStack.Parameters,
): Promise<createStack.ReturnValue> {
  return createStack.inner(write, client, parameters)
}

export namespace createStack {
  export type Args = {
    /** Initial Earn vault controls. */
    controls?: EarnVaultControls | undefined
    /** Stable deterministic deployment identifier. */
    deploymentId: Hex.Hex
    /** Optional protected fee distributor. */
    distributor?: EarnDistributorConfiguration | undefined
    /** Engine address. */
    engine: Address.Address
    /** Reviewed `EarnFactory` address. */
    factory: Address.Address
    /** Initial fee configuration. Omit for fee-free deployment. */
    fees?: EarnFeeConfiguration | undefined
    /** Final stack owner and operator. */
    owner: Address.Address
    /** Existing simple whitelist policy. Zero selects always-allow. @default 0 */
    transferPolicyId?: bigint | undefined
  }

  export type Parameters = WriteParameters &
    Omit<Args, 'owner'> & {
      /** Final stack owner and operator. @default `account.address` */
      owner?: Account.Account | Address.Address | undefined
    }

  export type ReturnValue = write.ReturnType

  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    parameters: Parameters,
  ): Promise<ReturnType<action>> {
    const {
      account = client.account,
      chain = client.chain,
      controls,
      deploymentId,
      distributor,
      engine,
      factory,
      fees,
      owner: owner_ = account,
      transferPolicyId,
      ...rest
    } = parameters
    if (!account) throw new Account.NotFoundError()
    if (!owner_) throw new Error('`owner` is required.')
    return (await action(client, {
      ...rest,
      account,
      chain,
      ...createStack.call({
        controls,
        deploymentId,
        distributor,
        engine,
        factory,
        fees,
        owner: Account.from(owner_).address,
        transferPolicyId,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to `EarnFactory.deploy`.
   *
   * Can be passed as a parameter to:
   * - [`Actions.contract.estimateGas`](https://viem.sh/docs/actions/public/contract/estimateGas): estimate the gas cost of the call
   * - [`Actions.contract.simulate`](https://viem.sh/docs/actions/public/contract/simulate): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { Client, http } from 'viem/tempo'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = Client.create({ chain: tempoModerato, transport: http() })
   * await client.transaction.send({
   *   calls: [Actions.earn.createStack.call({
   *     deploymentId: '0x...',
   *     engine: '0x...',
   *     factory: '0x...',
   *     owner: '0x...',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    validateDeploymentId(args.deploymentId)
    return defineCall({
      address: args.factory,
      abi: Abis.earnFactory,
      functionName: 'deploy',
      args: [toDeployParameters(args)],
    })
  }

  /**
   * Predicts the deterministic EarnShare and EarnFees addresses.
   *
   * @param client - Client.
   * @param args - Stack deployment arguments.
   * @returns The predicted EarnShare and EarnFees addresses.
   */
  export async function predict<chain extends Chain.Chain | undefined>(
    client: Client.Client<chain>,
    args: Args,
  ) {
    validateDeploymentId(args.deploymentId)
    const parameters = toDeployParameters(args)
    const [earnShare, earnFees] = await Promise.all([
      read(client, {
        address: args.factory,
        abi: Abis.earnFactory,
        functionName: 'predictEarnShare',
        args: [parameters],
      }),
      read(client, {
        address: args.factory,
        abi: Abis.earnFactory,
        functionName: 'predictEarnFees',
        args: [parameters],
      }),
    ])
    return { earnFees, earnShare }
  }

  /**
   * Extracts the `EarnStackDeployed` event from factory logs.
   *
   * @param logs - The logs.
   * @param parameters - Factory address used to filter the logs.
   * @returns The deployment event.
   */
  export function extractEvent<
    const logs extends readonly (AbiEvent.extractLogs.Log & {
      address: Address.Address
    })[],
  >(logs: logs, parameters: { factory: Address.Address }) {
    const [log] = AbiEvent.extractLogs(
      Abis.earnFactory,
      logs.filter((log): log is logs[number] =>
        Address.isEqual(log.address, parameters.factory),
      ),
      {
        eventName: 'EarnStackDeployed',
        strict: true,
      },
    )
    if (!log) throw new Error('`EarnStackDeployed` event not found.')
    return log
  }
}

/**
 * Creates an Earn core stack and waits for confirmation.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const result = await Actions.earn.createStackSync(client, {
 *   deploymentId: '0x...',
 *   engine: '0x...',
 *   factory: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The receipt and deployed stack addresses.
 */
export async function createStackSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: createStackSync.Parameters,
): Promise<createStackSync.ReturnValue> {
  const { factory, throwOnReceiptRevert = true } = parameters
  const receipt = await createStack.inner(writeSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = createStack.extractEvent(receipt.logs, { factory })
  return { ...args, receipt }
}

export namespace createStackSync {
  export type Args = createStack.Args
  export type Parameters = createStack.Parameters & WriteSyncParameters
  export type ReturnValue = Compute<
    ReturnType<typeof createStack.extractEvent>['args'] & {
      receipt: TransactionReceipt
    }
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

/**
 * Permanently binds an ERC-4626 engine to its EarnVault.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const hash = await Actions.earn.bindErc4626Engine(client, {
 *   engine: '0x...',
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client controlled by the final engine owner.
 * @param parameters - Parameters.
 * @returns The transaction hash.
 */
export async function bindErc4626Engine<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: bindErc4626Engine.Parameters,
): Promise<bindErc4626Engine.ReturnValue> {
  return bindErc4626Engine.inner(write, client, parameters)
}

export namespace bindErc4626Engine {
  export type Args = {
    /** ERC-4626 engine address. */
    engine: Address.Address
    /** Factory-created EarnVault address. */
    vault: Address.Address
  }
  export type Parameters = WriteParameters & Args
  export type ReturnValue = write.ReturnType
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType

  /** @internal */
  export async function inner<
    action extends typeof write | typeof writeSync,
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    action: action,
    client: Client.Client<chain, account>,
    parameters: Parameters,
  ): Promise<ReturnType<action>> {
    const { engine, vault, ...rest } = parameters
    return (await action(client, {
      ...rest,
      ...bindErc4626Engine.call({ engine, vault }),
    } as never)) as never
  }

  /**
   * Defines a call to `ERC4626Engine.initializeEarnVault`.
   *
   * Can be passed as a parameter to:
   * - [`Actions.contract.estimateGas`](https://viem.sh/docs/actions/public/contract/estimateGas): estimate the gas cost of the call
   * - [`Actions.contract.simulate`](https://viem.sh/docs/actions/public/contract/simulate): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { Client, http } from 'viem/tempo'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = Client.create({ chain: tempoModerato, transport: http() })
   * await client.transaction.send({
   *   calls: [Actions.earn.bindErc4626Engine.call({
   *     engine: '0x...',
   *     vault: '0x...',
   *   })],
   * })
   * ```
   *
   * @param args - Arguments.
   * @returns The call.
   */
  export function call(args: Args) {
    return defineCall({
      address: args.engine,
      abi: Abis.erc4626Engine,
      functionName: 'initializeEarnVault',
      args: [args.vault],
    })
  }

  /**
   * Extracts the `EarnVaultInitialized` event from engine logs.
   *
   * @param logs - The logs.
   * @param parameters - Engine address used to filter the logs.
   * @returns The initialization event.
   */
  export function extractEvent<
    const logs extends readonly (AbiEvent.extractLogs.Log & {
      address: Address.Address
    })[],
  >(logs: logs, parameters: { engine: Address.Address }) {
    const [log] = AbiEvent.extractLogs(
      Abis.erc4626Engine,
      logs.filter((log): log is logs[number] =>
        Address.isEqual(log.address, parameters.engine),
      ),
      {
        eventName: 'EarnVaultInitialized',
        strict: true,
      },
    )
    if (!log) throw new Error('`EarnVaultInitialized` event not found.')
    return log
  }
}

/**
 * Binds an ERC-4626 engine and waits for confirmation.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const result = await Actions.earn.bindErc4626EngineSync(client, {
 *   engine: '0x...',
 *   vault: '0x...',
 * })
 * ```
 *
 * @param client - Client controlled by the final engine owner.
 * @param parameters - Parameters.
 * @returns The receipt and bound addresses.
 */
export async function bindErc4626EngineSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: bindErc4626EngineSync.Parameters,
): Promise<bindErc4626EngineSync.ReturnValue> {
  const { engine, throwOnReceiptRevert = true } = parameters
  const receipt = await bindErc4626Engine.inner(writeSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = bindErc4626Engine.extractEvent(receipt.logs, { engine })
  return { engine, vault: args.earnVault, receipt }
}

export namespace bindErc4626EngineSync {
  export type Args = bindErc4626Engine.Args
  export type Parameters = bindErc4626Engine.Parameters & WriteSyncParameters
  export type ReturnValue = {
    /** ERC-4626 engine address. */
    engine: Address.Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Bound EarnVault address. */
    vault: Address.Address
  }
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}

export type DeployErc4626StackErrorType = DeployErc4626StackError & {
  name: 'DeployErc4626StackError'
}

/**
 * Error thrown after a partially completed Earn stack deployment.
 *
 * @experimental
 */
export class DeployErc4626StackError extends BaseError<Error> {
  override name = 'DeployErc4626StackError'
  receipts: deployErc4626StackSync.Receipts
  stage: deployErc4626StackSync.Stage
  state: deployErc4626StackSync.State

  constructor(
    cause: Error,
    parameters: {
      receipts: deployErc4626StackSync.Receipts
      stage: deployErc4626StackSync.Stage
      state: deployErc4626StackSync.State
    },
  ) {
    super(`ERC-4626 Earn deployment failed during ${parameters.stage}.`, {
      cause,
    })
    this.receipts = parameters.receipts
    this.stage = parameters.stage
    this.state = parameters.state
  }
}

/**
 * Deploys and binds a complete ERC-4626 Earn stack through sequential,
 * resumable transactions.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Account, Client, http } from 'viem/tempo'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x...'),
 *   chain: tempoModerato,
 *   transport: http(),
 * })
 * const result = await Actions.earn.deployErc4626StackSync(client, {
 *   deploymentId: '0x...',
 *   factories: { earn: '0x...', erc4626Engine: '0x...' },
 *   venue: '0x...',
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - Parameters.
 * @returns The deployed addresses and receipts created by this run.
 */
export async function deployErc4626StackSync<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  parameters: deployErc4626StackSync.Parameters,
): Promise<deployErc4626StackSync.ReturnValue> {
  const deployer = parameters.account ?? client.account
  if (!deployer) throw new Account.NotFoundError()
  const owner_ = parameters.owner ?? deployer
  const owner = Account.from(owner_).address
  const deployerAddress = Account.from(deployer).address
  const bindingAccount = (() => {
    if (parameters.bindingAccount) return parameters.bindingAccount
    if (typeof owner_ !== 'string') return owner_
    if (Address.isEqual(owner, deployerAddress)) return deployer
    return undefined
  })()
  if (
    bindingAccount &&
    !Address.isEqual(Account.from(bindingAccount).address, owner)
  )
    throw new Error('`bindingAccount` must match `owner`.')

  validateDeploymentId(parameters.deploymentId)
  if (
    parameters.resume &&
    parameters.resume.deploymentId.toLowerCase() !==
      parameters.deploymentId.toLowerCase()
  )
    throw new Error('The resumed deployment ID does not match `deploymentId`.')
  await validateContracts(client, {
    factories: parameters.factories,
    venue: parameters.venue,
  })

  const {
    gas: _,
    keyAuthorization: __,
    nonce: ___,
    ...sharedWriteParameters
  } = pickWriteParameters(parameters as never)
  const writeParameters = {
    ...sharedWriteParameters,
    ...pickWriteSyncParameters(parameters as never),
    account: deployer,
    throwOnReceiptRevert: true,
  }
  const engineArgs = {
    deploymentId: parameters.deploymentId,
    factory: parameters.factories.erc4626Engine,
    name: parameters.name,
    owner,
    symbol: parameters.symbol,
    venue: parameters.venue,
  } satisfies createErc4626Engine.Args
  const predictedEngine = await createErc4626Engine.predict(client, engineArgs)
  const state: deployErc4626StackSync.State = {
    deploymentId: parameters.deploymentId,
    earnShare: parameters.resume?.earnShare,
    engine: predictedEngine,
    fees: parameters.resume?.fees,
    vault: parameters.resume?.vault,
  }
  if (
    parameters.resume?.engine &&
    !Address.isEqual(parameters.resume.engine, predictedEngine)
  )
    throw new Error('The resumed engine does not match the factory prediction.')

  const engineExists = await hasCode(client, predictedEngine)
  if (!bindingAccount) {
    const boundVault = engineExists
      ? await read(client, {
          address: predictedEngine,
          abi: Abis.erc4626Engine,
          functionName: 'earnVault',
        })
      : zeroAddress
    if (Address.isEqual(boundVault, zeroAddress))
      throw new Error(
        '`bindingAccount` is required when the final owner differs from the deployment account.',
      )
  }

  const receipts: deployErc4626StackSync.Receipts = {}
  try {
    if (!engineExists) {
      await simulate(client, {
        ...sharedWriteParameters,
        account: deployer,
        ...createErc4626Engine.call(engineArgs),
      } as never)
      const receipt = await createErc4626Engine.inner(writeSync, client, {
        ...writeParameters,
        ...engineArgs,
      } as never)
      receipts.engine = receipt
      createErc4626Engine.extractEvent(receipt.logs, {
        factory: parameters.factories.erc4626Engine,
      })
    }
    await verifyEngine(client, engineArgs, predictedEngine)
  } catch (error) {
    throw deploymentError(error, 'engine', state, receipts)
  }

  const stackArgs = {
    controls: parameters.controls,
    deploymentId: parameters.deploymentId,
    distributor: parameters.distributor,
    engine: predictedEngine,
    factory: parameters.factories.earn,
    fees: parameters.fees,
    owner,
    transferPolicyId: parameters.transferPolicyId,
  } satisfies createStack.Args

  try {
    const predicted = await createStack.predict(client, stackArgs)
    if (
      parameters.resume?.earnShare &&
      !Address.isEqual(parameters.resume.earnShare, predicted.earnShare)
    )
      throw new Error(
        'The resumed EarnShare does not match the factory prediction.',
      )
    if (
      parameters.resume?.fees &&
      !Address.isEqual(parameters.resume.fees, predicted.earnFees)
    )
      throw new Error(
        'The resumed EarnFees does not match the factory prediction.',
      )
    state.earnShare = predicted.earnShare
    state.fees = predicted.earnFees

    if (!(await hasCode(client, predicted.earnShare))) {
      if (await hasCode(client, predicted.earnFees))
        throw new Error(
          'Predicted EarnFees exists without the predicted EarnShare.',
        )
      await simulate(client, {
        ...sharedWriteParameters,
        account: deployer,
        ...createStack.call(stackArgs),
      } as never)
      const receipt = await createStack.inner(writeSync, client, {
        ...writeParameters,
        ...stackArgs,
      } as never)
      receipts.stack = receipt
      const { args } = createStack.extractEvent(receipt.logs, {
        factory: parameters.factories.earn,
      })
      state.vault = args.earnVault
      if (
        parameters.resume?.vault &&
        !Address.isEqual(parameters.resume.vault, args.earnVault)
      )
        throw new Error(
          'The resumed EarnVault does not match the factory deployment.',
        )
    } else {
      if (!(await hasCode(client, predicted.earnFees)))
        throw new Error(
          'Predicted EarnShare exists without the predicted EarnFees.',
        )
      state.vault = parameters.resume?.vault
      if (!state.vault) {
        const event = await findStackDeployment(client, {
          earnShare: predicted.earnShare,
          factory: parameters.factories.earn,
          fromBlock: parameters.fromBlock,
        })
        state.vault = event.args.earnVault
        if (!Address.isEqual(event.args.earnFees, predicted.earnFees))
          throw new Error(
            'Recovered EarnFees does not match the factory prediction.',
          )
      }
    }
    if (!state.vault) throw new Error('EarnVault address was not recovered.')
    await verifyStack(client, {
      engine: predictedEngine,
      fees: predicted.earnFees,
      owner,
      share: predicted.earnShare,
      vault: state.vault,
    })
  } catch (error) {
    throw deploymentError(error, 'stack', state, receipts)
  }

  try {
    const vault = state.vault!
    const boundVault = await read(client, {
      address: predictedEngine,
      abi: Abis.erc4626Engine,
      functionName: 'earnVault',
    })
    if (Address.isEqual(boundVault, zeroAddress)) {
      if (!bindingAccount)
        throw new Error(
          '`bindingAccount` is required when the final owner differs from the deployment account.',
        )
      const bindingParameters = {
        ...writeParameters,
        account: bindingAccount,
        engine: predictedEngine,
        vault,
      }
      await simulate(client, {
        ...sharedWriteParameters,
        account: bindingAccount,
        ...bindErc4626Engine.call({ engine: predictedEngine, vault }),
      } as never)
      const receipt = await bindErc4626Engine.inner(
        writeSync,
        client,
        bindingParameters as never,
      )
      receipts.binding = receipt
      bindErc4626Engine.extractEvent(receipt.logs, { engine: predictedEngine })
    } else if (!Address.isEqual(boundVault, vault)) {
      throw new Error(`Engine is already bound to ${boundVault}.`)
    }
    const verified = await read(client, {
      address: predictedEngine,
      abi: Abis.erc4626Engine,
      functionName: 'earnVault',
    })
    if (!Address.isEqual(verified, vault))
      throw new Error('Engine binding verification failed.')
  } catch (error) {
    throw deploymentError(error, 'binding', state, receipts)
  }

  return {
    deploymentId: parameters.deploymentId,
    earnShare: state.earnShare!,
    engine: predictedEngine,
    fees: state.fees!,
    receipts,
    vault: state.vault!,
  }
}

export namespace deployErc4626StackSync {
  export type Parameters = Omit<
    WriteParameters,
    'gas' | 'keyAuthorization' | 'nonce' | 'throwOnReceiptRevert'
  > &
    WriteSyncParameters & {
      /** Account used only for the final owner binding. */
      bindingAccount?: Account.Account | Address.Address | undefined
      /** Initial Earn vault controls. */
      controls?: EarnVaultControls | undefined
      /** Stable deterministic deployment identifier. */
      deploymentId: Hex.Hex
      /** Optional protected fee distributor. */
      distributor?: EarnDistributorConfiguration | undefined
      /** Reviewed factory pair from one Earn release. */
      factories: EarnFactoryAddresses
      /** Initial fee configuration. Omit for fee-free deployment. */
      fees?: EarnFeeConfiguration | undefined
      /** First block to search for a prior factory deployment event. */
      fromBlock?: bigint | undefined
      /** Optional engine name override. */
      name?: string | undefined
      /** Final stack owner and operator. @default `account.address` */
      owner?: Account.Account | Address.Address | undefined
      /** Previously persisted deployment state. */
      resume?: State | undefined
      /** Optional engine symbol override. */
      symbol?: string | undefined
      /** Existing simple whitelist policy. Zero selects always-allow. */
      transferPolicyId?: bigint | undefined
      /** ERC-4626 venue address. */
      venue: Address.Address
    }

  export type Stage = 'binding' | 'engine' | 'stack'

  export type State = {
    deploymentId: Hex.Hex
    earnShare?: Address.Address | undefined
    engine: Address.Address
    fees?: Address.Address | undefined
    vault?: Address.Address | undefined
  }

  export type Receipts = {
    binding?: TransactionReceipt | undefined
    engine?: TransactionReceipt | undefined
    stack?: TransactionReceipt | undefined
  }

  export type ReturnValue = {
    deploymentId: Hex.Hex
    earnShare: Address.Address
    engine: Address.Address
    fees: Address.Address
    receipts: Receipts
    vault: Address.Address
  }

  export type ErrorType = DeployErc4626StackErrorType | Errors.GlobalErrorType
}

function validateDeploymentId(deploymentId: Hex.Hex) {
  if (Hex.size(deploymentId) !== 32 || BigInt(deploymentId) === 0n)
    throw new Error('`deploymentId` must be a nonzero 32-byte hex value.')
}

function toDeployParameters(args: createStack.Args) {
  const fixedFees = args.fees?.fixedFees ?? []
  if (fixedFees.length > 4)
    throw new Error('Earn supports at most four fixed fee recipients.')
  const seen = new Set<string>()
  let totalRateBps = 0
  for (const fee of fixedFees) {
    validateFeeRate(fee.rateBps, '`fixedFees[].rateBps`', false)
    if (Address.isEqual(fee.account, zeroAddress))
      throw new Error('Fixed fee recipients cannot be the zero address.')
    const account = fee.account.toLowerCase()
    if (seen.has(account))
      throw new Error('Fixed fee recipients must be unique.')
    seen.add(account)
    totalRateBps += fee.rateBps
  }
  if (totalRateBps > 10_000)
    throw new Error('The total fixed fee rate cannot exceed 10,000 bps.')

  const excess = args.fees?.excess
  if (excess) {
    validateFeeRate(excess.annualTargetRateBps, '`annualTargetRateBps`', true)
    validateFeeRate(excess.rateBps, '`excess.rateBps`', false)
    if (Address.isEqual(excess.account, zeroAddress))
      throw new Error('The excess fee recipient cannot be the zero address.')
  }
  const zeroFee = { account: zeroAddress, rateBps: 0 } as const
  const distributor = args.distributor?.distributor ?? zeroAddress
  const updateDelay = args.distributor?.updateDelay ?? 0
  if (args.distributor) {
    if (Address.isEqual(distributor, zeroAddress))
      throw new Error('An enabled distributor cannot be the zero address.')
    if (updateDelay <= 0)
      throw new Error(
        'An enabled distributor requires a positive update delay.',
      )
    if (fixedFees.length === 0)
      throw new Error('An enabled distributor requires at least one fixed fee.')
  }
  if (!Number.isSafeInteger(updateDelay) || updateDelay > 0xffffffffff)
    throw new Error('`updateDelay` must fit into uint40 seconds.')
  const transferPolicyId = args.transferPolicyId ?? 0n
  if (transferPolicyId < 0n || transferPolicyId > maxUint64)
    throw new Error('`transferPolicyId` must fit into uint64.')
  const maxManagedAssets = args.controls?.maxManagedAssets ?? 0n
  if (maxManagedAssets < 0n || maxManagedAssets > maxUint256)
    throw new Error('`maxManagedAssets` must fit into uint256.')

  return {
    controls: {
      asyncJanitor: args.controls?.asyncJanitor ?? zeroAddress,
      emergencyGuardian: args.controls?.emergencyGuardian ?? zeroAddress,
      maxManagedAssets,
      migrationMode:
        (args.controls?.migrationMode ?? 'userOnly') === 'userOnly' ? 0 : 1,
    },
    deploymentId: args.deploymentId,
    distributorConfig: { distributor, updateDelay },
    engine: args.engine,
    fees: {
      excess: excess
        ? {
            account: excess.account,
            annualTargetRateBps: excess.annualTargetRateBps,
            enabled: true,
            excessFeeRateBps: excess.rateBps,
          }
        : {
            account: zeroAddress,
            annualTargetRateBps: 0,
            enabled: false,
            excessFeeRateBps: 0,
          },
      fixedFeeCount: fixedFees.length,
      fixedFees: [
        fixedFees[0] ?? zeroFee,
        fixedFees[1] ?? zeroFee,
        fixedFees[2] ?? zeroFee,
        fixedFees[3] ?? zeroFee,
      ],
    },
    owner: args.owner,
    transferPolicyId,
  } as const
}

function validateFeeRate(rate: number, name: string, allowZero: boolean) {
  if (!Number.isInteger(rate) || rate < (allowZero ? 0 : 1) || rate > 10_000)
    throw new Error(
      `${name} must be an integer between ${allowZero ? 0 : 1} and 10,000.`,
    )
}

async function hasCode(
  client: Client.Client<Chain.Chain | undefined>,
  address: Address.Address,
) {
  const code = await getCode(client, { address })
  return code !== undefined && code !== '0x'
}

async function validateContracts(
  client: Client.Client<Chain.Chain | undefined>,
  parameters: { factories: EarnFactoryAddresses; venue: Address.Address },
) {
  const [engineFactory, earnFactory, venue] = await Promise.all([
    hasCode(client, parameters.factories.erc4626Engine),
    hasCode(client, parameters.factories.earn),
    hasCode(client, parameters.venue),
  ])
  if (!engineFactory) throw new Error('ERC4626EngineFactory has no code.')
  if (!earnFactory) throw new Error('EarnFactory has no code.')
  if (!venue) throw new Error('ERC-4626 venue has no code.')
  const tip20Factory = await read(client, {
    address: parameters.factories.earn,
    abi: Abis.earnFactory,
    functionName: 'tip20Factory',
  })
  if (!Address.isEqual(tip20Factory, Addresses.tip20Factory))
    throw new Error('EarnFactory uses an unexpected TIP-20 factory.')
}

async function verifyEngine(
  client: Client.Client<Chain.Chain | undefined>,
  args: createErc4626Engine.Args,
  engine: Address.Address,
) {
  const [venue, owner] = await Promise.all([
    read(client, {
      address: engine,
      abi: Abis.erc4626Engine,
      functionName: 'vault',
    }),
    read(client, {
      address: engine,
      abi: Abis.erc4626Engine,
      functionName: 'owner',
    }),
  ])
  if (!Address.isEqual(venue, args.venue))
    throw new Error('Engine venue verification failed.')
  if (!Address.isEqual(owner, args.owner))
    throw new Error('Engine owner verification failed.')
}

async function verifyStack(
  client: Client.Client<Chain.Chain | undefined>,
  parameters: {
    engine: Address.Address
    fees: Address.Address
    owner: Address.Address
    share: Address.Address
    vault: Address.Address
  },
) {
  const [engine, fees, operator, share] = await Promise.all([
    read(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'engine',
    }),
    read(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'earnFees',
    }),
    read(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'operator',
    }),
    read(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'earnShare',
    }),
  ])
  if (!Address.isEqual(engine, parameters.engine))
    throw new Error('EarnVault engine verification failed.')
  if (!Address.isEqual(fees, parameters.fees))
    throw new Error('EarnVault fees verification failed.')
  if (!Address.isEqual(operator, parameters.owner))
    throw new Error('EarnVault operator verification failed.')
  if (!Address.isEqual(share, parameters.share))
    throw new Error('EarnVault share verification failed.')
}

async function findStackDeployment(
  client: Client.Client<Chain.Chain | undefined>,
  parameters: {
    earnShare: Address.Address
    factory: Address.Address
    fromBlock?: bigint | undefined
  },
) {
  const event = AbiEvent.fromAbi(Abis.earnFactory, 'EarnStackDeployed')
  const logs = await getLogs(client, {
    address: parameters.factory,
    args: { earnShare: parameters.earnShare },
    event,
    fromBlock: parameters.fromBlock ?? 0n,
    strict: true,
    toBlock: 'latest',
  })
  const log = logs.at(-1)
  if (!log) throw new Error('Prior `EarnStackDeployed` event not found.')
  return log
}

function deploymentError(
  error: unknown,
  stage: deployErc4626StackSync.Stage,
  state: deployErc4626StackSync.State,
  receipts: deployErc4626StackSync.Receipts,
) {
  if (error instanceof DeployErc4626StackError) return error
  const receiptError =
    error instanceof TransactionReceiptRevertedError
      ? error
      : error instanceof BaseError
        ? error.walk(
            (cause) => cause instanceof TransactionReceiptRevertedError,
          )
        : undefined
  if (receiptError instanceof TransactionReceiptRevertedError)
    receipts[stage] = receiptError.receipt as TransactionReceipt
  return new DeployErc4626StackError(
    error instanceof Error ? error : new Error(String(error)),
    { receipts: { ...receipts }, stage, state: { ...state } },
  )
}
