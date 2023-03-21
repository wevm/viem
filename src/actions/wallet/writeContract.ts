import type { Abi } from 'abitype'

import type { WalletClientArg, Transport } from '../../clients'
import type {
  Account,
  Chain,
  ContractConfig,
  GetChain,
  GetValue,
} from '../../types'
import { encodeFunctionData, EncodeFunctionDataParameters } from '../../utils'
import {
  sendTransaction,
  SendTransactionParameters,
  SendTransactionReturnType,
} from './sendTransaction'

export type WriteContractParameters<
  TChain extends Chain | undefined = Chain,
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TAccount extends Account | undefined = undefined,
  TChainOverride extends Chain | undefined = TChain,
> = Omit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'chain' | 'to' | 'data' | 'value'
> & {
  value?: GetValue<
    TAbi,
    TFunctionName,
    SendTransactionParameters<TChain>['value']
  >
} & GetChain<TChain, TChainOverride> &
  ContractConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'>

export type WriteContractReturnType = SendTransactionReturnType

/**
 * Executes a write function on a contract.
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
 *
 * Internally, `writeContract` uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 *
 * Warning: The `writeContract` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `simulateContract`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.
 */
export async function writeContract<
  TChain extends Chain | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = TChain,
>(
  client: WalletClientArg<Transport, TChain, TAccount>,
  {
    abi,
    address,
    args,
    functionName,
    ...request
  }: WriteContractParameters<
    TChain,
    TAbi,
    TFunctionName,
    TAccount,
    TChainOverride
  >,
): Promise<WriteContractReturnType> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)
  const hash = await sendTransaction(client, {
    data,
    to: address,
    ...request,
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
  return hash
}
