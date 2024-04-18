import type {
  Abi,
  AbiEvent,
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  Address,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from 'abitype'

import type { Account } from '../accounts/types.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { Chain } from '../types/chain.js'
import type {
  AbiEventParametersToPrimitiveTypes,
  ContractEventName,
  ContractFunctionArgs,
  ContractFunctionName,
  MaybeExtractEventArgsFromAbi,
} from '../types/contract.js'
import type {
  IsNarrowable,
  IsNever,
  IsUndefined,
  Or,
  Prettify,
  UnionOmit,
} from '../types/utils.js'

import type { ErrorType } from '../errors/utils.js'
import { getAction } from '../utils/getAction.js'
import {
  type CreateContractEventFilterParameters,
  type CreateContractEventFilterReturnType,
  createContractEventFilter,
} from './public/createContractEventFilter.js'
import {
  type EstimateContractGasParameters,
  type EstimateContractGasReturnType,
  estimateContractGas,
} from './public/estimateContractGas.js'
import {
  type GetContractEventsParameters,
  type GetContractEventsReturnType,
  getContractEvents,
} from './public/getContractEvents.js'
import {
  type ReadContractParameters,
  type ReadContractReturnType,
  readContract,
} from './public/readContract.js'
import {
  type SimulateContractParameters,
  type SimulateContractReturnType,
  simulateContract,
} from './public/simulateContract.js'
import {
  type WatchContractEventParameters,
  type WatchContractEventReturnType,
  watchContractEvent,
} from './public/watchContractEvent.js'
import {
  type WriteContractParameters,
  type WriteContractReturnType,
  writeContract,
} from './wallet/writeContract.js'

type KeyedClient<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> =
  | {
      public?: Client<TTransport, TChain> | undefined
      wallet: Client<TTransport, TChain, TAccount>
    }
  | {
      public: Client<TTransport, TChain>
      wallet?: Client<TTransport, TChain, TAccount> | undefined
    }

export type GetContractParameters<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TClient extends
    | Client<TTransport, TChain, TAccount>
    | KeyedClient<TTransport, TChain, TAccount> =
    | Client<TTransport, TChain, TAccount>
    | KeyedClient<TTransport, TChain, TAccount>,
  TAddress extends Address = Address,
> = {
  /** Contract ABI */
  abi: TAbi
  /** Contract address */
  address: TAddress
  /** The Client.
   *
   * If you pass in a [`publicClient`](https://viem.sh/docs/clients/public), the following methods are available:
   *
   * - [`createEventFilter`](https://viem.sh/docs/contract/createContractEventFilter)
   * - [`estimateGas`](https://viem.sh/docs/contract/estimateContractGas)
   * - [`getEvents`](https://viem.sh/docs/contract/getContractEvents)
   * - [`read`](https://viem.sh/docs/contract/readContract)
   * - [`simulate`](https://viem.sh/docs/contract/simulateContract)
   * - [`watchEvent`](https://viem.sh/docs/contract/watchContractEvent)
   *
   * If you pass in a [`walletClient`](https://viem.sh/docs/clients/wallet), the following methods are available:
   *
   * - [`estimateGas`](https://viem.sh/docs/contract/estimateContractGas)
   * - [`write`](https://viem.sh/docs/contract/writeContract)
   */
  client: TClient
}

export type GetContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TClient extends Client | KeyedClient = Client | KeyedClient,
  TAddress extends Address = Address,
  _EventNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiEventNames<TAbi>
    : string,
  _ReadFunctionNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiFunctionNames<TAbi, 'pure' | 'view'>
    : string,
  _WriteFunctionNames extends string = TAbi extends Abi
    ? Abi extends TAbi
      ? string
      : ExtractAbiFunctionNames<TAbi, 'nonpayable' | 'payable'>
    : string,
  _Narrowable extends boolean = IsNarrowable<TAbi, Abi>,
  _PublicClient extends Client | unknown = TClient extends {
    public: Client
  }
    ? TClient['public']
    : TClient,
  _WalletClient extends Client | unknown = TClient extends {
    wallet: Client
  }
    ? TClient['wallet']
    : TClient,
> = Prettify<
  Prettify<
    (_PublicClient extends Client
      ? (IsNever<_ReadFunctionNames> extends true
          ? unknown
          : {
              /**
               * Calls a read-only function on a contract, and returns the response.
               *
               * A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
               *
               * Internally, `read` uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
               *
               * @example
               * import { createPublicClient, getContract, http, parseAbi } from 'viem'
               * import { mainnet } from 'viem/chains'
               *
               * const publicClient = createPublicClient({
               *   chain: mainnet,
               *   transport: http(),
               * })
               * const contract = getContract({
               *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
               *   abi: parseAbi([
               *     'function balanceOf(address owner) view returns (uint256)',
               *   ]),
               *   client: publicClient,
               * })
               * const result = await contract.read.balanceOf(['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'])
               * // 424122n
               */
              read: {
                [functionName in _ReadFunctionNames]: GetReadFunction<
                  _Narrowable,
                  TAbi,
                  functionName extends ContractFunctionName<
                    TAbi,
                    'pure' | 'view'
                  >
                    ? functionName
                    : never
                >
              }
            }) &
          (IsNever<_WriteFunctionNames> extends true
            ? unknown
            : {
                /**
                 * Estimates the gas necessary to complete a transaction without submitting it to the network.
                 *
                 * @example
                 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
                 * import { mainnet } from 'viem/chains'
                 *
                 * const publicClient = createPublicClient({
                 *   chain: mainnet,
                 *   transport: http(),
                 * })
                 * const contract = getContract({
                 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
                 *   abi: parseAbi(['function mint() public']),
                 *   client: publicClient,
                 * })
                 * const gas = await contract.estimateGas.mint({
                 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                 * })
                 */
                estimateGas: {
                  [functionName in _WriteFunctionNames]: GetEstimateFunction<
                    _Narrowable,
                    _PublicClient['chain'],
                    undefined,
                    TAbi,
                    functionName extends ContractFunctionName<
                      TAbi,
                      'nonpayable' | 'payable'
                    >
                      ? functionName
                      : never
                  >
                }
                /**
                 * Simulates/validates a contract interaction. This is useful for retrieving return data and revert reasons of contract write functions.
                 *
                 * This function does not require gas to execute and does not change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract), but also supports contract write functions.
                 *
                 * Internally, `simulate` uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
                 *
                 * @example
                 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
                 * import { mainnet } from 'viem/chains'
                 *
                 * const publicClient = createPublicClient({
                 *   chain: mainnet,
                 *   transport: http(),
                 * })
                 * const contract = getContract({
                 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
                 *   abi: parseAbi(['function mint() public']),
                 *   client: publicClient,
                 * })
                 * const result = await contract.simulate.mint({
                 *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
                 * })
                 */
                simulate: {
                  [functionName in _WriteFunctionNames]: GetSimulateFunction<
                    _Narrowable,
                    _PublicClient['chain'],
                    _WalletClient extends Client
                      ? _WalletClient['account']
                      : _PublicClient['account'],
                    TAbi,
                    functionName extends ContractFunctionName<
                      TAbi,
                      'nonpayable' | 'payable'
                    >
                      ? functionName
                      : never
                  >
                }
              }) &
          (IsNever<_EventNames> extends true
            ? unknown
            : {
                /**
                 * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs).
                 *
                 * @example
                 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
                 * import { mainnet } from 'viem/chains'
                 *
                 * const publicClient = createPublicClient({
                 *   chain: mainnet,
                 *   transport: http(),
                 * })
                 * const contract = getContract({
                 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
                 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
                 *   client: publicClient,
                 * })
                 * const filter = await contract.createEventFilter.Transfer()
                 */
                createEventFilter: {
                  [EventName in _EventNames]: GetEventFilter<
                    _Narrowable,
                    TAbi,
                    EventName extends ContractEventName<TAbi>
                      ? EventName
                      : never
                  >
                }
                /**
                 * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs).
                 *
                 * @example
                 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
                 * import { mainnet } from 'viem/chains'
                 *
                 * const publicClient = createPublicClient({
                 *   chain: mainnet,
                 *   transport: http(),
                 * })
                 * const contract = getContract({
                 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
                 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
                 *   client: publicClient,
                 * })
                 * const filter = await contract.createEventFilter.Transfer()
                 */
                getEvents: {
                  [EventName in _EventNames]: GetEventsFunction<
                    _Narrowable,
                    TAbi,
                    EventName extends ContractEventName<TAbi>
                      ? EventName
                      : never
                  >
                }
                /**
                 * Watches and returns emitted contract event logs.
                 *
                 * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent#onLogs).
                 *
                 * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
                 *
                 * @example
                 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
                 * import { mainnet } from 'viem/chains'
                 *
                 * const publicClient = createPublicClient({
                 *   chain: mainnet,
                 *   transport: http(),
                 * })
                 * const contract = getContract({
                 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
                 *   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
                 *   client: publicClient,
                 * })
                 * const filter = await contract.createEventFilter.Transfer()
                 * const unwatch = contract.watchEvent.Transfer(
                 *   { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
                 *   { onLogs: (logs) => console.log(logs) },
                 * )
                 */
                watchEvent: {
                  [EventName in _EventNames]: GetWatchEvent<
                    _Narrowable,
                    TAbi,
                    EventName extends ContractEventName<TAbi>
                      ? EventName
                      : never
                  >
                }
              })
      : unknown) &
      (_WalletClient extends Client
        ? IsNever<_WriteFunctionNames> extends true
          ? unknown
          : {
              /**
               * Estimates the gas necessary to complete a transaction without submitting it to the network.
               *
               * @example
               * import { createWalletClient, getContract, http, parseAbi } from 'viem'
               * import { mainnet } from 'viem/chains'
               *
               * const walletClient = createWalletClient({
               *   chain: mainnet,
               *   transport: http(),
               * })
               * const contract = getContract({
               *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
               *   abi: parseAbi(['function mint() public']),
               *   client: walletClient,
               * })
               * const gas = await contract.estimateGas.mint({
               *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
               * })
               */
              estimateGas: {
                [functionName in _WriteFunctionNames]: GetEstimateFunction<
                  _Narrowable,
                  _WalletClient['chain'],
                  _WalletClient['account'],
                  TAbi,
                  functionName extends ContractFunctionName<
                    TAbi,
                    'nonpayable' | 'payable'
                  >
                    ? functionName
                    : never
                >
              }
              /**
               * Executes a write function on a contract.
               *
               * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
               *
               * Internally, `write` uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
               *
               * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
               *
               * @example
               * import { createWalletClient, getContract, http, parseAbi } from 'viem'
               * import { mainnet } from 'viem/chains'
               *
               * const walletClient = createWalletClient({
               *   chain: mainnet,
               *   transport: http(),
               * })
               * const contract = getContract({
               *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
               *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
               *   client: walletClient,
               * })
               * const hash = await contract.write.min([69420], {
               *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
               * })
               */
              write: {
                [functionName in _WriteFunctionNames]: GetWriteFunction<
                  _Narrowable,
                  _WalletClient['chain'],
                  _WalletClient['account'],
                  TAbi,
                  functionName extends ContractFunctionName<
                    TAbi,
                    'nonpayable' | 'payable'
                  >
                    ? functionName
                    : never
                >
              }
            }
        : unknown)
  > & { address: TAddress; abi: TAbi }
>

export type GetContractErrorType = ErrorType

/**
 * Gets type-safe interface for performing contract-related actions with a specific `abi` and `address`.
 *
 * - Docs https://viem.sh/docs/contract/getContract
 *
 * Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properites every time you perform contract actions, e.g. [`readContract`](https://viem.sh/docs/contract/readContract), [`writeContract`](https://viem.sh/docs/contract/writeContract), [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas), etc.
 *
 * @example
 * import { createPublicClient, getContract, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const publicClient = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const contract = getContract({
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi([
 *     'function balanceOf(address owner) view returns (uint256)',
 *     'function ownerOf(uint256 tokenId) view returns (address)',
 *     'function totalSupply() view returns (uint256)',
 *   ]),
 *   client: publicClient,
 * })
 */
export function getContract<
  TTransport extends Transport,
  TAddress extends Address,
  const TAbi extends Abi | readonly unknown[],
  const TClient extends
    | Client<TTransport, TChain, TAccount>
    | KeyedClient<TTransport, TChain, TAccount>,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
>({
  abi,
  address,
  client: client_,
}: GetContractParameters<
  TTransport,
  TChain,
  TAccount,
  TAbi,
  TClient,
  TAddress
>): GetContractReturnType<TAbi, TClient, TAddress> {
  const client = client_ as
    | Client<TTransport, TChain, TAccount>
    | KeyedClient<TTransport, TChain, TAccount>

  const [publicClient, walletClient] = (() => {
    if (!client) return [undefined, undefined]
    if ('public' in client && 'wallet' in client)
      return [client.public as Client, client.wallet as Client]
    if ('public' in client) return [client.public as Client, undefined]
    if ('wallet' in client) return [undefined, client.wallet as Client]
    return [client, client]
  })()

  const hasPublicClient = publicClient !== undefined && publicClient !== null
  const hasWalletClient = walletClient !== undefined && walletClient !== null

  const contract: {
    [_ in
      | 'abi'
      | 'address'
      | 'createEventFilter'
      | 'estimateGas'
      | 'getEvents'
      | 'read'
      | 'simulate'
      | 'watchEvent'
      | 'write']?: unknown
  } = {}

  let hasReadFunction = false
  let hasWriteFunction = false
  let hasEvent = false
  for (const item of abi as Abi) {
    if (item.type === 'function')
      if (item.stateMutability === 'view' || item.stateMutability === 'pure')
        hasReadFunction = true
      else hasWriteFunction = true
    else if (item.type === 'event') hasEvent = true
    // Exit early if all flags are `true`
    if (hasReadFunction && hasWriteFunction && hasEvent) break
  }

  if (hasPublicClient) {
    if (hasReadFunction)
      contract.read = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[] | undefined,
                options?: UnionOmit<
                  ReadContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return getAction(
                publicClient,
                readContract,
                'readContract',
              )({
                abi,
                address,
                functionName,
                args,
                ...options,
              } as ReadContractParameters)
            }
          },
        },
      )

    if (hasWriteFunction)
      contract.simulate = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[],
                options?: UnionOmit<
                  SimulateContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return getAction(
                publicClient,
                simulateContract,
                'simulateContract',
              )({
                abi,
                address,
                functionName,
                args,
                ...options,
              } as SimulateContractParameters)
            }
          },
        },
      )

    if (hasEvent) {
      contract.createEventFilter = new Proxy(
        {},
        {
          get(_, eventName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[] | object,
                options?: Omit<
                  CreateContractEventFilterParameters,
                  'abi' | 'address' | 'eventName' | 'args'
                >,
              ]
            ) => {
              const abiEvent = (abi as readonly AbiEvent[]).find(
                (x: AbiEvent) => x.type === 'event' && x.name === eventName,
              )
              const { args, options } = getEventParameters(
                parameters,
                abiEvent!,
              )
              return getAction(
                publicClient,
                createContractEventFilter,
                'createContractEventFilter',
              )({
                abi,
                address,
                eventName,
                args,
                ...options,
              } as CreateContractEventFilterParameters)
            }
          },
        },
      )
      contract.getEvents = new Proxy(
        {},
        {
          get(_, eventName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[] | object,
                options?: Omit<
                  GetContractEventsParameters,
                  'abi' | 'address' | 'eventName'
                >,
              ]
            ) => {
              const abiEvent = (abi as readonly AbiEvent[]).find(
                (x: AbiEvent) => x.type === 'event' && x.name === eventName,
              )
              const { args, options } = getEventParameters(
                parameters,
                abiEvent!,
              )
              return getAction(
                publicClient,
                getContractEvents,
                'getContractEvents',
              )({
                abi,
                address,
                eventName,
                args,
                ...options,
              } as unknown as GetContractEventsParameters)
            }
          },
        },
      )
      contract.watchEvent = new Proxy(
        {},
        {
          get(_, eventName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[] | object,
                options?: Omit<
                  WatchContractEventParameters,
                  'abi' | 'address' | 'eventName'
                >,
              ]
            ) => {
              const abiEvent = (abi as readonly AbiEvent[]).find(
                (x: AbiEvent) => x.type === 'event' && x.name === eventName,
              )
              const { args, options } = getEventParameters(
                parameters,
                abiEvent!,
              )
              return getAction(
                publicClient,
                watchContractEvent,
                'watchContractEvent',
              )({
                abi,
                address,
                eventName,
                args,
                ...options,
              } as unknown as WatchContractEventParameters)
            }
          },
        },
      )
    }
  }

  if (hasWalletClient) {
    if (hasWriteFunction)
      contract.write = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[],
                options?: UnionOmit<
                  WriteContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return getAction(
                walletClient,
                writeContract,
                'writeContract',
              )({
                abi,
                address,
                functionName,
                args,
                ...(options as any),
              })
            }
          },
        },
      )
  }

  if (hasPublicClient || hasWalletClient)
    if (hasWriteFunction)
      contract.estimateGas = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[],
                options?: UnionOmit<
                  EstimateContractGasParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              const client = (publicClient ?? walletClient)!
              return getAction(
                client,
                estimateContractGas,
                'estimateContractGas',
              )({
                abi,
                address,
                functionName,
                args,
                ...options,
                account:
                  (options as EstimateContractGasParameters).account ??
                  (walletClient as unknown as Client).account,
              } as any)
            }
          },
        },
      )
  contract.address = address
  contract.abi = abi

  return contract as unknown as GetContractReturnType<TAbi, TClient, TAddress>
}

