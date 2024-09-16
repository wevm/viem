import { afterAll, expect, test, vi } from 'vitest'
import * as readContract from '../../../actions/public/readContract.js'
import { sepolia } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { bridgehubAbi } from '../../constants/abis.js'
import { requiredL2GasPricePerPubdata } from '../../constants/number.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import type { Overrides } from '../../types/deposit.js'
import { getL2TransactionBaseCost } from './getL2TransactionBaseCost.js'

const bridgehubContractAddress = '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36'
const depositL2GasLimit = 10000000n
const gasPriceForEstimation = 100000000000n

let spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getL2TransactionBaseCost(client, {
      overrides: { maxFeePerGas: gasPriceForEstimation } as Overrides,
      l2GasLimit: depositL2GasLimit,
      gasPerPubdataByte: BigInt(requiredL2GasPricePerPubdata),
      bridgehubContractAddress,
      l2ChainId: BigInt(client.chain.id),
    }),
  ).toBe(100n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: bridgehubContractAddress,
    args: [
      BigInt(client.chain.id),
      gasPriceForEstimation,
      depositL2GasLimit,
      BigInt(requiredL2GasPricePerPubdata),
    ],
    functionName: 'l2TransactionBaseCost',
  })
})
