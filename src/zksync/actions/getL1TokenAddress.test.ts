import { expect, test } from 'vitest'
import { anvilZksync } from '~test/src/anvil.js'
import { mockAddresses } from '~test/src/zksync.js'
import { publicActionsL2 } from '~viem/zksync/decorators/publicL2.js'
import { type EIP1193RequestFn, padHex } from '../../index.js'
import { legacyEthAddress } from '../constants/address.js'
import { getL1TokenAddress } from './getL1TokenAddress.js'

const daiL1 = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
const daiL2 = '0xFC073319977e314F251EAE6ae6bE76B0B3BAeeCF'

const client = anvilZksync.getClient().extend(publicActionsL2())

client.request = (async ({ method, params }) => {
  if (method === 'eth_call') return padHex(daiL1)
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'zks_getBridgeContracts') return mockAddresses
  return anvilZksync.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  expect(await getL1TokenAddress(client, { token: daiL2 })).toBe(daiL1)
})

test('args: legacyEthAddress', async () => {
  expect(
    await getL1TokenAddress(client, { token: legacyEthAddress }),
  ).toBeDefined()
})