/**
 * @internal exporting for testing only
 */
export function getFunctionParameters(
  values: [args?: readonly unknown[] | undefined, options?: object | undefined],
) {
  const hasArgs = values.length && Array.isArray(values[0])
  const args = hasArgs ? values[0]! : []
  const options = (hasArgs ? values[1] : values[0]) ?? {}
  return { args, options }
}

/**
 * @internal exporting for testing only
 */
export function getEventParameters(
  values: [args?: object | unknown[], options?: object],
  abiEvent: AbiEvent,
) {
  let hasArgs = false
  // If first item is array, must be `args`
  if (Array.isArray(values[0])) hasArgs = true
  // Check if first item is `args` or `options`
  else if (values.length === 1) {
    // if event has indexed inputs, must have `args`
    hasArgs = abiEvent.inputs.some((x) => x.indexed)
    // If there are two items in array, must have `args`
  } else if (values.length === 2) {
    hasArgs = true
  }

  const args = hasArgs ? values[0]! : undefined
  const options = (hasArgs ? values[1] : values[0]) ?? {}
  return { args, options }
}

type GetReadFunction<
  Narrowable extends boolean,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
  TArgs extends ContractFunctionArgs<
    TAbi,
    'pure' | 'view',
    TFunctionName
  > = ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  Options = Prettify<
    UnionOmit<
      ReadContractParameters<TAbi, TFunctionName, TArgs>,
      'abi' | 'address' | 'args' | 'functionName'
    >
  >,
