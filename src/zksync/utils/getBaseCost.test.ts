import { expect, test, vi } from 'vitest'
import {
  mockClientPublicActionsL2,
  mockDepositTransactionExtended,
  zkSyncClientLocalNodeWithAccountL1,
} from '../../../test/src/zksync.js'
import * as readContract from '../../actions/public/readContract.js'
import { bridgehubAbi } from '../constants/abis.js'
import { REQUIRED_L2_GAS_PRICE_PER_PUBDATA } from '../constants/number.js'
import { getBaseCost } from './getBaseCost.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

test('default', async () => {
  const baseCost = await getBaseCost(client, mockDepositTransactionExtended)
  expect(baseCost).toBe(100n)
  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: mockDepositTransactionExtended.bridgehubContractAddress,
    args: [
      mockDepositTransactionExtended.l2ChainId,
      mockDepositTransactionExtended.overrides?.maxFeePerGas,
      mockDepositTransactionExtended.l2GasLimit!,
      BigInt(REQUIRED_L2_GAS_PRICE_PER_PUBDATA),
    ],
    functionName: 'l2TransactionBaseCost',
  })
})
