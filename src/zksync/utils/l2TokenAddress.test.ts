import type { Address } from 'abitype'
import { erc20Abi } from 'abitype/abis'
import { afterAll, expect, test, vi } from 'vitest'
import { mockAddress, mockAddresses } from '~test/src/zksync.js'
import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { getL2TokenAddress } from './l2TokenAddress.js'

const tokenL2 = '0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0'

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(tokenL2)

afterAll(() => {
  spy.mockRestore()
})

test('default with decimals', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await getL2TokenAddress(client, {
      token: mockAddress,
      sharedL2: mockAddresses.l1SharedDefaultBridge as Address,
      baseTokenAddress: mockAddress,
    }),
  ).toBe(tokenL2)
})