> = Narrowable extends true
  ? (
      ...parameters: Args extends readonly []
        ? [options?: Options]
        : [args: Args, options?: Options]
    ) => Promise<ReadContractReturnType<TAbi, TFunctionName, TArgs>>
  : (
      ...parameters:
        | [options?: Options]
        | [args: readonly unknown[], options?: Options]
    ) => Promise<ReadContractReturnType>

type GetEstimateFunction<
  Narrowable extends boolean,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TArgs extends ContractFunctionArgs<
    TAbi,
    'nonpayable' | 'payable',
    TFunctionName
  > = ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  Options = Prettify<
    UnionOmit<
      EstimateContractGasParameters<TAbi, TFunctionName, TArgs, TChain>,
      'abi' | 'address' | 'args' | 'functionName'
    >
  >,
  // For making `options` parameter required if `TAccount`
  IsOptionsRequired = IsUndefined<TAccount>,
> = Narrowable extends true
  ? (
      ...parameters: Args extends readonly []
        ? IsOptionsRequired extends true
          ? [options: Options]
          : [options?: Options]
        : [
            args: Args,
            ...parameters: IsOptionsRequired extends true
              ? [options: Options]
              : [options?: Options],
          ]
    ) => Promise<EstimateContractGasReturnType>
  : (
      ...parameters:
        | (IsOptionsRequired extends true
            ? [options: Options]
            : [options?: Options])
        | [
            args: readonly unknown[],
            ...parameters: IsOptionsRequired extends true
              ? [options: Options]
              : [options?: Options],
          ]
    ) => Promise<EstimateContractGasReturnType>

