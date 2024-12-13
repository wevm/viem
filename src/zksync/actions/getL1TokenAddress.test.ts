import { expect, test } from 'vitest'
import { daiL1 } from '~test/src/zksync.js'
import { http, createClient } from '../../index.js'
import {
  zksyncLocalCustomHyperchain,
  zksyncLocalHyperchain,
} from '../chains.js'
import { legacyEthAddress } from '../constants/address.js'
import { getL1TokenAddress } from './getL1TokenAddress.js'
import { getL2TokenAddress } from './getL2TokenAddress.js'

const client = createClient({
  chain: zksyncLocalHyperchain,
  transport: http(),
})

const customChainClient = createClient({
  chain: zksyncLocalCustomHyperchain,
  transport: http(),
})

test('ETH: provided token address is L2 ETH address', async () => {
  expect(await getL1TokenAddress(client, { token: legacyEthAddress })).toBe(
    legacyEthAddress,
  )
})

test('ETH: provided token address is L1 DAI address', async () => {
  const daiL2 = await getL2TokenAddress(client, { token: daiL1 })
  expect(await getL1TokenAddress(client, { token: daiL2 })).toBe(daiL1)
})

test('Custom: provided token address is L2 ETH address', async () => {
  expect(await getL1TokenAddress(client, { token: legacyEthAddress })).toBe(
    legacyEthAddress,
  )
})

test('Custom: provided token address is L1 DAI address', async () => {
  const daiL2 = await getL2TokenAddress(customChainClient, { token: daiL1 })
  expect(await getL1TokenAddress(customChainClient, { token: daiL2 })).toBe(
    daiL1,
  )
})
