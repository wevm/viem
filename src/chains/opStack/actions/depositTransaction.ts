import type { Address } from 'abitype'
import {
  type WriteContractParameters,
  writeContract,
} from '../../../actions/wallet/writeContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account } from '../../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { ContractFunctionArgs } from '../../../types/contract.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { portalAbi } from '../abis.js'
import type { GetContractAddressParameter } from '../types/contract.js'

export type DepositTransactionParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = Pick<
  WriteContractParameters<
    typeof portalAbi,
    'depositTransaction',
    ContractFunctionArgs<
      typeof portalAbi,
      'nonpayable' | 'payable',
      'depositTransaction'
    >,
    chain,
    account,
    chainOverride
  >,
  'account' | 'dataSuffix' | 'nonce'
> &
  GetChainParameter<chain, chainOverride> &
  GetContractAddressParameter<_derivedChain, 'portal'> & {
    data?: Hex
    isCreation?: boolean
    gas: bigint
    to?: Address
    value?: bigint
  }
export type DepositTransactionReturnType = Hash
export type DepositTransactionErrorType = ErrorType

export function depositTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: DepositTransactionParameters<chain, account, chainOverride>,
) {
  const {
    account,
    chain = client.chain,
    data = '0x',
    dataSuffix = '0x',
    gas,
    isCreation = false,
    nonce,
    targetChain,
    to = '0x',
    value = 0n,
  } = args

  const portalAddress = (() => {
    if (args.portalAddress) return args.portalAddress
    if (chain) return targetChain!.contracts.portal[chain.id].address
    return Object.values(targetChain!.contracts.portal)[0].address
  })()

  return writeContract(client, {
    account,
    abi: portalAbi,
    address: portalAddress,
    chain,
    functionName: 'depositTransaction',
    args: [
      to,
      value,
      gas,
      isCreation,
      `${data}${dataSuffix.replace('0x', '')}`,
    ],
    nonce,
  } as any)
}
