import type { Address } from 'abitype'
import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { erc20Abi } from '../../constants/abis.js'
import { ClientChainNotConfiguredError } from '../../errors/chain.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Assign } from '../../types/utils.js'
import {
  allowance,
  approve,
  approveSync,
  getBalance,
  getMetadata,
  transfer,
  transferSync,
  watchApproval,
  watchTransfer,
} from '../actions/erc20.js'
import { TokenNotFoundError } from '../errors.js'

/** The ERC-20 ABI used by all token actions. */
export const abi = erc20Abi

/** Per-chain address map: chain id → token contract address. */
export type Addresses = Record<number, Address>

/** A way to resolve a chain id: either a raw id or a client carrying a chain. */
export type ChainIdOrClient = number | Client<Transport, Chain | undefined, any>

/**
 * Resolves a token's address for a given chain id (or client) from an address
 * map. Throws if the client has no chain, or the token is not deployed on the
 * chain.
 *
 * @example
 * ```ts
 * import { mainnet } from 'viem/chains'
 * import { Addresses, Decorators } from 'viem/tokens'
 *
 * Decorators.getAddress(mainnet.id, Addresses.usdc)
 * // '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
 * ```
 *
 * @param chainIdOrClient - Chain id, or a client carrying a chain.
 * @param addresses - Address map.
 * @returns The token address.
 */
export function getAddress(
  chainIdOrClient: ChainIdOrClient,
  addresses: Addresses,
): Address {
  const chainId =
    typeof chainIdOrClient === 'number'
      ? chainIdOrClient
      : chainIdOrClient.chain?.id
  if (chainId === undefined) throw new ClientChainNotConfiguredError()
  const address = addresses[chainId]
  if (!address) throw new TokenNotFoundError({ chainId })
  return address
}

/**
 * Whether an `address` override is required for a given chain. `true` when the
 * token has no configured address for the client's chain (or the chain is
 * unknown), `false` when the address can be resolved from the address map.
 */
export type AddressRequired<
  addresses extends Addresses,
  chain extends Chain | undefined,
> = chain extends { id: infer id }
  ? id extends keyof addresses
    ? false
    : true
  : true

/**
 * The address resolution field. When the token address cannot be resolved from
 * the client chain (`required`), the caller must supply either an explicit
 * `address` or a `chain` to resolve the address from the token's address map.
 * Otherwise, both are optional overrides.
 */
type AddressField<required extends boolean> = required extends true
  ?
      | {
          /**
           * Token contract address. Required because the token has no
           * configured address for the client's chain.
           */
          address: Address
          chain?: undefined
        }
      | {
          /**
           * Chain to resolve the token address from (via the token's configured
           * address map). Required because the address cannot be resolved from
           * the client's chain.
           */
          chain: Chain
          address?: undefined
        }
  : {
      /** Override the resolved token address. */
      address?: Address | undefined
      /** Resolve the token address from this chain instead of the client chain. */
      chain?: Chain | undefined
    }

/**
 * Args with `address` resolved from the client chain (optional unless the chain
 * has no configured address, in which case an `address` or `chain` is
 * required). The `amount` field stays a human-readable decimal string, parsed
 * by the underlying action with the token's configured `decimals`.
 */
type Bind<args, required extends boolean = false> = Omit<
  args,
  'address' | 'chain'
> &
  AddressField<required>

/**
 * Parameters for a read action with no required fields: optional unless the
 * chain has no configured address (then `address` must be supplied).
 */
type ReadParams<args, required extends boolean> = required extends true
  ? [parameters: Bind<args, true>]
  : [parameters?: Bind<args, false> | undefined]

/** Static `.call` helper for a bound action. */
type CallReturnProperties<
  action extends { call: (args: any) => any },
  required extends boolean = false,
> = {
  /**
   * Defines a call to the underlying contract function. The token address is
   * resolved from the client chain, or pass `address` to override.
   *
   * Can be passed to `estimateContractGas`, `simulateContract`, `sendCalls`,
   * `sendTransaction` (`calls`), or `multicall`.
   */
  call: (
    args: Bind<Parameters<action['call']>[0], required>,
  ) => ReturnType<action['call']>
}

/** Static `.extractEvent` helper for a bound write action. */
type EventReturnProperties<
  action extends { extractEvent: (logs: Log[]) => any },
> = {
  /** Extracts the relevant event from logs. */
  extractEvent: action['extractEvent']
}

/**
 * A client decorator that attaches a token namespace (e.g. `client.usdc`) to a
 * client. Each action on the namespace resolves the contract address from the
 * client chain (or accepts an `address` override), so the client never needs to
 * be passed explicitly.
 */
