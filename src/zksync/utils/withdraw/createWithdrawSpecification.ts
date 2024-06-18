import type { Address } from 'abitype'
import type { Chain } from '../../../types/chain.js'
import type { WithdrawTransaction } from '../../../zksync/types/withdraw.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import { getBaseTokenL1Address } from '../../actions/getBaseTokenL1Address.js'
import {
  type GetDefaultBridgeAddressesReturnType,
  getDefaultBridgeAddresses,
} from '../../actions/getDefaultBridgeAddresses.js'
import { isBaseToken } from '../deposit/isBaseToken.js'
import { getIsEthBasedChain } from '../isEthBasedChain.js'

export type CreateWithdrawSpecificationParameters = WithdrawTransaction

export type CreateWithdrawSpecificationReturnType = WithdrawTransaction & {
  isEthBasedChain: boolean
  bridgeAddresses: GetDefaultBridgeAddressesReturnType
  baseTokenAddress: Address
  isBaseToken: boolean
}

export async function createWithdrawSpecification<
  TChain extends Chain | undefined,
>(
  clientL2: Client<Transport, TChain, Account>,
  parameters: CreateWithdrawSpecificationParameters,
): Promise<CreateWithdrawSpecificationReturnType> {
  const { ...tx } = parameters

  if (tx.to === null || tx.to === undefined) {
    throw new Error('Withdrawal target address is undefined!')
  }

  if (!tx.from) tx.from = tx.to

  const isEthBasedChain = await getIsEthBasedChain(clientL2)
  const bridgeAddresses = await getDefaultBridgeAddresses(clientL2)
  const baseTokenAddress = await getBaseTokenL1Address(clientL2)
  const isBaseTokenResult = await isBaseToken(clientL2, { token: tx.token })

  return {
    ...tx,
    isEthBasedChain,
    bridgeAddresses,
    baseTokenAddress,
    isBaseToken: isBaseTokenResult,
  }
}
