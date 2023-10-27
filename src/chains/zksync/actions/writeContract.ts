import type { Abi } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { GetAccountParameter } from '../../../types/account.js'
import type { GetChain } from '../../../types/chain.js'
import type {
  ContractFunctionConfig,
  GetValue,
} from '../../../types/contract.js'
import type { Hex } from '../../../types/misc.js'
import type { UnionOmit } from '../../../types/utils.js'
import {
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import type { FormattedTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import type { ChainEIP712 } from '../types.js'
import {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'

export type WriteContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TFunctionName extends string = string,
  TChain extends ChainEIP712 | undefined = ChainEIP712,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = ContractFunctionConfig<TAbi, TFunctionName, 'payable' | 'nonpayable'> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride> &
  UnionOmit<
    FormattedTransactionRequest<
      TChainOverride extends ChainEIP712 ? TChainOverride : TChain
    >,
    'from' | 'to' | 'data' | 'value'
  > &
  GetValue<
    TAbi,
    TFunctionName,
    SendTransactionParameters<
      TChain,
      TAccount,
      TChainOverride
    > extends SendTransactionParameters
      ? SendTransactionParameters<TChain, TAccount, TChainOverride>['value']
      : SendTransactionParameters['value']
  > & {
    /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
    dataSuffix?: Hex
  }

export type WriteContractReturnType = SendTransactionReturnType

export type WriteContractErrorType =
  | EncodeFunctionDataErrorType
  | SendTransactionErrorType
  | ErrorType

/**
 * Executes a write function on a contract.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/writeEip712Contract.html
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendEip712Transaction` action](https://viem.sh/docs/zksync/actions/sendEip712Transaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { writeContract } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await writeContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * })
 *
 * @example
 * // With Validation
 * import { createWalletClient, http, parseAbi } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { simulateContract } from 'viem/contract'
 * import { writeContract } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: http(),
 * })
 * const { request } = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * }
 * const hash = await writeContract(client, request)
 */
export async function writeContract<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  {
    abi,
    address,
    args,
    dataSuffix,
    functionName,
    ...request
  }: WriteContractParameters<
    TAbi,
    TFunctionName,
    TChain,
    TAccount,
    TChainOverride
  >,
): Promise<WriteContractReturnType> {
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>)

  // Cannot send sendTransaction if it is a transaction type 0x71 (EIP712).
  // We can change how it behaves here on inside the sendTransaction, since
  // if the account type is 'local' it will use `sendRawTransaction`.

  const hash = await getAction(
    client,
    sendTransaction,
  )({
    data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
    to: address,
    ...request,
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
  return hash
}
