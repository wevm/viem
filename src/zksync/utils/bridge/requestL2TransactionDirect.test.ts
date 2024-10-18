import { afterAll, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'

import { parseUnits } from 'ethers'
import * as readContract from '../../../actions/public/readContract.js'
import { sepolia } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { bridgehubAbi } from '../../constants/abis.js'
import { requiredL2GasPricePerPubdata } from '../../constants/number.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import {
  type L2TransactionRequestDirectParameters,
  requestL2TransactionDirect,
} from './requestL2TransactionDirect.js'

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

  const parameters: L2TransactionRequestDirectParameters = {
    bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    mintValue: parseUnits('800', 18),
    l2Contract: accountAddress,
    l2Value: 1n,
    l2Calldata: '0x',
    l2GasLimit: 10000000n,
    l2GasPerPubdataByteLimit: BigInt(requiredL2GasPricePerPubdata),
    factoryDeps: [],
    refundRecipient: accountAddress,
    l2ChainId: BigInt(client.chain.id),
  }

  expect(await requestL2TransactionDirect(client, parameters)).toBe(
    mockedResolvedValue,
  )

  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: parameters.bridgehubContractAddress,
    functionName: 'requestL2TransactionDirect',
    args: [
      {
        chainId: BigInt(client.chain.id),
        factoryDeps: parameters.factoryDeps,
        l2Calldata: parameters.l2Calldata,
        l2Contract: parameters.l2Contract,
        l2GasLimit: parameters.l2GasLimit,
        l2GasPerPubdataByteLimit: parameters.l2GasPerPubdataByteLimit,
        l2Value: parameters.l2Value,
        mintValue: parameters.mintValue,
        refundRecipient: parameters.refundRecipient,
      },
    ],
  })
})
