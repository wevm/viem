import type { RpcSchema as ox_RpcSchema } from 'ox'

import * as viem_Client from '../core/Client.js'
import type * as Transport from '../core/Transport.js'
import type * as EntryPoint from './EntryPoint.js'
import * as paymaster from './actions/paymaster/index.js'
import type * as internal from './actions/paymaster/internal.js'

/** A Client configured for an ERC-7677 Paymaster service. */
export type Client<
  transport extends Transport.Transport = Transport.Transport,
  schema extends ox_RpcSchema.Generic = never,
> = viem_Client.Client<
  undefined,
  undefined,
  transport,
  undefined,
  internal.RpcSchema | schema,
  Decorator
>

/** ERC-7677 Paymaster actions bound to a {@link Client}. */
export type Decorator = {
  /** Paymaster actions. */
  paymaster: {
    /** Returns final Paymaster fields for sending a User Operation. */
    getData: <
      entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
    >(
      options: paymaster.getData.Options<entryPointVersion>,
    ) => Promise<paymaster.getData.ReturnType<entryPointVersion>>
    /** Returns Paymaster fields for User Operation gas estimation. */
    getStubData: <
      entryPointVersion extends EntryPoint.Version = EntryPoint.Version,
    >(
      options: paymaster.getStubData.Options<entryPointVersion>,
    ) => Promise<paymaster.getStubData.ReturnType<entryPointVersion>>
  }
}

/**
 * Creates an ERC-7677 Paymaster {@link Client}.
 *
 * @example
 * ```ts
 * import { PaymasterClient, http } from 'viem/erc4337'
 *
 * const client = PaymasterClient.create({
 *   transport: http('https://paymaster.example'),
 * })
 * ```
 *
 * @param options - Paymaster Client options.
 * @returns A Paymaster Client.
 */
export function create<
  transport extends Transport.Transport,
  schema extends ox_RpcSchema.Schema = never,
>(
  options: create.Options<transport, schema>,
): create.ReturnType<transport, schema> {
  const {
    key = 'paymaster',
    name = 'Paymaster Client',
    transport,
    ...rest
  } = options
  const base = viem_Client.create<
    undefined,
    undefined,
    transport,
    undefined,
    schema
  >({
    ...rest,
    key,
    name,
    transport,
    type: 'paymaster',
  })
  const decorate = actions() as unknown as (client: typeof base) => Decorator
  return base.extend(decorate) as unknown as create.ReturnType<
    transport,
    schema
  >
}

export declare namespace create {
  /** Options for {@link create}. */
  type Options<
    transport extends Transport.Transport = Transport.Transport,
    schema extends ox_RpcSchema.Schema = never,
  > = Pick<
    viem_Client.create.Options<
      undefined,
      undefined,
      transport,
      undefined,
      schema
    >,
    | 'cacheTime'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'retryCount'
    | 'schema'
    | 'timeout'
    | 'transport'
  >

  /** Return type of {@link create}. */
  type ReturnType<
    transport extends Transport.Transport = Transport.Transport,
    schema extends ox_RpcSchema.Schema = never,
  > = Client<transport, ox_RpcSchema.ToGeneric<schema>>

  /** Errors thrown by {@link create}. */
  type ErrorType = viem_Client.create.ErrorType
}

function actions() {
  return (client: Pick<viem_Client.Client, 'request'>): Decorator => ({
    paymaster: {
      getData: (options) => paymaster.getData(client, options),
      getStubData: (options) => paymaster.getStubData(client, options),
    },
  })
}
