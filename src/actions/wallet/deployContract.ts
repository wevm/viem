import type { Abi, Narrow } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { WalletClient } from '../../clients/createWalletClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain, GetChain } from '../../types/chain.js'
import type { GetConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import { encodeDeployData } from '../../utils/abi/encodeDeployData.js'

import {
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'

export type DeployContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
> = Omit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'accessList' | 'chain' | 'to' | 'data' | 'value'
> & {
  abi: Narrow<TAbi>
  bytecode: Hex
} & GetChain<TChain, TChainOverride> &
  GetConstructorArgs<TAbi>

export type DeployContractReturnType = SendTransactionReturnType

/**
 * Deploys a contract to the network, given bytecode and constructor arguments.
 *
 * - Docs: https://viem.sh/docs/contract/deployContract.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/deploying-contracts
 *
 * @param client - Client to use
 * @param parameters - {@link DeployContractParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link DeployContractReturnType}
 *
 * @example
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { deployContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await deployContract(client, {
 *   abi: [],
 *   account: '0x…,
 *   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
 * })
 */
export function deployContract<
  TAbi extends Abi | readonly unknown[],
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined,
>(
  walletClient: WalletClient<Transport, TChain, TAccount>,
  {
    abi,
    args,
    bytecode,
    ...request
  }: DeployContractParameters<TAbi, TChain, TAccount, TChainOverride>,
): Promise<DeployContractReturnType> {
  const calldata = encodeDeployData({
    abi,
    args,
    bytecode,
  } as unknown as DeployContractParameters<
    TAbi,
    TChain,
    TAccount,
    TChainOverride
  >)
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>)
}
