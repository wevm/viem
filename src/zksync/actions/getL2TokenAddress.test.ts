import { expect, test } from 'vitest'
import { daiL1 } from '../../../test/src/zksync.js'
import { http, createClient } from '../../index.js'
import {
  zksyncLocalCustomHyperchain,
  zksyncLocalHyperchain,
} from '../chains.js'
import { l2BaseTokenAddress, legacyEthAddress } from '../constants/address.js'
import { getBaseTokenL1Address } from './getBaseTokenL1Address.js'
import { getL2TokenAddress } from './getL2TokenAddress.js'

const client = createClient({
  chain: zksyncLocalHyperchain,
  transport: http(),
})

const customChainClient = createClient({
  chain: zksyncLocalCustomHyperchain,
  transport: http(),
})

test('ETH: provided token address is L1 base token address', async () => {
  const l1BaseToken = await getBaseTokenL1Address(client)

  expect(await getL2TokenAddress(client, { token: l1BaseToken })).toBe(
    l2BaseTokenAddress,
  )
})

test('ETH: provided token address is L1 ETH address', async () => {
  expect(
    await getL2TokenAddress(client, { token: legacyEthAddress }),
  ).toBeDefined()
})

test('ETH: provided token address is L1 DAI address', async () => {
  expect(await getL2TokenAddress(client, { token: daiL1 })).toBeDefined()
})

test('Custom: provided token address is L1 base token address', async () => {
  const l1BaseToken = await getBaseTokenL1Address(customChainClient)

  expect(
    await getL2TokenAddress(customChainClient, { token: l1BaseToken }),
  ).toBe(l2BaseTokenAddress)
})

test('Custom: provided token address is L1 DAI address', async () => {
  expect(
    await getL2TokenAddress(customChainClient, { token: daiL1 }),
  ).toBeDefined()
})
