import * as generated from '~contracts/generated.js'
import { Actions } from 'viem'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { expect, test } from 'vitest'

const client = anvil.getClient(anvil.mainnet)

const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})

test('default', async () => {
  expect(
    await Actions.address.getCode(client, {
      address: '0x0000000000000000000000000000000000000000',
    }),
  ).toBeUndefined()
  expect(await Actions.address.getCode(client, { address })).toMatch(/^0x60/)
})

test('args: blockNumber', async () => {
  expect(
    await Actions.address.getCode(client, {
      address,
      blockNumber,
    }),
  ).toBeDefined()
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(
    await Actions.address.getCode(client, {
      address,
      blockHash: block.hash!,
      requireCanonical: true,
    }),
  ).toBeDefined()
})
