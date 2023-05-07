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
  Narrow,
} from 'abitype'

import type { Account } from '../accounts/types.js'
import type { PublicClient } from '../clients/createPublicClient.js'
import type { WalletClient } from '../clients/createWalletClient.js'
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
} from '../types/utils.js'

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
  TPublicClient extends PublicClient<TTransport, TChain> | unknown = unknown,
  TWalletClient extends
    | WalletClient<TTransport, TChain, TAccount>
    | unknown = unknown,
> = {
  /** Contract ABI */
  abi: Narrow<TAbi>
  /** Contract address */
  address: Address
  /**
   * Public client
   *
   * If you pass in a [`publicClient`](https://viem.sh/docs/clients/public.html), the following methods are available:
   *
   * - [`createEventFilter`](https://viem.sh/docs/contract/createContractEventFilter.html)
   * - [`estimateGas`](https://viem.sh/docs/contract/estimateContractGas.html)
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
   * - [`write`](https://viem.sh/docs/contract/writeContract.html)
   */
  walletClient?: TWalletClient
}

export type GetContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TPublicClient extends PublicClient | unknown = unknown,
  TWalletClient extends WalletClient | unknown = unknown,
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
  (TPublicClient extends PublicClient
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
              [FunctionName in _ReadFunctionNames]: GetReadFunction<
                _Narrowable,
                TAbi,
                FunctionName
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
               * const client = createPublicClient({
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
                [FunctionName in _WriteFunctionNames]: GetEstimateFunction<
                  _Narrowable,
                  TPublicClient extends PublicClient
                    ? TPublicClient['chain']
                    : undefined,
                  TAbi,
                  FunctionName
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
               * const client = createPublicClient({
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
                [FunctionName in _WriteFunctionNames]: GetSimulateFunction<
                  _Narrowable,
                  TPublicClient extends PublicClient
                    ? TPublicClient['chain']
                    : undefined,
                  TAbi,
                  FunctionName
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
               * const client = createPublicClient({
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
                [EventName in _EventNames]: GetEventFilter<
                  _Narrowable,
                  TAbi,
                  EventName
                >
              }
              /**
               * Watches and returns emitted contract event logs.
               *
               * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
               *
               * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter.html) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs.html) instead.
               *
               * @example
               * import { createPublicClient, getContract, http, parseAbi } from 'viem'
               * import { mainnet } from 'viem/chains'
               *
               * const client = createPublicClient({
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
                [EventName in _EventNames]: GetWatchEvent<
                  _Narrowable,
                  TAbi,
                  EventName
                >
              }
            })
    : unknown) &
    (TWalletClient extends WalletClient
      ? IsNever<_WriteFunctionNames> extends true
        ? unknown
        : {
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
             * const client = createWalletClient({
             *   chain: mainnet,
             *   transport: http(),
             * })
             * const contract = getContract({
             *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
             *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
             *   publicClient,
             * })
             * const hash = await contract.write.min([69420], {
             *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
             * })
             */
            write: {
              [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                _Narrowable,
                TWalletClient extends WalletClient
                  ? TWalletClient['chain']
                  : undefined,
                TWalletClient extends WalletClient
                  ? TWalletClient['account']
                  : undefined,
                TAbi,
                FunctionName
              >
            }
          }
      : unknown)
>

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
  TAbi extends Abi | readonly unknown[],
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TPublicClient extends PublicClient<TTransport, TChain> | undefined =
    | PublicClient<TTransport, TChain>
    | undefined,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount> | undefined =
    | WalletClient<TTransport, TChain, TAccount>
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
  TWalletClient
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient> {
  const hasPublicClient = publicClient !== undefined && publicClient !== null
  const hasWalletClient = walletClient !== undefined && walletClient !== null

  const contract: {
    [_ in
      | 'createEventFilter'
      | 'estimateGas'
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
                options?: Omit<
                  ReadContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return readContract(publicClient, {
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

    if (hasWriteFunction) {
      contract.estimateGas = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[],
                options?: Omit<
                  EstimateContractGasParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return estimateContractGas(publicClient, {
                abi,
                address,
                functionName,
                args,
                ...options,
              } as EstimateContractGasParameters)
            }
          },
        },
      )
      contract.simulate = new Proxy(
        {},
        {
          get(_, functionName: string) {
            return (
              ...parameters: [
                args?: readonly unknown[],
                options?: Omit<
                  SimulateContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return simulateContract(publicClient, {
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
    }

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
              return createContractEventFilter(publicClient, {
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
              return watchContractEvent(publicClient, {
                abi,
                address,
                eventName,
                args,
                ...options,
              } as WatchContractEventParameters)
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
                options?: Omit<
                  WriteContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, options } = getFunctionParameters(parameters)
              return writeContract(walletClient, {
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

  return contract as unknown as GetContractReturnType<
    TAbi,
    TPublicClient,
    TWalletClient
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
    Omit<
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
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAbiFunction extends AbiFunction = TAbi extends Abi
    ? ExtractAbiFunction<TAbi, TFunctionName>
    : AbiFunction,
  Args = AbiParametersToPrimitiveTypes<TAbiFunction['inputs']>,
  Options = Prettify<
    Omit<
      EstimateContractGasParameters<TAbi, TFunctionName, TChain>,
      'abi' | 'address' | 'args' | 'functionName'
    >
  >,
> = Narrowable extends true
  ? (
      ...parameters: Args extends readonly []
        ? [options?: Options]
        : [args: Args, options?: Options]
    ) => Promise<EstimateContractGasReturnType>
  : (
      ...parameters:
        | [options?: Options]
        | [args: readonly unknown[], options?: Options]
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
        Omit<
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
        Omit<
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
        Omit<
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
      Rest extends IsOptionsRequired extends true
        ? [options: Options]
        : [options?: Options],
    >(
      ...parameters: Args extends readonly []
        ? Rest
        : [args: Args, ...parameters: Rest]
    ) => Promise<WriteContractReturnType>
  : <
      TChainOverride extends Chain | undefined,
      Options extends Prettify<
        Omit<
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
      'abi' | 'address' | 'args' | 'eventName'
    >
  >,
  IndexedInputs = Extract<TAbiEvent['inputs'][number], { indexed: true }>,
> = Narrowable extends true
  ? <TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined>(
      ...parameters: IsNever<IndexedInputs> extends true
        ? [options?: Options]
        : [
            args: Args | (Args extends Narrow<TArgs> ? Narrow<TArgs> : never),
            options?: Options,
          ]
    ) => Promise<CreateContractEventFilterReturnType<TAbi, TEventName, TArgs>>
  : (
      ...parameters:
        | [options?: Options]
        | [
            args: readonly unknown[] | CreateContractFilterOptions,
            options?: Options,
          ]
    ) => Promise<CreateContractEventFilterReturnType>

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