type GetSimulateFunction<
  Narrowable extends boolean,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TArgs extends ContractFunctionArgs<
    TAbi,
    'nonpayable' | 'payable',
    TFunctionName
  > = ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
> = Narrowable extends true
  ? <
      TChainOverride extends Chain | undefined = undefined,
      TAccountOverride extends Account | Address | undefined = undefined,
    >(
      ...parameters: Args extends readonly []
        ? [
            options?: Omit<
              SimulateContractParameters<
                TAbi,
                TFunctionName,
                TArgs,
                TChain,
                TChainOverride,
                TAccountOverride
              >,
              'abi' | 'address' | 'args' | 'functionName'
            >,
          ]
        : [
            args: Args,
            options?: Omit<
              SimulateContractParameters<
                TAbi,
                TFunctionName,
                TArgs,
                TChain,
                TChainOverride,
                TAccountOverride
              >,
              'abi' | 'address' | 'args' | 'functionName'
            >,
          ]
    ) => Promise<
      SimulateContractReturnType<
        TAbi,
        TFunctionName,
        TArgs,
        TChain,
        TAccount,
        TChainOverride,
        TAccountOverride
      >
    >
  : <
      TChainOverride extends Chain | undefined = undefined,
      TAccountOverride extends Account | Address | undefined = undefined,
    >(
      ...parameters:
        | [
            options?: Omit<
              SimulateContractParameters<
                TAbi,
                TFunctionName,
                TArgs,
                TChain,
                TChainOverride,
                TAccountOverride
              >,
              'abi' | 'address' | 'args' | 'functionName'
            >,
          ]
        | [
            args: readonly unknown[],
            options?: Omit<
              SimulateContractParameters<
                TAbi,
                TFunctionName,
                TArgs,
                TChain,
                TChainOverride,
                TAccountOverride
              >,
              'abi' | 'address' | 'args' | 'functionName'
            >,
          ]
    ) => Promise<SimulateContractReturnType>

