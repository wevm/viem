import type {
  Abi,
  Address,
  ExtractAbiEventNames,
  ExtractAbiFunctionNames,
  Narrow,
} from 'abitype'
import type { PublicClientArg, WalletClientArg } from '../clients'
import type {
  Account,
  Chain,
  IsInferrableAbi,
  IsNever,
  IsUndefined,
  Prettify,
} from '../types'
import type {
  WatchContractEventParameters,
  WatchContractEventReturnType,
  ReadContractParameters,
  ReadContractReturnType,
} from './public'
import type { WriteContractParameters, WriteContractReturnType } from './wallet'

// TODO
// - `account` and `chain`
// - createEventFilter
// - turn on/off `value`

export type GetContractParameters<
  TAbi extends Abi | readonly unknown[],
  TPublicClient extends PublicClientArg | unknown = unknown,
  TWalletClient extends WalletClientArg | unknown = unknown,
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
  TPublicClient extends PublicClientArg | unknown = unknown,
  TWalletClient extends WalletClientArg | unknown = unknown,
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
  _Account extends Account | undefined = TWalletClient extends WalletClientArg
    ? TWalletClient['account']
    : undefined,
  _Chain extends Chain | undefined = TWalletClient extends WalletClientArg
    ? TWalletClient['chain']
    : undefined,
> = Prettify<
  (TPublicClient extends PublicClientArg
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
                  TAbi,
                  FunctionName,
                  _Account
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
                  TAbi,
                  FunctionName,
                  _Account
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
                [EventName in _EventNames]: unknown // GetEventFilter<TAbi, EventName>
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
    (TWalletClient extends WalletClientArg
      ? {
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
              TAbi,
              FunctionName,
              _Account
            >
          }
        }
      : unknown)
>

export declare function getContract<
  TAbi extends Abi | readonly unknown[],
  TPublicClient extends PublicClientArg | unknown,
  TWalletClient extends WalletClientArg | unknown,
>({
  abi,
  address,
  publicClient,
  walletClient,
}: GetContractParameters<
  TAbi,
  TPublicClient,
  TWalletClient
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient>

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
        args: _Parameters['args'],
        params?: Prettify<Omit<_Parameters, 'args'>>,
      ) => Promise<_ReturnType>
    : (params?: Prettify<Omit<_Parameters, 'args'>>) => Promise<_ReturnType>
  : (
      args: readonly unknown[],
      params?: Prettify<Omit<_Parameters, 'args'>>,
    ) => Promise<unknown>

type GetWriteFunction<
  TChain extends Chain | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = TChain,
  _Parameters = Omit<
    WriteContractParameters<
      TChain,
      TAbi,
      TFunctionName,
      TAccount,
      TChainOverride
    >,
    'abi' | 'address' | 'functionName'
  >,
  _ReturnType = WriteContractReturnType,
  _Params extends unknown[] = [IsUndefined<TAccount>, IsNever<TChain>] extends
    | [true, false]
    | [false, true]
    ? [params: Prettify<Omit<_Parameters, 'args'>>]
    : [params?: Prettify<Omit<_Parameters, 'args'>>],
> = IsInferrableAbi<TAbi> extends true
  ? _Parameters extends { args: readonly unknown[] }
    ? (args: _Parameters['args'], ...rest: _Params) => Promise<_ReturnType>
    : (...rest: _Params) => Promise<_ReturnType>
  : (args: readonly unknown[], ...rest: _Params) => Promise<unknown>

// type GetEventFilter<
//   TAbi extends Abi | readonly unknown[] = readonly unknown[],
//   TEventName extends string = string,
//   _Parameters = Omit<
//     CreateEventFilterParameters<TAbi, TEventName>,
//     'abi' | 'address' | 'eventName'
//   >,
// > = IsInferrableAbi<TAbi> extends true
//   ? (params?: Prettify<_Parameters>) => CreateEventFilterReturnType
//   : (
//       args: object | undefined,
//       params?: Prettify<Omit<_Parameters, 'args'>>,
//     ) => CreateEventFilterReturnType

type GetWatchEvent<
  TAbi extends Abi | readonly unknown[] = readonly unknown[],
  TEventName extends string = string,
  _Parameters = Omit<
    WatchContractEventParameters<TAbi, TEventName>,
    'abi' | 'address' | 'eventName'
  >,
> = IsInferrableAbi<TAbi> extends true
  ? (params?: Prettify<_Parameters>) => WatchContractEventReturnType
  : (
      args: object | undefined,
      params?: Prettify<Omit<_Parameters, 'args'>>,
    ) => WatchContractEventReturnType
