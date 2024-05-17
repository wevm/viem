import { afterAll, expect, test, vi } from 'vitest'
import * as readContract from '../../actions/public/readContract.js'
import { sepolia } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { bridgehubAbi } from '../constants/abis.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { sharedBridge } from './sharedBridge.js'

const spy = vi
  .spyOn(readContract, 'readContract')
  .mockResolvedValue('0xA5b795d453CA0FBD599EC28Dd88d020E06048619')

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
  }).extend(publicActionsL1())

  expect(
    await sharedBridge(client, {
      bridgehubContractAddress: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    }),
  ).toBe('0xA5b795d453CA0FBD599EC28Dd88d020E06048619')

  expect(spy).toHaveBeenCalledWith(client, {
    abi: bridgehubAbi,
    address: '0x8E5937cE49C72264a2318163Aa96F9F973A83192',
    args: [],
    functionName: 'sharedBridge',
  })
})
