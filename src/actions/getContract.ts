import type {
  Abi,
  Address,
  ExtractAbiEventNames,
  ExtractAbiFunctionNames,
  Narrow,
} from 'abitype'
import { wagmiMintExampleAbi } from 'abitype/test'
import type { Chain, IsInferrableAbi, IsNever, Prettify } from '../types'
import type { PublicClient, WalletClient } from '../clients'
import { publicClient, walletClient } from '../_test'
import type { WriteContractParameters, WriteContractReturnType } from './wallet'
import type {
  WatchContractEventParameters,
  WatchContractEventReturnType,
  ReadContractParameters,
  ReadContractReturnType,
} from './public'

export type GetContractParameters<
  TAbi extends Abi | readonly unknown[],
  TPublicClient extends PublicClient<any, any> | unknown = unknown,
  TWalletClient extends WalletClient<any, any> | unknown = unknown,
> = {
  /** Contract ABI */
  abi: Narrow<TAbi>
  /** Contract address */
  address: Address
  /** Public client */
  publicClient?: TPublicClient
  /** Public client */
  walletClient?: TWalletClient
}

export type GetContractReturnType<
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain = Chain,
  TPublicClient extends PublicClient<any, any> | unknown = unknown,
  TWalletClient extends WalletClient<any, any> | unknown = unknown,
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
> = Prettify<
  (TPublicClient extends PublicClient<any, any>
    ? (IsNever<_ReadFunctionNames> extends true
        ? unknown
        : {
            /**
             * Calls a read-only function on a contract, and returns the response.
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
              estimateGas: {
                [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                  TAbi,
                  TChain,
                  FunctionName
                >
              }
              simulate: {
                [FunctionName in _WriteFunctionNames]: GetWriteFunction<
                  TAbi,
                  TChain,
                  FunctionName
                >
              }
            }) &
        (IsNever<_EventNames> extends true
          ? unknown
          : {
              watchEvent: {
                [EventName in _EventNames]: GetEvent<TAbi, EventName>
              }
            })
    : unknown) &
    (TWalletClient extends WalletClient<any, any>
      ? {
          write: {
            [FunctionName in _WriteFunctionNames]: GetWriteFunction<
              TAbi,
              TChain,
              FunctionName
            >
          }
        }
      : unknown)
>

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
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain = Chain,
  TFunctionName extends string = string,
  _Parameters = Omit<
    WriteContractParameters<TChain, TAbi, TFunctionName>,
    'abi' | 'address' | 'functionName'
  >,
  _ReturnType = WriteContractReturnType,
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

type GetEvent<
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

export declare function getContract<
  TAbi extends Abi | readonly unknown[],
  TChain extends Chain,
  TPublicClient extends PublicClient<any, any> | unknown,
  TWalletClient extends WalletClient<any, any> | unknown,
>({
  abi,
  address,
  publicClient,
  walletClient,
}: GetContractParameters<
  TAbi,
  TPublicClient,
  TWalletClient
>): GetContractReturnType<TAbi, TChain, TPublicClient, TWalletClient>

const abi = wagmiMintExampleAbi
const contract = getContract({
  abi,
  // abi: [
  //   {
  //     inputs: [],
  //     name: 'mint',
  //     outputs: [],
  //     stateMutability: 'nonpayable',
  //     type: 'function',
  //   },
  // ],
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  publicClient,
  walletClient,
})
contract.write.safeTransferFrom(['0x', '0x', 1n])
contract.read.totalSupply({ blockNumber: 1n })
contract.read.balanceOf(['0x'], { blockNumber: 1n })
contract.simulate.safeTransferFrom(['0x', '0x', 1n])
contract.estimateGas.safeTransferFrom(['0x', '0x', 1n])
contract.watchEvent.Transfer({
  args: {
    from: '0x',
    to: '0x',
  },
  onLogs: () => {},
})

// TODO
// - Payable turn on/off `value`
// - Overloads
// - TSDoc
// - Prettify types
// - Fix up contract event `args`
// - Abi not inferrable
