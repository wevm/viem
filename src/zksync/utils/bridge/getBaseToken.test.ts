import { afterAll, expect, test, vi } from 'vitest'
import * as readContract from '../../../actions/public/readContract.js'
import { sepolia } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { bridgehubAbi } from '../../constants/abis.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { getBaseToken } from './getBaseToken.js'

const bridgehubContractAddress = '0x05b30BE4e32E6dD6eEe2171E0746e987BeCc9b36'

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
    await getBaseToken(client, {
      bridgehubContractAddress,
      l2ChainId: BigInt(client.chain.id),
    }),
  ).toBe(100n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: bridgehubContractAddress,
    args: [BigInt(client.chain.id)],
    functionName: 'baseToken',
  })
})
