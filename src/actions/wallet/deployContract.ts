import type { Abi } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { GetChain } from '../../types/chain.js'
import type { GetConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { UnionOmit } from '../../types/utils.js'
import { encodeDeployData } from '../../utils/abi/encodeDeployData.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'

export type DeployContractParameters<
  TAbi extends Abi | readonly unknown[] = Abi,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = UnionOmit<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  'accessList' | 'chain' | 'to' | 'data'
> & {
  abi: TAbi
  bytecode: Hex
} & GetChain<TChain, TChainOverride> &
  GetConstructorArgs<TAbi>

export type DeployContractReturnType = SendTransactionReturnType

export type DeployContractErrorType = SendTransactionErrorType | ErrorType

/**
 * Deploys a contract to the network, given bytecode and constructor arguments.
 *
 * - Docs: https://viem.sh/docs/contract/deployContract.html
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts/deploying-contracts
 *
 * @param client - Client to use
 * @param parameters - {@link DeployContractParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link DeployContractReturnType}
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
  const TAbi extends Abi | readonly unknown[],
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  walletClient: Client<Transport, TChain, TAccount>,
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
