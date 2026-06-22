import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { expect, test } from 'vitest'

import { getCode } from './getCode.js'

const client = anvil.getClient(anvil.mainnet)

const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})

test('default', async () => {
  expect(
    await getCode(client, {
      address: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeUndefined()
  expect(await getCode(client, { address })).toMatch(/^0x60/)
})

test('args: blockNumber', async () => {
  expect(
    await getCode(client, {
      address,
      blockNumber,
    }),
  ).toBeDefined()
})

test('args: blockHash (EIP-1898)', async () => {
  // TODO: replace with `getBlock` action when ported.
  const block = await client.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  })
  expect(
    await getCode(client, {
      address,
      blockHash: block!.hash!,
      requireCanonical: true,
    }),
  ).toBeDefined()
})
