import type {
  Abi,
  AbiEvent,
  Address,
  ExtractAbiEvent,
  ExtractAbiEventNames,
  ExtractAbiFunctionNames,
  Narrow,
} from 'abitype'
import type { PublicClient, Transport, WalletClient } from '../clients'
import type {
  Account,
  Chain,
  IsInferrableAbi,
  IsNever,
  IsUndefined,
  Prettify,
} from '../types'
import {
  WatchContractEventParameters,
  WatchContractEventReturnType,
  ReadContractParameters,
  ReadContractReturnType,
  CreateEventFilterParameters,
  CreateEventFilterReturnType,
  SimulateContractParameters,
  readContract,
  simulateContract,
  EstimateContractGasParameters,
  estimateContractGas,
  createContractEventFilter,
  CreateContractEventFilterParameters,
} from './public'
import {
  WriteContractParameters,
  WriteContractReturnType,
  writeContract,
} from './wallet'

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
  /** Public client */
  publicClient?: TPublicClient
  /** Wallet client */
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
  _Account extends Account | undefined = TWalletClient extends WalletClient
    ? TWalletClient['account']
    : undefined,
  _Chain extends Chain | undefined = TWalletClient extends WalletClient
    ? TWalletClient['chain']
    : undefined,
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
             */
            read: {
              [FunctionName in _ReadFunctionNames]: GetReadFunction<
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
               */
              estimateGas: {
                [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                  _Chain,
                  _Account,
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
               */
              simulate: {
                [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                  _Chain,
                  _Account,
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
               */
              createEventFilter: {
                [EventName in _EventNames]: GetEventFilter<
                  ExtractAbiEvent<TAbi extends Abi ? TAbi : Abi, EventName>
                >
              }
              /**
               * Watches and returns emitted contract event logs.
               *
               * This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent.html#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent.html#onLogs).
               *
               * `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter.html) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs.html) instead.
               */
              watchEvent: {
                [EventName in _EventNames]: GetWatchEvent<TAbi, EventName>
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
             * Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.
             */
            write: {
              [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                _Chain,
                _Account,
                TAbi,
                FunctionName
              >
            }
          }
      : unknown)
>

/**
 * Gets type-safe contract instance.
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
        {}, // TODO: Should we stick valid keys here with `() => {}` value?
        {
          get(_, functionName: string) {
            return (
              ...rest: [
                args?: readonly unknown[],
                params?: Omit<
                  ReadContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, params } = getFunctionArgsAndParams(rest)
              return readContract(publicClient, {
                abi: abi as Abi,
                address,
                functionName,
                args,
                ...params,
              })
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
              ...rest: [
                args?: readonly unknown[],
                params?: Omit<
                  EstimateContractGasParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, params } = getFunctionArgsAndParams(rest)
              return estimateContractGas(publicClient, {
                abi: abi as Abi,
                address,
                functionName,
                args,
                ...params,
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
              ...rest: [
                args?: readonly unknown[],
                params?: Omit<
                  SimulateContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, params } = getFunctionArgsAndParams(rest)
              return simulateContract(publicClient, {
                abi: abi as Abi,
                address,
                functionName,
                args,
                ...params,
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
              ...rest: [
                args?: object,
                params?: Omit<
                  CreateContractEventFilterParameters,
                  'abi' | 'address' | 'eventName' | 'args'
                >,
              ]
            ) => {
              const { args, params } = getEventArgsAndParams(rest)
              return createContractEventFilter(publicClient, {
                abi: abi as Abi,
                address,
                eventName,
                args,
                ...params,
              } as CreateContractEventFilterParameters)
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
              ...rest: [
                args?: readonly unknown[],
                params?: Omit<
                  WriteContractParameters,
                  'abi' | 'address' | 'functionName' | 'args'
                >,
              ]
            ) => {
              const { args, params } = getFunctionArgsAndParams(rest)
              return writeContract(walletClient, {
                abi: abi as Abi,
                address,
                functionName,
                args,
                ...params,
              } as WriteContractParameters<
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

function getFunctionArgsAndParams(
  rest: [args?: readonly unknown[], params?: object],
) {
  const hasArgs = rest.length && Array.isArray(rest[0])
  const args = hasArgs ? rest[0]! : []
  const params = (hasArgs ? rest[1] : rest[0]) ?? {}
  return { args, params }
}

function getEventArgsAndParams(rest: [args?: object, params?: object]) {
  const hasArgs = rest.length && Array.isArray(rest[0])
  const args = hasArgs ? rest[0]! : undefined
  const params = (hasArgs ? rest[1] : rest[0]) ?? {}
  return { args, params }
}

type GetReadFunction<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  _Parameters = Omit<
    ReadContractParameters<TAbi, TFunctionName>,
    'abi' | 'address' | 'functionName'
  >,
  _ReturnType = ReadContractReturnType<TAbi, TFunctionName>,
> = IsInferrableAbi<TAbi> extends true
  ? _Parameters extends { args: readonly unknown[] }
    ? (
        /** Arguments to pass contract method */
        args: _Parameters['args'],
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => Promise<_ReturnType>
    : (params?: Prettify<Omit<_Parameters, 'args'>>) => Promise<_ReturnType>
  : (
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on `getContract` `abi` for type inference.
       */
      args?: readonly unknown[],
      params?: Prettify<Omit<_Parameters, 'args'>>,
    ) => Promise<unknown>

type GetWriteFunction<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChainOverride extends Chain | undefined = Chain | undefined,
  _Parameters = Omit<
    WriteContractParameters<
      TAbi,
      TFunctionName,
      TChain,
      TAccount,
      TChainOverride
    >,
    'abi' | 'address' | 'functionName'
  >,
  _ReturnType = WriteContractReturnType,
  _Params extends unknown[] = [
    IsUndefined<TAccount>,
    IsUndefined<TChain>,
  ] extends [true, false] | [false, true]
    ? [params: Prettify<Omit<_Parameters, 'args'>>]
    : [params?: Prettify<Omit<_Parameters, 'args'>>],
> = IsInferrableAbi<TAbi> extends true
  ? _Parameters extends { args: readonly unknown[] }
    ? (
        /** Arguments to pass contract method */
        args: _Parameters['args'],
        ...rest: _Params
      ) => Promise<_ReturnType>
    : (...rest: _Params) => Promise<_ReturnType>
  : (
      /**
       * Arguments to pass contract method
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on `getContract` `abi` for type inference.
       */
      args?: readonly unknown[],
      ...rest: _Params
    ) => Promise<unknown>

type GetEventFilter<
  TAbiEvent extends AbiEvent,
  _Parameters = Omit<
    CreateEventFilterParameters<TAbiEvent>,
    'address' | 'event'
  >,
> = [
  TAbiEvent extends AbiEvent ? true : false,
  AbiEvent extends TAbiEvent ? true : false,
] extends [true, false]
  ? _Parameters extends { args?: object }
    ? (
        /** Arguments to pass event */
        args?: _Parameters['args'],
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => CreateEventFilterReturnType
    : (
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => CreateEventFilterReturnType
  : (
      /**
       * Arguments to pass event
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on `getContract` `abi` for type inference.
       */
      args?: object | undefined,
      params?: Prettify<Omit<_Parameters, 'args'>>,
    ) => CreateEventFilterReturnType

type GetWatchEvent<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
  _Parameters = Omit<
    WatchContractEventParameters<TAbi, TEventName>,
    'abi' | 'address' | 'eventName'
  >,
> = IsInferrableAbi<TAbi> extends true
  ? _Parameters extends { args?: object }
    ? (
        /** Arguments to pass event */
        args?: _Parameters['args'],
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => WatchContractEventReturnType
    : (
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => WatchContractEventReturnType
  : (
      /**
       * Arguments to pass event
       *
       * Use a [const assertion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) on `getContract` `abi` for type inference.
       */
      args?: object | undefined,
      params?: Prettify<Omit<_Parameters, 'args'>>,
    ) => WatchContractEventReturnType