type GetWriteFunction<
  Narrowable extends boolean,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TArgs extends ContractFunctionArgs<
    TAbi,
    'nonpayable' | 'payable',
    TFunctionName
  > = ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  // For making `options` parameter required if `TAccount` or `TChain` is undefined
  IsOptionsRequired = Or<[IsUndefined<TAccount>, IsUndefined<TChain>]>,
> = Narrowable extends true
  ? <
      TChainOverride extends Chain | undefined,
      Options extends Prettify<
        UnionOmit<
          WriteContractParameters<
            TAbi,
            TFunctionName,
            TArgs,
            TChain,
            TAccount,
            TChainOverride
          >,
          'abi' | 'address' | 'args' | 'functionName'
        >
      >,
    >(
      ...parameters: Args extends readonly []
        ? IsOptionsRequired extends true
          ? [options: Options]
          : [options?: Options]
        : [
            args: Args,
            ...parameters: IsOptionsRequired extends true
              ? [options: Options]
              : [options?: Options],
          ]
    ) => Promise<WriteContractReturnType>
  : <
      TChainOverride extends Chain | undefined,
      Options extends Prettify<
        UnionOmit<
          WriteContractParameters<
            TAbi,
            TFunctionName,
            TArgs,
            TChain,
            TAccount,
            TChainOverride
          >,
          'abi' | 'address' | 'args' | 'functionName'
        >
      >,
      Rest extends unknown[] = IsOptionsRequired extends true
        ? [options: Options]
        : [options?: Options],
    >(
      ...parameters: Rest | [args: readonly unknown[], ...parameters: Rest]
    ) => Promise<WriteContractReturnType>

