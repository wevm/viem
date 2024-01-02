import type { Abi } from 'abitype'

import type { Account } from '../../../accounts/types.js'
import type {
  WriteContractParameters,
  WriteContractReturnType,
} from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../../types/contract.js'
import {
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { getAction } from '../../../utils/getAction.js'
import type { ChainEIP712 } from '../types.js'
import { sendTransaction } from './sendTransaction.js'

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
 * @param parameters - {@link WriteEip712ContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteEip712ContractReturnType}
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
 * const hash = await writeEip712Contract(client, {
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
 * import { writeEip712Contract } from 'viem/chains/zksync'
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
 * const hash = await writeEip712Contract(client, request)
 */
export async function writeContract<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  const TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<TAbi, 'pure' | 'view', TFunctionName>,
  TChainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  parameters: WriteContractParameters<
    TAbi,
    TFunctionName,
    args,
    TChain,
    TAccount,
    TChainOverride
  >,
): Promise<WriteContractReturnType> {
  const { abi, address, args, dataSuffix, functionName, ...request } =
    parameters as WriteContractParameters
  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters)

  return await getAction(
    client,
    sendTransaction,
    'sendTransaction',
  )({
    data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
    to: address,
    ...request,
  })
}
