import type { Address } from 'abitype'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import { isAddressEqualLite } from '../../../utils/address/isAddressEqualLite.js'
import { encodeFunctionData } from '../../../utils/index.js'
import {
  ethAddressInContracts,
  l2BaseTokenAddress,
  legacyEthAddress,
} from '../../../zksync/constants/address.js'
import { ethToken, l2BridgeAbi } from '../../constants/abis.js'
import type { Overrides } from '../../types/deposit.js'
import { isEth } from '../isEth.js'
import { getL2TokenAddress } from '../l2TokenAddress.js'
import type { CreateWithdrawSpecificationReturnType } from './createWithdrawSpecification.js'

export type GetWithdrawparametersArgsParameters =
  CreateWithdrawSpecificationReturnType

export type GetWithdrawparametersArgsReturnType = {
  from: Address
  to: Address
  data: Hex
  value?: bigint
  paymaster?: Address
  paymasterInput?: Hex
  account?: Account | undefined
}

export async function getWithdrawArgs<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  clientL1: Client<Transport, TChain, TAccount>,
  parameters: GetWithdrawparametersArgsParameters,
): Promise<GetWithdrawparametersArgsReturnType> {
  if (
    isAddressEqualLite(parameters.token, legacyEthAddress) ||
    isAddressEqualLite(parameters.token, ethAddressInContracts)
  ) {
    parameters.token = await getL2TokenAddress(clientL1, {
      token: ethAddressInContracts,
      sharedL2: parameters.bridgeAddresses.sharedL2,
      baseTokenAddress: parameters.baseTokenAddress,
    })
  } else if (parameters.isBaseToken) {
    parameters.token = l2BaseTokenAddress
  }

  const encodeAddress = parameters.to ?? parameters.from

  parameters.to ??= parameters.from!
  parameters.overrides ??= {} as Overrides
  parameters.overrides.from ??= parameters.from!

  if (isEth(parameters.token)) {
    if (!parameters.overrides.value) {
      parameters.overrides.value = parameters.amount as bigint
    }
    const passedValue = parameters.overrides.value

    if (passedValue !== parameters.amount) {
      // To avoid users shooting themselves into the foot, we will always use the amount to withdraw
      // as the value

      throw new Error(
        'The parameters.value is not equal to the value withdrawn!',
      )
    }

    const data = encodeFunctionData({
      abi: ethToken,
      functionName: 'withdraw',
      args: [encodeAddress as Address],
    })

    const populatedParameters = {
      from: parameters.from!,
      to: l2BaseTokenAddress,
      data: data,
      value: parameters.amount,
    }
    if (parameters.paymasterParams) {
      return {
        ...populatedParameters,
        paymaster: parameters.paymasterParams.paymaster,
        paymasterInput: parameters.paymasterParams.paymasterInput,
        account: clientL1.account,
      }
    }

    return populatedParameters
  }

  if (!parameters.bridgeAddress) {
    parameters.bridgeAddress = parameters.bridgeAddresses.sharedL2
  }

  const data = encodeFunctionData({
    abi: l2BridgeAbi,
    functionName: 'withdraw',
    args: [encodeAddress as Address, parameters.token, parameters.amount],
  })

  const populatedParameters = {
    from: parameters.from!,
    to: parameters.bridgeAddress!,
    data: data,
  }

  if (parameters.paymasterParams) {
    return {
      ...populatedParameters,
      paymaster: parameters.paymasterParams.paymaster,
      paymasterInput: parameters.paymasterParams.paymasterInput,
      account: clientL1.account,
    }
  }

  return populatedParameters
}