type GetEventFilter<
  Narrowable extends boolean,
  TAbi extends Abi | readonly unknown[],
  TEventName extends ContractEventName<TAbi>,
  TAbiEvent extends AbiEvent = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent,
  Args = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs']>,
  Options = Prettify<
    Omit<
      CreateContractEventFilterParameters<TAbi, TEventName>,
      'abi' | 'address' | 'args' | 'eventName' | 'strict'
    >
  >,
  IndexedInputs = Extract<TAbiEvent['inputs'][number], { indexed: true }>,
> = Narrowable extends true
  ? <
      const TArgs extends
        | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
        | undefined,
      TStrict extends boolean | undefined = undefined,
    >(
      ...parameters: IsNever<IndexedInputs> extends true
        ? [options?: Options & { strict?: TStrict }]
        : [
            args: Args | (Args extends TArgs ? Readonly<TArgs> : never),
            options?: Options & { strict?: TStrict },
          ]
    ) => Promise<
      CreateContractEventFilterReturnType<TAbi, TEventName, TArgs, TStrict>
    >
  : <TStrict extends boolean | undefined = undefined>(
      ...parameters:
        | [options?: Options & { strict?: TStrict }]
        | [
            args: readonly unknown[] | CreateContractFilterOptions,
            options?: Options & { strict?: TStrict },
          ]
    ) => Promise<CreateContractEventFilterReturnType>

