import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { isAddressEqualLite } from '../../utils/address/isAddressEqualLite.js'
import { encodeFunctionData } from '../../utils/index.js'
import { getBaseToken } from '../actions/getBaseToken.js'
import { bridgehubAbi } from '../constants/abis.js'
import {
  ETH_ADDRESS_IN_CONTRACTS,
  REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
} from '../constants/number.js'
import { checkBaseCost } from './checkBaseCost.js'
import { getBaseCost } from './getBaseCost.js'
import type { DepositETHOnETHBasedChainTxReturnType } from './getDepositETHOnETHBasedChainTx.js'

export type ConstructSendParametersRequestExecuteParameters = Omit<
  DepositETHOnETHBasedChainTxReturnType,
  'eRC20DefaultBridgeData'
> & {
  l2Value: bigint
}

export type ConstructSendParametersRequestExecuteParametersReturnType = {
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  value: bigint
  to: Address
  data: Hex
}

export async function constructRequestL2TransactionDirectParameters<
  TChain extends Chain | undefined,
>(
  clientL1: Client<Transport, TChain, Account>,
  parameters: ConstructSendParametersRequestExecuteParameters,
): Promise<ConstructSendParametersRequestExecuteParametersReturnType> {
  const isETHBaseToken = isAddressEqualLite(
    await getBaseToken(clientL1, {
      bridgehubContractAddress: parameters.bridgehubContractAddress,
      l2ChainId: parameters.l2ChainId,
    }),
    ETH_ADDRESS_IN_CONTRACTS,
  )
  const baseCost = await getBaseCost(clientL1, parameters)

  const l2Costs =
    baseCost + BigInt(parameters.operatorTip || 0n) + BigInt(parameters.l2Value)
  let providedValue = isETHBaseToken
    ? parameters.overrides!.value
    : parameters.mintValue
  if (
    providedValue === undefined ||
    providedValue === null ||
    BigInt(providedValue) === 0n
  ) {
    providedValue = l2Costs
    if (isETHBaseToken) parameters.overrides!.value = providedValue
  }

  await checkBaseCost({ baseCost, value: providedValue })

  const requestL2TxDirectParams = {
    l2ChainId: parameters.l2ChainId,
    mintValue: providedValue,
    l2Contract: parameters.contractAddress,
    l2Value: parameters.l2Value,
    l2Calldata: parameters.calldata,
    l2GasLimit: parameters.l2GasLimit,
    l2GasPerPubdataByteLimit: REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT,
    factoryDeps: parameters.overrides!.factoryDeps || [],
    refundRecipient: parameters.refundRecipient,
  }

  const data = encodeFunctionData({
    abi: bridgehubAbi,
    functionName: 'requestL2TransactionDirect',
    args: [
      {
        chainId: requestL2TxDirectParams.l2ChainId,
        mintValue: requestL2TxDirectParams.mintValue,
        l2Contract: requestL2TxDirectParams.l2Contract,
        l2Value: requestL2TxDirectParams.l2Value,
        l2Calldata: requestL2TxDirectParams.l2Calldata,
        l2GasLimit: requestL2TxDirectParams.l2GasLimit,
        l2GasPerPubdataByteLimit:
          requestL2TxDirectParams.l2GasPerPubdataByteLimit,
        factoryDeps: requestL2TxDirectParams.factoryDeps,
        refundRecipient: requestL2TxDirectParams.refundRecipient,
      },
    ],
  })

  return {
    maxFeePerGas: parameters.overrides!.maxFeePerGas!,
    maxPriorityFeePerGas: parameters.overrides!.maxPriorityFeePerGas!,
    value: parameters.mintValue,
    to: parameters.bridgehubContractAddress,
    data: data,
  }
}