export type Decorator<
  name extends string = string,
  addresses extends Addresses = Addresses,
> = <
  transport extends Transport,
  chain extends Chain | undefined,
  account extends Account | undefined,
  ///
  required extends boolean = AddressRequired<addresses, chain>,
>(
  client: Client<transport, chain, account>,
) => {
  [key in name]: {
    /**
     * Address map the token was defined with, keyed by chain id.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * client.usdc.addresses[mainnet.id]
     * ```
     */
    addresses: addresses
    /**
     * Resolves the token address. Defaults to the client chain, or pass a chain
     * id (or client) to override. Throws if the token is not deployed on the
     * chain.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const address = client.usdc.getAddress()
     * ```
     *
     * @param chainIdOrClient - Chain id, or a client carrying a chain.
     * @returns The token address.
     */
    getAddress: (chainIdOrClient?: ChainIdOrClient | undefined) => Address

    // read
    /**
     * Gets the allowance a spender has over an owner's tokens.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const allowance = await client.usdc.allowance({
     *   owner: '0x...',
     *   spender: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The allowance.
     */
    allowance: ((
      parameters: Bind<allowance.Parameters, required>,
    ) => Promise<allowance.ReturnValue>) &
      CallReturnProperties<typeof allowance, required>
    /**
     * Gets the token balance of an account.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const balance = await client.usdc.getBalance({ account: '0x...' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The token balance.
     */
    getBalance: ((
      parameters: Bind<getBalance.Parameters, required>,
    ) => Promise<getBalance.ReturnValue>) &
      CallReturnProperties<typeof getBalance, required>
    /**
     * Gets the token metadata (`name`, `symbol`, `decimals`, and `totalSupply`)
     * in a single multicall.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const { name, symbol, decimals, totalSupply } =
     *   await client.usdc.getMetadata()
     * ```
     *
     * @param parameters - Parameters.
     * @returns The token metadata.
     */
    getMetadata: (
      ...parameters: ReadParams<getMetadata.Parameters, required>
    ) => Promise<getMetadata.ReturnValue>

    // write
    /**
     * Approves a spender to transfer tokens on behalf of the caller.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const hash = await client.usdc.approve({ amount: '100', spender: '0x...' })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    approve: ((
      parameters: Bind<approve.Parameters<chain, account>, required>,
    ) => Promise<approve.ReturnValue>) &
      CallReturnProperties<typeof approve, required> &
      EventReturnProperties<typeof approve>
    /**
     * Approves a spender to transfer tokens on behalf of the caller, and waits for
     * the transaction to be confirmed.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const { receipt } = await client.usdc.approveSync({
     *   amount: '100',
     *   spender: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    approveSync: (
      parameters: Bind<approveSync.Parameters<chain, account>, required>,
    ) => Promise<approveSync.ReturnValue>
    /**
     * Transfers tokens to another address. Pass `from` to transfer on behalf of
     * another address using an allowance (calls `transferFrom`).
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const hash = await client.usdc.transfer({
     *   amount: '100',
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction hash.
     */
    transfer: ((
      parameters: Bind<transfer.Parameters<chain, account>, required>,
    ) => Promise<transfer.ReturnValue>) &
      CallReturnProperties<typeof transfer, required> &
      EventReturnProperties<typeof transfer>
    /**
     * Transfers tokens to another address, and waits for the transaction to be
     * confirmed. Pass `from` to transfer on behalf of another address using an
     * allowance (calls `transferFrom`).
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { privateKeyToAccount } from 'viem/accounts'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   account: privateKeyToAccount('0x...'),
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const { receipt } = await client.usdc.transferSync({
     *   amount: '100',
     *   to: '0x...',
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns The transaction receipt and event data.
     */
    transferSync: (
      parameters: Bind<transferSync.Parameters<chain, account>, required>,
    ) => Promise<transferSync.ReturnValue>

    // watch
    /**
     * Watches for `Transfer` events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const unwatch = client.usdc.watchTransfer({
     *   onTransfer: (args, log) => {
     *     console.log('Transfer:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchTransfer: (
      parameters: Bind<watchTransfer.Parameters, required>,
    ) => ReturnType<typeof watchTransfer>
    /**
     * Watches for `Approval` events.
     *
     * @example
     * ```ts
     * import { createClient, http } from 'viem'
     * import { mainnet } from 'viem/chains'
     * import { usdc } from 'viem/tokens'
     *
     * const client = createClient({
     *   chain: mainnet,
     *   transport: http(),
     * }).extend(usdc())
     *
     * const unwatch = client.usdc.watchApproval({
     *   onApproval: (args, log) => {
     *     console.log('Approval:', args)
     *   },
     * })
     * ```
     *
     * @param parameters - Parameters.
     * @returns A function to unsubscribe from the event.
     */
    watchApproval: (
      parameters: Bind<watchApproval.Parameters, required>,
    ) => ReturnType<typeof watchApproval>
  }
}

