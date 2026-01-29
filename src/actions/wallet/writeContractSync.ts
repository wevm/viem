import type { Abi } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type {
  ContractFunctionArgs,
  ContractFunctionName,
} from '../../types/contract.js'
import {
  type SendTransactionSyncParameters,
  type SendTransactionSyncReturnType,
  sendTransactionSync,
} from './sendTransactionSync.js'
import { type WriteContractParameters, writeContract } from './writeContract.js'

export type { WriteContractErrorType as WriteContractSyncErrorType } from './writeContract.js'

export type WriteContractSyncParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<
    abi,
    'nonpayable' | 'payable'
  > = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  > = ContractFunctionArgs<abi, 'nonpayable' | 'payable', functionName>,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = WriteContractParameters<
  abi,
  functionName,
  args,
  chain,
  account,
  chainOverride
> &
  Pick<
    SendTransactionSyncParameters<chain>,
    'pollingInterval' | 'throwOnReceiptRevert' | 'timeout'
  >

export type WriteContractSyncReturnType<
  chain extends Chain | undefined = Chain | undefined,
> = SendTransactionSyncReturnType<chain>

/**
 * Executes a write function on a contract synchronously.
 * Returns the transaction receipt.
 *
 * - Docs: https://viem.sh/docs/contract/writeContractSync
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const receipt = await writeContractSync(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * })
 */
export async function writeContractSync<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: WriteContractSyncParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
): Promise<WriteContractSyncReturnType<chain>> {
  return writeContract.internal(
    client,
    sendTransactionSync,
    'sendTransactionSync',
    parameters as never,
  ) as never
}
