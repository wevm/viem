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

export type GetContractParameters<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TPublicClient extends Client<TTransport, TChain> | unknown = unknown,
  TWalletClient extends
    | Client<TTransport, TChain, TAccount>
    | unknown = unknown,
  TAddress extends Address = Address,
> = {
  /** Contract ABI */
  abi: TAbi
  /** Contract address */
  address: TAddress
  /**
   * Public client
   *
   * If you pass in a [`publicClient`](https://viem.sh/docs/clients/public.html), the following methods are available:
   *
   * - [`createEventFilter`](https://viem.sh/docs/contract/createContractEventFilter.html)
   * - [`estimateGas`](https://viem.sh/docs/contract/estimateContractGas.html)
   * - [`getEvents`](https://viem.sh/docs/contract/getContractEvents.html)
   * - [`read`](https://viem.sh/docs/contract/readContract.html)
   * - [`simulate`](https://viem.sh/docs/contract/simulateContract.html)
   * - [`watchEvent`](https://viem.sh/docs/contract/watchContractEvent.html)
   */
  publicClient?: TPublicClient
  /**
   * Wallet client
   *
   * If you pass in a [`walletClient`](https://viem.sh/docs/clients/wallet.html), the following methods are available:
   *
   * - [`estimateGas`](https://viem.sh/docs/contract/estimateContractGas.html)
   * - [`write`](https://viem.sh/docs/contract/writeContract.html)
   */
  walletClient?: TWalletClient
}

export type GetContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TPublicClient extends Client | unknown = unknown,
  TWalletClient extends Client | unknown = unknown,
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
> = Prettify<
  (TPublicClient extends Client
    ? (IsNever<_ReadFunctionNames> extends true
        ? unknown
        : {
            /**
             * Calls a read-only function on a contract, and returns the response.
             *
             * A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
             *
             * Internally, `read` uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`call` action](https://viem.sh/docs/actions/public/call.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
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
             *   publicClient,
             * })
             * const result = await contract.read.balanceOf(['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'])
             * // 424122n
             */
            read: {
              [_FunctionName in _ReadFunctionNames]: GetReadFunction<
                _Narrowable,
                TAbi,
                _FunctionName
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
               *   publicClient,
               * })
               * const gas = await contract.estimateGas.mint({
               *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
               * })
               */
              estimateGas: {
                [_FunctionName in _WriteFunctionNames]: GetEstimateFunction<
                  _Narrowable,
                  TPublicClient['chain'],
                  undefined,
                  TAbi,
                  _FunctionName
                >
              }
              /**
               * Simulates/validates a contract interaction. This is useful for retrieving return data and revert reasons of contract write functions.
               *
               * This function does not require gas to execute and does not change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract.html), but also supports contract write functions.
               *
               * Internally, `simulate` uses a [Public Client](https://viem.sh/docs/clients/public.html) to call the [`call` action](https://viem.sh/docs/actions/public/call.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
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
               *   publicClient,
               * })
               * const result = await contract.simulate.mint({
               *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
               * })
               */
              simulate: {
                [_FunctionName in _WriteFunctionNames]: GetSimulateFunction<
                  _Narrowable,
                  TPublicClient['chain'],
                  TAbi,
                  _FunctionName
                >
              }
            }) &
        (IsNever<_EventNames> extends true
          ? unknown
          : {
              /**
               * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges.html) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs.html).
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
               *   publicClient,
               * })
               * const filter = await contract.createEventFilter.Transfer()
               */
              createEventFilter: {
                [_EventName in _EventNames]: GetEventFilter<
                  _Narrowable,
                  TAbi,
                  _EventName
                >
              }
              /**
               * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges.html) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs.html).
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
               *   publicClient,
               * })
               * const filter = await contract.createEventFilter.Transfer()
               */
              getEvents: {
                [_EventName in _EventNames]: GetEventsFunction<
                  _Narrowable,
                  TAbi,
                  _EventName
                >
              }
              /**
               * Watches and returns emitted contract event logs.
               *
               * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
               *
               * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter.html) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getEvents`](https://viem.sh/docs/actions/public/getEvents.html) instead.
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
               *   publicClient,
               * })
               * const filter = await contract.createEventFilter.Transfer()
               * const unwatch = contract.watchEvent.Transfer(
               *   { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
               *   { onLogs: (logs) => console.log(logs) },
               * )
               */
              watchEvent: {
                [_EventName in _EventNames]: GetWatchEvent<
                  _Narrowable,
                  TAbi,
                  _EventName
                >
              }
            })
    : unknown) &
    (TWalletClient extends Client
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
             *   walletClient,
             * })
             * const gas = await contract.estimateGas.mint({
             *   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
             * })
             */
            estimateGas: {
              [_FunctionName in _WriteFunctionNames]: GetEstimateFunction<
                _Narrowable,
                TWalletClient['chain'],
                TWalletClient['account'],
                TAbi,
                _FunctionName
              >
            }
            /**
             * Executes a write function on a contract.
             *
             * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
             *
             * Internally, `write` uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
             *
             * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
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
             *   walletClient,
             * })
             * const hash = await contract.write.min([69420], {
             *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
             * })
             */
            write: {
              [_FunctionName in _WriteFunctionNames]: GetWriteFunction<
                _Narrowable,
                TWalletClient['chain'],
                TWalletClient['account'],
                TAbi,
                _FunctionName
              >
            }
          }
      : unknown)
