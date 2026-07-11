import type { Hex } from 'ox'
import type { RpcSchema } from 'ox/erc4337'

import type * as Chain from '../core/Chain.js'
import * as viem_Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type { estimateFeesPerGas } from '../core/actions/fee/estimateFeesPerGas.js'
import type { Prettify } from '../core/internal/types.js'
import { type Decorator, accountAbstractionActions } from './Decorator.js'
import type * as EntryPoint from './EntryPoint.js'
import type * as PaymasterClient from './PaymasterClient.js'
import type * as SmartAccount from './SmartAccount.js'
import type * as UserOperation from './UserOperation.js'

/** A Client configured for an ERC-4337 Bundler. */
export type Client<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  account extends SmartAccount.SmartAccount | undefined =
    | SmartAccount.SmartAccount
    | undefined,
  transport extends Transport.Transport = Transport.Transport,
  executionClient extends viem_Client.Client | undefined =
    | viem_Client.Client
    | undefined,
  extended extends object = Decorator<account>,
> = Prettify<
  Omit<
    viem_Client.Client<
      chain,
      undefined,
      transport,
      undefined,
      RpcSchema.Bundler<EntryPointVersion<account>>
    >,
    'account' | 'dataSuffix' | 'extend'
  > &
    extended & {
      /** Smart Account used by User Operation actions. */
      account: account
      /** Execution RPC Client used for chain reads and fee estimation. */
      client: executionClient
      /** Data appended to encoded Smart Account calls. */
      dataSuffix: Hex.Hex | undefined
      /** Paymaster configuration. */
      paymaster: Paymaster | undefined
      /** Context passed to Paymaster actions. */
      paymasterContext: unknown
      /** User Operation preparation hooks. */
      userOperation: UserOperationConfig<account> | undefined
      /** Extends the Client with another action decorator. */
      extend: <const extension extends object>(
        fn: (
          client: Client<chain, account, transport, executionClient, extended>,
        ) => extension,
      ) => Client<
        chain,
        account,
        transport,
        executionClient,
        Prettify<extended & extension>
      >
    }
>

/** Paymaster configuration accepted by a Bundler {@link Client}. */
export type Paymaster =
  | true
  | PaymasterClient.Client
  | {
      /** Retrieves final Paymaster fields. */
      getData?: PaymasterClient.Decorator['paymaster']['getData'] | undefined
      /** Retrieves Paymaster fields used for gas estimation. */
      getStubData?:
        | PaymasterClient.Decorator['paymaster']['getStubData']
        | undefined
    }

/** User Operation preparation hooks accepted by a Bundler {@link Client}. */
export type UserOperationConfig<
  account extends SmartAccount.SmartAccount | undefined =
    | SmartAccount.SmartAccount
    | undefined,
> = {
  /** Estimates EIP-1559 fee fields for a User Operation. */
  estimateFeesPerGas?:
    | ((options: {
        /** Smart Account sending the User Operation. */
        account: Exclude<account, undefined> | SmartAccount.SmartAccount
        /** Bundler Client preparing the User Operation. */
        bundlerClient: Client
        /** Partially prepared User Operation. */
        userOperation: Partial<UserOperation.UserOperation>
      }) => Promise<estimateFeesPerGas.ReturnType<'eip1559'>>)
    | undefined
}

/**
 * Creates a Bundler {@link Client} decorated with account-abstraction actions.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem/account-abstraction'
 *
 * const client = Client.create({
 *   transport: http('https://bundler.example'),
 * })
 * ```
 *
 * @param options - Bundler Client options.
 * @returns A Bundler Client.
 */
export function create<
  chain extends Chain.Chain | undefined = undefined,
  account extends SmartAccount.SmartAccount | undefined = undefined,
  transport extends Transport.Transport = Transport.Transport,
  executionClient extends viem_Client.Client | undefined = undefined,
>(
  options: create.Options<chain, account, transport, executionClient>,
): create.ReturnType<chain, account, transport, executionClient> {
  const {
    account,
    chain,
    client: executionClient,
    dataSuffix,
    key = 'bundler',
    name = 'Bundler Client',
    paymaster,
    paymasterContext,
    transport,
    userOperation,
    ...rest
  } = options

  const base = viem_Client.create({
    ...rest,
    chain: chain ?? executionClient?.chain,
    key,
    name,
    transport,
    type: 'bundler',
  })
  const client = Object.assign(base, {
    account,
    client: executionClient,
    dataSuffix:
      dataSuffix ??
      (typeof executionClient?.dataSuffix === 'string'
        ? executionClient.dataSuffix
        : executionClient?.dataSuffix?.value),
    paymaster,
    paymasterContext,
  })

  const actionClient = Object.assign({}, client, { userOperation })
  const actions = accountAbstractionActions()(actionClient)
  const decorated = client.extend(() => actions)
  if (userOperation) {
    decorated.userOperation = {
      ...decorated.userOperation,
      ...userOperation,
    }
  }
  // Core extension preserves the assigned Bundler fields at runtime.
  return decorated as unknown as create.ReturnType<
    chain,
    account,
    transport,
    executionClient
  >
}

export declare namespace create {
  /** Options for {@link create}. */
  type Options<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    transport extends Transport.Transport = Transport.Transport,
    executionClient extends viem_Client.Client | undefined =
      | viem_Client.Client
      | undefined,
  > = Pick<
    viem_Client.create.Options<chain, undefined, transport>,
    | 'cacheTime'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'retryCount'
    | 'timeout'
    | 'transport'
  > & {
    /** Smart Account used by User Operation actions. */
    account?: account | undefined
    /** Chain used by the Bundler. @default client.chain */
    chain?: chain | Chain.Chain | undefined
    /** Execution RPC Client used for chain reads and fee estimation. */
    client?: executionClient | viem_Client.Client | undefined
    /** Data appended to encoded Smart Account calls. */
    dataSuffix?: Hex.Hex | undefined
    /** Paymaster configuration. */
    paymaster?: Paymaster | undefined
    /** Context passed to Paymaster actions. */
    paymasterContext?: unknown
    /** User Operation preparation hooks. */
    userOperation?: UserOperationConfig<account> | undefined
  }

  /** Return type of {@link create}. */
  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    account extends SmartAccount.SmartAccount | undefined =
      | SmartAccount.SmartAccount
      | undefined,
    transport extends Transport.Transport = Transport.Transport,
    executionClient extends viem_Client.Client | undefined =
      | viem_Client.Client
      | undefined,
  > = Client<
    ResolvedChain<chain, executionClient>,
    account,
    transport,
    executionClient
  >

  /** Errors thrown by {@link create}. */
  type ErrorType = viem_Client.create.ErrorType
}

type EntryPointVersion<account extends SmartAccount.SmartAccount | undefined> =
  account extends {
    entryPoint: { version: infer version extends EntryPoint.Version }
  }
    ? version
    : EntryPoint.Version

type ResolvedChain<
  chain extends Chain.Chain | undefined,
  executionClient extends viem_Client.Client | undefined,
> = chain extends Chain.Chain
  ? chain
  : executionClient extends viem_Client.Client<infer chain>
    ? chain
    : undefined
