import { AbiEvent, Hex } from 'ox'
import type { Address, Errors, Log } from 'ox'

import type * as Account from '../../../core/Account.js'
import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import type { simulate as simulateContract } from '../../../core/actions/contract/simulate.js'
import { write } from '../../../core/actions/contract/write.js'
import type { writeSync } from '../../../core/actions/contract/writeSync.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'
import type { WriteParameters } from '../../internal/types.js'
import {
  type CallParameters,
  defineCall,
  dispatchWrite,
  estimateWrite,
  pickWriteParameters,
  resolveCallParameters,
  resolveToken,
  simulateWrite,
} from '../../internal/utils.js'

/**
 * Creates a new TIP-20 token.
 *
 * @example
 * ```ts
 * import { Account, Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({
 *   account: Account.fromSecp256k1('0x…'),
 *   transport: http(),
 * })
 *
 * const hash = await Actions.token.create(client, {
 *   currency: 'USD',
 *   logoURI: 'https://example.com/token.svg',
 *   name: 'My Token',
 *   symbol: 'MTK',
 * })
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns The transaction hash.
 */
export async function create<
  chain extends Chain.Chain | undefined,
  account extends Account.Account | undefined,
>(
  client: Client.Client<chain, account>,
  options: create.Options<account>,
): Promise<create.ReturnType> {
  return create.inner(write, client, options)
}

export namespace create {
  export type Args = {
    /** Admin address. */
    admin: Address.Address
    /** Currency (e.g. "USD"). */
    currency: string
    /** Token name. */
    name: string
    /** Logo URI. Requires a T5-enabled Tempo chain. */
    logoURI?: string | undefined
    /** Quote token. */
    quoteToken?: Address.Address | undefined
    /** Unique salt. @default Hex.random(32) */
    salt?: Hex.Hex | undefined
    /** Token symbol. */
    symbol: string
  }
  export type Options<
    account extends Account.Account | undefined = Account.Account | undefined,
  > = WriteParameters &
    Omit<Args, 'admin'> &
    (account extends Account.Account
      ? { admin?: Account.Account | Address.Address | undefined }
      : { admin: Account.Account | Address.Address })
  export type ReturnType = write.ReturnType
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
    options: create.Options<account>,
  ): Promise<dispatchWrite.ReturnType<action>> {
    const {
      account = client.account,
      admin: admin_ = client.account,
      chain = client.chain,
    } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')

    return dispatchWrite(action, client, {
      ...options,
      account,
      chain,
      ...create.call(client, { ...options, admin }),
    })
  }

  /**
   * Defines a call to the `createToken` function.
   *
   * Can be passed to any action that accepts a contract call. `quoteToken`
   * defaults to PathUSD.
   *
   * @param parameters - Client (optional), followed by the call arguments.
   * @returns The call.
   */
  export function call<chain extends Chain.Chain | undefined>(
    ...parameters: CallParameters<Args, Client.Client<chain>>
  ) {
    const [client, args] = resolveCallParameters(parameters)
    const {
      admin,
      currency,
      logoURI,
      name,
      quoteToken = Addresses.pathUsd,
      salt = Hex.random(32),
      symbol,
    } = args
    const quoteTokenAddress = resolveToken(client, {
      token: quoteToken,
    }).address
    return defineCall({
      abi: Abis.tip20Factory,
      address: Addresses.tip20Factory,
      args:
        typeof logoURI === 'string'
          ? [name, symbol, currency, quoteTokenAddress, admin, salt, logoURI]
          : [name, symbol, currency, quoteTokenAddress, admin, salt],
      functionName: 'createToken',
    })
  }

  /**
   * Estimates the gas required to create a TIP-20 token.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The gas estimate.
   */
  export async function estimateGas<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: create.Options<account>,
  ): Promise<bigint> {
    const { admin: admin_ = client.account } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')
    return estimateWrite(client, {
      ...pickWriteParameters(options),
      ...create.call(client, { ...options, admin }),
    })
  }

  /**
   * Simulates creating a TIP-20 token.
   *
   * @param client - Client.
   * @param options - Options.
   * @returns The simulation result and write request.
   */
  export async function simulate<
    chain extends Chain.Chain | undefined,
    account extends Account.Account | undefined,
  >(
    client: Client.Client<chain, account>,
    options: create.Options<account>,
  ): Promise<
    simulateContract.ReturnType<typeof Abis.tip20Factory, 'createToken'>
  > {
    const { admin: admin_ = client.account } = options
    const admin = admin_ ? resolveAdmin(admin_) : undefined
    if (!admin) throw new Error('admin is required.')
    return simulateWrite(client, {
      ...pickWriteParameters(options),
      ...create.call(client, { ...options, admin }),
    })
  }

  /**
   * Extracts the `TokenCreated` event from logs.
   *
   * @param logs - The logs.
   * @returns The `TokenCreated` event.
   */
  export function extractEvent(logs: readonly Log.Log[]) {
    const [log] = AbiEvent.extractLogs(Abis.tip20Factory, logs, {
      eventName: 'TokenCreated',
      strict: true,
    })
    if (!log) throw new Error('`TokenCreated` event not found.')
    return log
  }
}

function resolveAdmin(admin: Account.Account | Address.Address) {
  if (typeof admin === 'string') return admin
  return admin.address
}
