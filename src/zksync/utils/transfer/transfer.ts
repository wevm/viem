import { erc20Abi } from 'abitype/abis'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { encodeFunctionData } from '../../../utils/index.js'
import { getDefaultBridgeAddresses } from '../../../zksync/actions/getDefaultBridgeAddresses.js'
import { l2TokenAddress } from '../../../zksync/actions/l2TokenAddress.js'
import {
  ethAddressInContracts,
  l2BaseTokenAddress,
  legacyEthAddress,
} from '../../../zksync/constants/address.js'
import type { Overrides } from '../../../zksync/types/deposit.js'
import type { TransferTransaction } from '../../types/transfer.js'

export type GetTransferArgsTransactionParameters = TransferTransaction

export type GetTransferArgsTransactionReturnType = any

export async function getTransferArgs<TChainL2 extends Chain | undefined>(
  clientL2: Client<Transport, TChainL2, Account>,
  parameters: GetTransferArgsTransactionParameters,
): Promise<GetTransferArgsTransactionReturnType> {
  const bridges = await getDefaultBridgeAddresses(clientL2)

  if (!parameters.token) {
    parameters.token = l2BaseTokenAddress
  } else if (
    isAddressEqualLite(parameters.token, legacyEthAddress) ||
    isAddressEqualLite(parameters.token, ethAddressInContracts)
  ) {
    parameters.token = await l2TokenAddress(clientL2, {
      sharedL2: bridges.sharedL2,
      token: ethAddressInContracts,
    })
  }

  parameters.overrides ??= {} as Overrides
  parameters.overrides!.from = clientL2.account.address

  if (isAddressEqualLite(parameters.token!, l2BaseTokenAddress)) {
    if (parameters.paymasterParams) {
      return {
        ...parameters.overrides,
        to: parameters.to,
        value: parameters.amount,
        paymaster: parameters.paymasterParams.paymaster,
        paymasterInput: parameters.paymasterParams.paymasterInput,
        account: clientL2.account,
      }
    }
    return {
      ...parameters.overrides,
      to: parameters.to,
      value: parameters.amount,
      account: clientL2.account,
    }
  }
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [parameters.to, parameters.amount],
  })
  if (parameters.paymasterParams) {
    return {
      ...parameters.overrides,
      to: parameters.to,
      value: parameters.amount,
      paymaster: parameters.paymasterParams.paymaster,
      paymasterInput: parameters.paymasterParams.paymasterInput,
      account: clientL2.account,
    }
  }
  return {
    from: clientL2.account.address,
    to: parameters.token,
    data,
    account: clientL2.account,
  }
}
