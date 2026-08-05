import type { Address } from 'abitype'
import { Hex } from 'ox'
import type { Account } from '../../../accounts/types.js'
import { parseAccount } from '../../../accounts/utils/parseAccount.js'
import { getCode } from '../../../actions/public/getCode.js'
import { getLogs } from '../../../actions/public/getLogs.js'
import { readContract } from '../../../actions/public/readContract.js'
import { simulateContract } from '../../../actions/public/simulateContract.js'
import {
  type WriteContractReturnType,
  writeContract,
} from '../../../actions/wallet/writeContract.js'
import { writeContractSync } from '../../../actions/wallet/writeContractSync.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { zeroAddress } from '../../../constants/address.js'
import { maxUint64, maxUint256 } from '../../../constants/number.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { BaseError, type BaseErrorType } from '../../../errors/base.js'
import { TransactionReceiptRevertedError } from '../../../errors/transaction.js'
import type { Chain } from '../../../types/chain.js'
import type { GetEventArgs } from '../../../types/contract.js'
import type { Log } from '../../../types/log.js'
import type { Compute } from '../../../types/utils.js'
import { getAbiItem } from '../../../utils/abi/getAbiItem.js'
import { parseEventLogs } from '../../../utils/abi/parseEventLogs.js'
import { isAddressEqual } from '../../../utils/address/isAddressEqual.js'
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
import type { TransactionReceipt } from '../../Transaction.js'

/** @experimental Factory addresses for one reviewed Tempo Earn release. */
export type EarnFactoryAddresses = {
  /** `ERC4626EngineFactory` address. */
  erc4626Engine: Address
  /** `EarnFactory` address from the same release. */
  earn: Address
}

/** @experimental Deployment-fixed engine migration policy. */
export type EngineMigrationMode = 'operatorEnabled' | 'userOnly'

/** @experimental Initial controls for an Earn vault. */
export type EarnVaultControls = {
  /** Request-cancellation liveness seat. @default zero address */
  asyncJanitor?: Address | undefined
  /** Fast pause-only seat. @default zero address */
  emergencyGuardian?: Address | undefined
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
  distributor: Address
  /** Delay before a distributor fee update can execute, in seconds. */
  updateDelay: number
}

