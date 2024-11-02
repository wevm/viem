import type { Abi } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { GetChainParameter } from '../../types/chain.js'
import type { ContractConstructorArgs } from '../../types/contract.js'
import type { Hex } from '../../types/misc.js'
import type { UnionEvaluate, UnionOmit } from '../../types/utils.js'
import { encodeDeployData } from '../../utils/abi/encodeDeployData.js'

import type { ErrorType } from '../../errors/utils.js'
import {
  type SendTransactionErrorType,
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'

export type DeployContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  allArgs = ContractConstructorArgs<abi>,
> = UnionOmit<
  SendTransactionParameters<chain, account, chainOverride>,
  'accessList' | 'chain' | 'to' | 'data'
> &
  GetChainParameter<chain, chainOverride> &
  UnionEvaluate<
    readonly [] extends allArgs
      ? { args?: allArgs | undefined }
      : { args: allArgs }
  > & {
    abi: abi
    bytecode: Hex
  }

export type DeployContractReturnType = SendTransactionReturnType

export type DeployContractErrorType = SendTransactionErrorType | ErrorType

/**
 * Deploys a contract to the network, given bytecode and constructor arguments.
 *
 * - Docs: https://viem.sh/docs/contract/deployContract
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts
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
  const abi extends Abi | readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  walletClient: Client<Transport, chain, account>,
  parameters: DeployContractParameters<abi, chain, account, chainOverride>,
): Promise<DeployContractReturnType> {
  const { abi, args, bytecode, ...request } =
    parameters as DeployContractParameters
  const calldata = encodeDeployData({ abi, args, bytecode })
  return sendTransaction(walletClient, {
    ...request,
    data: calldata,
  } as unknown as SendTransactionParameters<chain, account, chainOverride>)
}