type GetEventsFunction<
  Narrowable extends boolean,
  TAbi extends Abi | readonly unknown[],
  TEventName extends ContractEventName<TAbi>,
  TAbiEvent extends AbiEvent = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent,
  Args = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs']>,
  Options = Prettify<
    Omit<
      GetContractEventsParameters<TAbi, TEventName>,
      'abi' | 'address' | 'args' | 'eventName'
    >
  >,
  IndexedInputs = Extract<TAbiEvent['inputs'][number], { indexed: true }>,
> = Narrowable extends true
  ? (
      ...parameters: IsNever<IndexedInputs> extends true
        ? [options?: Options]
        : [args?: Args, options?: Options]
    ) => Promise<GetContractEventsReturnType<TAbi, TEventName>>
  : (
      ...parameters:
        | [options?: Options]
        | [
            args?: readonly unknown[] | WatchContractEventOptions,
            options?: Options,
          ]
    ) => Promise<GetContractEventsReturnType<TAbi, TEventName>>

type GetWatchEvent<
  Narrowable extends boolean,
  TAbi extends Abi | readonly unknown[],
  TEventName extends ContractEventName<TAbi>,
  TAbiEvent extends AbiEvent = TAbi extends Abi
    ? ExtractAbiEvent<TAbi, TEventName>
    : AbiEvent,
  Args = AbiEventParametersToPrimitiveTypes<TAbiEvent['inputs']>,
  Options = Prettify<
    Omit<
      WatchContractEventParameters<TAbi, TEventName>,
      'abi' | 'address' | 'args' | 'eventName'
    >
  >,
  IndexedInputs = Extract<TAbiEvent['inputs'][number], { indexed: true }>,
> = Narrowable extends true
  ? (
      ...parameters: IsNever<IndexedInputs> extends true
        ? [options: Options]
        : [args: Args, options: Options]
    ) => WatchContractEventReturnType
  : (
      ...parameters:
        | [options?: Options]
        | [
            args: readonly unknown[] | WatchContractEventOptions,
            options?: Options,
          ]
    ) => WatchContractEventReturnType

type CreateContractFilterOptions =
  RemoveProperties<CreateContractEventFilterParameters>
type WatchContractEventOptions = RemoveProperties<WatchContractEventParameters>

type RemoveProperties<T extends object> = Prettify<
  {
    [key: string]: unknown
  } & {
    [_ in keyof T]?: never
  }
>