/** @experimental Initial Earn fee configuration. Omit to deploy fee-free. */
export type EarnFeeConfiguration = {
  /** Optional fee on returns above an annual target. */
  excess?:
    | {
        /** Fee recipient. */
        account: Address
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
        account: Address
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
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createErc4626Engine.Parameters<chain, account>,
): Promise<createErc4626Engine.ReturnValue> {
  return createErc4626Engine.inner(writeContract, client, parameters)
}

export namespace createErc4626Engine {
  export type Args = {
    /** Stable deterministic deployment identifier. */
    deploymentId: Hex.Hex
    /** Reviewed `ERC4626EngineFactory` address. */
    factory: Address
    /** Optional engine name override. Empty derives the venue name. */
    name?: string | undefined
    /** Final engine owner. */
    owner: Address
    /** Optional engine symbol override. Empty derives the venue symbol. */
    symbol?: string | undefined
    /** ERC-4626 venue address. */
    venue: Address
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'owner'> & {
      /** Final engine owner. @default `account.address` */
      owner?: Account | Address | undefined
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
    if (!account) throw new AccountNotFoundError()
    if (!owner_) throw new Error('`owner` is required.')
    const owner = parseAccount(owner_).address
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
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({ chain: tempoModerato, transport: http() })
   *   .extend(walletActions)
   * await client.sendTransaction({
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
  export async function predict<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    args: Args,
  ) {
    validateDeploymentId(args.deploymentId)
    return readContract(client, {
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
  export function extractEvent(logs: Log[], parameters: { factory: Address }) {
    const [log] = parseEventLogs({
      abi: Abis.erc4626EngineFactory,
      eventName: 'ERC4626EngineDeployed',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, parameters.factory),
      ),
      strict: true,
    })
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
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createErc4626EngineSync.Parameters<chain, account>,
): Promise<createErc4626EngineSync.ReturnValue> {
  const { factory, throwOnReceiptRevert = true } = parameters
  const receipt = await createErc4626Engine.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = createErc4626Engine.extractEvent(receipt.logs, { factory })
  return { ...args, receipt }
}

export namespace createErc4626EngineSync {
  export type Args = createErc4626Engine.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = createErc4626Engine.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.erc4626EngineFactory,
      'ERC4626EngineDeployed',
      { IndexedOnly: false; Required: true }
    > & { receipt: TransactionReceipt }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Creates an EarnShare, EarnVault, and EarnFees stack around an unbound engine.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createStack.Parameters<chain, account>,
): Promise<createStack.ReturnValue> {
  return createStack.inner(writeContract, client, parameters)
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
    engine: Address
    /** Reviewed `EarnFactory` address. */
    factory: Address
    /** Initial fee configuration. Omit for fee-free deployment. */
    fees?: EarnFeeConfiguration | undefined
    /** Final stack owner and operator. */
    owner: Address
    /** Existing simple whitelist policy. Zero selects always-allow. @default 0 */
    transferPolicyId?: bigint | undefined
  }

  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> &
    Omit<Args, 'owner'> & {
      /** Final stack owner and operator. @default `account.address` */
      owner?: Account | Address | undefined
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
    if (!account) throw new AccountNotFoundError()
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
        owner: parseAccount(owner_).address,
        transferPolicyId,
      }),
    } as never)) as never
  }

  /**
   * Defines a call to `EarnFactory.deploy`.
   *
   * Can be passed as a parameter to:
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({ chain: tempoModerato, transport: http() })
   *   .extend(walletActions)
   * await client.sendTransaction({
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
  export async function predict<chain extends Chain | undefined>(
    client: Client<Transport, chain>,
    args: Args,
  ) {
    validateDeploymentId(args.deploymentId)
    const parameters = toDeployParameters(args)
    const [earnShare, earnFees] = await Promise.all([
      readContract(client, {
        address: args.factory,
        abi: Abis.earnFactory,
        functionName: 'predictEarnShare',
        args: [parameters],
      }),
      readContract(client, {
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
  export function extractEvent(logs: Log[], parameters: { factory: Address }) {
    const [log] = parseEventLogs({
      abi: Abis.earnFactory,
      eventName: 'EarnStackDeployed',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, parameters.factory),
      ),
      strict: true,
    })
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
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: createStackSync.Parameters<chain, account>,
): Promise<createStackSync.ReturnValue> {
  const { factory, throwOnReceiptRevert = true } = parameters
  const receipt = await createStack.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = createStack.extractEvent(receipt.logs, { factory })
  return { ...args, receipt }
}

export namespace createStackSync {
  export type Args = createStack.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = createStack.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = Compute<
    GetEventArgs<
      typeof Abis.earnFactory,
      'EarnStackDeployed',
      { IndexedOnly: false; Required: true }
    > & { receipt: TransactionReceipt }
  >
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

/**
 * Permanently binds an ERC-4626 engine to its EarnVault.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: bindErc4626Engine.Parameters<chain, account>,
): Promise<bindErc4626Engine.ReturnValue> {
  return bindErc4626Engine.inner(writeContract, client, parameters)
}

export namespace bindErc4626Engine {
  export type Args = {
    /** ERC-4626 engine address. */
    engine: Address
    /** Factory-created EarnVault address. */
    vault: Address
  }
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = WriteParameters<chain, account> & Args
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
   * - [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas): estimate the gas cost of the call
   * - [`simulateContract`](https://viem.sh/docs/contract/simulateContract): simulate the call
   * - [`sendCalls`](https://viem.sh/docs/actions/wallet/sendCalls): send multiple calls
   *
   * @example
   * ```ts
   * import { createClient, http, walletActions } from 'viem'
   * import { tempoModerato } from 'viem/chains'
   * import { Actions } from 'viem/tempo'
   *
   * const client = createClient({ chain: tempoModerato, transport: http() })
   *   .extend(walletActions)
   * await client.sendTransaction({
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
  export function extractEvent(logs: Log[], parameters: { engine: Address }) {
    const [log] = parseEventLogs({
      abi: Abis.erc4626Engine,
      eventName: 'EarnVaultInitialized',
      logs: logs.filter((log) =>
        isAddressEqual(log.address, parameters.engine),
      ),
      strict: true,
    })
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
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: bindErc4626EngineSync.Parameters<chain, account>,
): Promise<bindErc4626EngineSync.ReturnValue> {
  const { engine, throwOnReceiptRevert = true } = parameters
  const receipt = await bindErc4626Engine.inner(writeContractSync, client, {
    ...parameters,
    throwOnReceiptRevert,
  } as never)
  const { args } = bindErc4626Engine.extractEvent(receipt.logs, { engine })
  return { engine, vault: args.earnVault, receipt }
}

export namespace bindErc4626EngineSync {
  export type Args = bindErc4626Engine.Args
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = bindErc4626Engine.Parameters<chain, account> &
    WriteSyncParameters<chain, account>
  export type ReturnValue = {
    /** ERC-4626 engine address. */
    engine: Address
    /** Transaction receipt. */
    receipt: TransactionReceipt
    /** Bound EarnVault address. */
    vault: Address
  }
  // TODO: exhaustive error type
  export type ErrorType = BaseErrorType
}

export type DeployErc4626StackErrorType = DeployErc4626StackError & {
  name: 'DeployErc4626StackError'
}

/**
 * Error thrown after a partially completed Earn stack deployment.
 *
 * @experimental
 */
export class DeployErc4626StackError extends BaseError {
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
      name: 'DeployErc4626StackError',
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
 * import { createClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { tempoModerato } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: privateKeyToAccount('0x...'),
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
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: deployErc4626StackSync.Parameters<chain, account>,
): Promise<deployErc4626StackSync.ReturnValue> {
  const deployer = parameters.account ?? client.account
  if (!deployer) throw new AccountNotFoundError()
  const owner_ = parameters.owner ?? deployer
  const owner = parseAccount(owner_).address
  const deployerAddress = parseAccount(deployer).address
  const bindingAccount = (() => {
    if (parameters.bindingAccount) return parameters.bindingAccount
    if (typeof owner_ !== 'string') return owner_
    if (isAddressEqual(owner, deployerAddress)) return deployer
    return undefined
  })()
  if (
    bindingAccount &&
    !isAddressEqual(parseAccount(bindingAccount).address, owner)
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
    !isAddressEqual(parameters.resume.engine, predictedEngine)
  )
    throw new Error('The resumed engine does not match the factory prediction.')

  const engineExists = await hasCode(client, predictedEngine)
  if (!bindingAccount) {
    const boundVault = engineExists
      ? await readContract(client, {
          address: predictedEngine,
          abi: Abis.erc4626Engine,
          functionName: 'earnVault',
        })
      : zeroAddress
    if (isAddressEqual(boundVault, zeroAddress))
      throw new Error(
        '`bindingAccount` is required when the final owner differs from the deployment account.',
      )
  }

  const receipts: deployErc4626StackSync.Receipts = {}
  try {
    if (!engineExists) {
      await simulateContract(client, {
        ...sharedWriteParameters,
        account: deployer,
        ...createErc4626Engine.call(engineArgs),
      } as never)
      const receipt = await createErc4626Engine.inner(
        writeContractSync,
        client,
        {
          ...writeParameters,
          ...engineArgs,
        } as never,
      )
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
      !isAddressEqual(parameters.resume.earnShare, predicted.earnShare)
    )
      throw new Error(
        'The resumed EarnShare does not match the factory prediction.',
      )
    if (
      parameters.resume?.fees &&
      !isAddressEqual(parameters.resume.fees, predicted.earnFees)
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
      await simulateContract(client, {
        ...sharedWriteParameters,
        account: deployer,
        ...createStack.call(stackArgs),
      } as never)
      const receipt = await createStack.inner(writeContractSync, client, {
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
        !isAddressEqual(parameters.resume.vault, args.earnVault)
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
        if (!isAddressEqual(event.args.earnFees, predicted.earnFees))
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
    const boundVault = await readContract(client, {
      address: predictedEngine,
      abi: Abis.erc4626Engine,
      functionName: 'earnVault',
    })
    if (isAddressEqual(boundVault, zeroAddress)) {
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
      await simulateContract(client, {
        ...sharedWriteParameters,
        account: bindingAccount,
        ...bindErc4626Engine.call({ engine: predictedEngine, vault }),
      } as never)
      const receipt = await bindErc4626Engine.inner(
        writeContractSync,
        client,
        bindingParameters as never,
      )
      receipts.binding = receipt
      bindErc4626Engine.extractEvent(receipt.logs, { engine: predictedEngine })
    } else if (!isAddressEqual(boundVault, vault)) {
      throw new Error(`Engine is already bound to ${boundVault}.`)
    }
    const verified = await readContract(client, {
      address: predictedEngine,
      abi: Abis.erc4626Engine,
      functionName: 'earnVault',
    })
    if (!isAddressEqual(verified, vault))
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
  export type Parameters<
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
  > = Omit<
    WriteParameters<chain, account>,
    'gas' | 'keyAuthorization' | 'nonce' | 'throwOnReceiptRevert'
  > &
    WriteSyncParameters<chain, account> & {
      /** Account used only for the final owner binding. */
      bindingAccount?: Account | Address | undefined
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
      owner?: Account | Address | undefined
      /** Previously persisted deployment state. */
      resume?: State | undefined
      /** Optional engine symbol override. */
      symbol?: string | undefined
      /** Existing simple whitelist policy. Zero selects always-allow. */
      transferPolicyId?: bigint | undefined
      /** ERC-4626 venue address. */
      venue: Address
    }

  export type Stage = 'binding' | 'engine' | 'stack'

  export type State = {
    deploymentId: Hex.Hex
    earnShare?: Address | undefined
    engine: Address
    fees?: Address | undefined
    vault?: Address | undefined
  }

  export type Receipts = {
    binding?: TransactionReceipt | undefined
    engine?: TransactionReceipt | undefined
    stack?: TransactionReceipt | undefined
  }

  export type ReturnValue = {
    deploymentId: Hex.Hex
    earnShare: Address
    engine: Address
    fees: Address
    receipts: Receipts
    vault: Address
  }

  export type ErrorType = DeployErc4626StackErrorType | BaseErrorType
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
    if (isAddressEqual(fee.account, zeroAddress))
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
    if (isAddressEqual(excess.account, zeroAddress))
      throw new Error('The excess fee recipient cannot be the zero address.')
  }
  const zeroFee = { account: zeroAddress, rateBps: 0 } as const
  const distributor = args.distributor?.distributor ?? zeroAddress
  const updateDelay = args.distributor?.updateDelay ?? 0
  if (args.distributor) {
    if (isAddressEqual(distributor, zeroAddress))
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
  client: Client<Transport, Chain | undefined>,
  address: Address,
) {
  const code = await getCode(client, { address })
  return code !== undefined && code !== '0x'
}

async function validateContracts(
  client: Client<Transport, Chain | undefined>,
  parameters: { factories: EarnFactoryAddresses; venue: Address },
) {
  const [engineFactory, earnFactory, venue] = await Promise.all([
    hasCode(client, parameters.factories.erc4626Engine),
    hasCode(client, parameters.factories.earn),
    hasCode(client, parameters.venue),
  ])
  if (!engineFactory) throw new Error('ERC4626EngineFactory has no code.')
  if (!earnFactory) throw new Error('EarnFactory has no code.')
  if (!venue) throw new Error('ERC-4626 venue has no code.')
  const tip20Factory = await readContract(client, {
    address: parameters.factories.earn,
    abi: Abis.earnFactory,
    functionName: 'tip20Factory',
  })
  if (!isAddressEqual(tip20Factory, Addresses.tip20Factory))
    throw new Error('EarnFactory uses an unexpected TIP-20 factory.')
}

async function verifyEngine(
  client: Client<Transport, Chain | undefined>,
  args: createErc4626Engine.Args,
  engine: Address,
) {
  const [venue, owner] = await Promise.all([
    readContract(client, {
      address: engine,
      abi: Abis.erc4626Engine,
      functionName: 'vault',
    }),
    readContract(client, {
      address: engine,
      abi: Abis.erc4626Engine,
      functionName: 'owner',
    }),
  ])
  if (!isAddressEqual(venue, args.venue))
    throw new Error('Engine venue verification failed.')
  if (!isAddressEqual(owner, args.owner))
    throw new Error('Engine owner verification failed.')
}

async function verifyStack(
  client: Client<Transport, Chain | undefined>,
  parameters: {
    engine: Address
    fees: Address
    owner: Address
    share: Address
    vault: Address
  },
) {
  const [engine, fees, operator, share] = await Promise.all([
    readContract(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'engine',
    }),
    readContract(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'earnFees',
    }),
    readContract(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'operator',
    }),
    readContract(client, {
      address: parameters.vault,
      abi: Abis.earnVault,
      functionName: 'earnShare',
    }),
  ])
  if (!isAddressEqual(engine, parameters.engine))
    throw new Error('EarnVault engine verification failed.')
  if (!isAddressEqual(fees, parameters.fees))
    throw new Error('EarnVault fees verification failed.')
  if (!isAddressEqual(operator, parameters.owner))
    throw new Error('EarnVault operator verification failed.')
  if (!isAddressEqual(share, parameters.share))
    throw new Error('EarnVault share verification failed.')
}

async function findStackDeployment(
  client: Client<Transport, Chain | undefined>,
  parameters: {
    earnShare: Address
    factory: Address
    fromBlock?: bigint | undefined
  },
) {
  const event = getAbiItem({
    abi: Abis.earnFactory,
    name: 'EarnStackDeployed',
  })
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
  if (error instanceof TransactionReceiptRevertedError)
    receipts[stage] = error.receipt
  return new DeployErc4626StackError(
    error instanceof Error ? error : new Error(String(error)),
    { receipts: { ...receipts }, stage, state: { ...state } },
  )
}
