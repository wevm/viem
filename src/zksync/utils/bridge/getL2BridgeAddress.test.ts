import { afterAll, expect, test, vi } from 'vitest'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import * as readContract from '../../../actions/public/readContract.js'
import { sepolia } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { l1BridgeFactoryAbi } from '../../constants/abis.js'
import { publicActionsL1 } from '../../decorators/publicL1.js'
import { getL2BridgeAddress } from './getL2BridgeAddress.js'

const sourceAccount = accounts[0]
const bridgehubAddress = '0xA5b795d453CA0FBD599EC28Dd88d020E06048619'

const account = privateKeyToAccount(sourceAccount.privateKey)
let spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(100n)

  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  }).extend(publicActionsL1())

  expect(
    await getL2BridgeAddress(client, { bridgeAddress: bridgehubAddress }),
  ).toBe(100n)

  expect(spy).toHaveBeenCalledWith(client, {
    abi: l1BridgeFactoryAbi,
    address: bridgehubAddress,
    args: [BigInt(client.chain.id)],
    functionName: 'l2BridgeAddress',
  })
})
