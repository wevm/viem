import { afterAll, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { http, createClient, parseUnits } from '../../index.js'
import { bridgehubAbi } from '../constants/abis.js'
import { REQUIRED_L2_GAS_PRICE_PER_PUBDATA } from '../constants/number.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import {
  type L2TransactionRequestTwoBridgesParameters,
  requestL2TransactionTwoBridges,
} from './requestL2TransactionTwoBridges.js'

const sourceAccount = accounts[0]
const account = privateKeyToAccount(sourceAccount.privateKey)
const mockedResolvedValue =
  '0x5254a0e1d200d0900920b9bc810caf2d26814426db0719da05a1b14bc3e4032d'
const spy = vi
  .spyOn(readContract, 'readContract')
  .mockResolvedValue(mockedResolvedValue)

afterAll(() => {
  spy.mockRestore()
})

test('default with account hoisting and token', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  }).extend(publicActionsL1())

  const accountAddress = account.address

  const parameters: L2TransactionRequestTwoBridgesParameters = {
    bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    mintValue: parseUnits('800', 18),
    l2Value: 1n,
    l2GasLimit: 10000000n,
    l2GasPerPubdataByteLimit: BigInt(REQUIRED_L2_GAS_PRICE_PER_PUBDATA),
    refundRecipient: accountAddress,
    secondBridgeAddress: accountAddress,
    secondBridgeValue: 0n,
    secondBridgeCalldata: '0x',
    l2ChainId: BigInt(client.chain.id),
  }

  expect(await requestL2TransactionTwoBridges(client, parameters)).toBe(
    mockedResolvedValue,
  )

  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: parameters.bridgehubContractAddress,
    functionName: 'requestL2TransactionTwoBridges',
    args: [
      {
        chainId: BigInt(client.chain.id),
        l2GasLimit: parameters.l2GasLimit,
        l2GasPerPubdataByteLimit: parameters.l2GasPerPubdataByteLimit,
        l2Value: parameters.l2Value,
        mintValue: parameters.mintValue,
        refundRecipient: parameters.refundRecipient,
        secondBridgeAddress: accountAddress,
        secondBridgeValue: 0n,
        secondBridgeCalldata: '0x',
      },
    ],
  })
})