/** Configuration for {@link define}. */
export type Config<addresses extends Addresses = Addresses> = {
  /** Per-chain token address map, keyed by chain id. */
  addresses: addresses
  /**
   * Token decimals, used to parse human-readable string `amount` inputs into
   * base units via `parseUnits`.
   */
  decimals: number
}

/**
 * Defines an ERC-20 token client decorator. The returned factory produces a
 * decorator that attaches the token's actions to a client under `name`,
 * resolving the contract address from the client chain.
 *
 * This is the composability primitive: define a new ERC-20 token by passing a
 * namespace and config, with zero action duplication.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { Decorators } from 'viem/tokens'
 *
 * const dai = Decorators.defineErc20('dai', {
 *   addresses: { [mainnet.id]: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
 *   decimals: 18,
 * })
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(dai())
 *
 * // `amount` is a human-readable string, parsed with `decimals`.
 * await client.dai.transfer({ amount: '10.5', to: '0x...' })
 * ```
 *
 * The returned factory accepts optional overrides to merge additional (or
 * replacement) addresses over the configured address map, and to override the
 * default `decimals`.
 *
 * @example
 * ```ts
 * // Override the address on a specific chain.
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * }).extend(dai({ addresses: { [mainnet.id]: '0x...' } }))
 * ```
 *
 * @param key - Namespace to attach the token actions under.
 * @param config - Token configuration.
 * @returns A decorator factory.
 */
export function define<
  const key extends string,
  const addresses extends Addresses,
>(
  key: key,
  config: Config<addresses>,
): <const overrides extends Addresses = {}>(
  parameters?: define.Parameters<overrides> | undefined,
) => Decorator<key, Assign<addresses, overrides>> {
  return ((parameters?: define.Parameters) =>
    ((client: Client<Transport, Chain | undefined, any>) => {
      const addresses = { ...config.addresses, ...parameters?.addresses }
      const decimals = parameters?.decimals ?? config.decimals

      const resolve = (chainIdOrClient: ChainIdOrClient = client) =>
        getAddress(chainIdOrClient, addresses)

      function normalize(parameters: any) {
        if (!parameters || !('amount' in parameters)) return parameters
        // Forward the human-readable string `amount` to the generic action,
        // defaulting `decimals` to the token's configured value so it parses
        // correctly.
        return {
          ...parameters,
          decimals: parameters.decimals ?? decimals,
        }
      }

      function bind(action: any) {
        // Resolve `address` from (in order): an explicit `address`, a `chain`
        // (looked up in the token's address map), then the client chain. The
        // `chain` field is stripped before forwarding to the underlying action.
        function resolveArgs(args: any) {
          const { chain, ...rest } = normalize(args)
          return {
            ...rest,
            address:
              args.address ?? (chain ? resolve(chain.id) : resolve(client)),
          }
        }
        const wrapped = (parameters: any = {}) =>
          action(client, resolveArgs(parameters))
        if (Object.hasOwn(action, 'call'))
          wrapped.call = (args: any = {}) => action.call(resolveArgs(args))
        if (Object.hasOwn(action, 'extractEvent'))
          wrapped.extractEvent = action.extractEvent
        return wrapped
      }

      return {
        [key]: {
          addresses,
          getAddress: resolve,
          allowance: bind(allowance),
          getBalance: bind(getBalance),
          getMetadata: bind(getMetadata),
          approve: bind(approve),
          approveSync: bind(approveSync),
          transfer: bind(transfer),
          transferSync: bind(transferSync),
          watchTransfer: bind(watchTransfer),
          watchApproval: bind(watchApproval),
        },
      }
    }) as never) as never
}

export namespace define {
  /** Parameters for an ERC-20 token decorator factory. */
  export type Parameters<overrides extends Addresses = Addresses> = {
    /**
     * Address overrides merged over the token's configured address map, keyed
     * by chain id.
     */
    addresses?: overrides | undefined
    /**
     * Decimals override, used to parse human-readable string `amount` inputs
     * into base units via `parseUnits`.
     */
    decimals?: number | undefined
  }
}