> & { address: TAddress; abi: TAbi }

export type GetContractErrorType = ErrorType

/**
 * Gets type-safe interface for performing contract-related actions with a specific `abi` and `address`.
 *
 * - Docs https://viem.sh/docs/contract/getContract.html
 *
 * Using Contract Instances can make it easier to work with contracts if you don't want to pass the `abi` and `address` properites every time you perform contract actions, e.g. [`readContract`](https://viem.sh/docs/contract/readContract.html), [`writeContract`](https://viem.sh/docs/contract/writeContract.html), [`estimateContractGas`](https://viem.sh/docs/contract/estimateContractGas.html), etc.
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
 *   publicClient,
 * })
 */
export function getContract<
  TTransport extends Transport,
  TAddress extends Address,
  const TAbi extends Abi | readonly unknown[],
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TPublicClient extends Client<TTransport, TChain> | undefined =
    | Client<TTransport, TChain>
    | undefined,
  TWalletClient extends Client<TTransport, TChain, TAccount> | undefined =
    | Client<TTransport, TChain, TAccount>
    | undefined,
>({
  abi,
  address,
  publicClient,
  walletClient,
}: GetContractParameters<
  TTransport,
  TChain,
  TAccount,
  TAbi,
  TPublicClient,
  TWalletClient,
  TAddress
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress> {
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
                args?: readonly unknown[],
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
                ...options,
              } as unknown as WriteContractParameters<
                TAbi,
                typeof functionName,
                TChain,
                TAccount
              >)
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

  return contract as unknown as GetContractReturnType<
    TAbi,
    TPublicClient,
    TWalletClient,
    TAddress
  >
}

/**
 * @internal exporting for testing only
 */
export function getFunctionParameters(
  values: [args?: readonly unknown[], options?: object],
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
  TFunctionName extends string,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  Options = Prettify<
    UnionOmit<
      ReadContractParameters<TAbi, TFunctionName>,
      'abi' | 'address' | 'args' | 'functionName'
    >
  >,
> = Narrowable extends true
  ? (
      ...parameters: Args extends readonly []
        ? [options?: Options]
        : [args: Args, options?: Options]
    ) => Promise<ReadContractReturnType<TAbi, TFunctionName>>
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
  TFunctionName extends string,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  Options = Prettify<
    UnionOmit<
      EstimateContractGasParameters<TAbi, TFunctionName, TChain, TAccount>,
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
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
> = Narrowable extends true
  ? <
      TChainOverride extends Chain | undefined,
      Options extends Prettify<
        UnionOmit<
          SimulateContractParameters<
            TAbi,
            TFunctionName,
            TChain,
            TChainOverride
          >,
          'abi' | 'address' | 'args' | 'functionName'
        >
      >,
    >(
      ...parameters: Args extends readonly []
        ? [options?: Options]
        : [args: Args, options?: Options]
    ) => Promise<
      SimulateContractReturnType<TAbi, TFunctionName, TChain, TChainOverride>
    >
  : <
      TChainOverride extends Chain | undefined,
      Options extends Prettify<
        UnionOmit<
          SimulateContractParameters<
            TAbi,
            TFunctionName,
            TChain,
            TChainOverride
          >,
          'abi' | 'address' | 'args' | 'functionName'
        >
      >,
    >(
      ...parameters:
        | [options?: Options]
        | [args: readonly unknown[], options?: Options]
    ) => Promise<SimulateContractReturnType>

type GetWriteFunction<
  Narrowable extends boolean,
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
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
  TEventName extends string,
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
  TEventName extends string,
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
  TEventName extends string,
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
