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
  // slot 0 = `name` ("wagmi"), slot 1 = `symbol` ("WAGMI").
  expect(
    await Actions.address.getStorageAt(client, { address, slot: '0x0' }),
  ).toMatchInlineSnapshot(
    `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
  )
  expect(
    await Actions.address.getStorageAt(client, { address, slot: '0x1' }),
  ).toMatchInlineSnapshot(
    `"0x5741474d4900000000000000000000000000000000000000000000000000000a"`,
  )
})

test('args: blockNumber', async () => {
  expect(
    await Actions.address.getStorageAt(client, {
      address,
      slot: '0x0',
      blockNumber,
    }),
  ).toMatchInlineSnapshot(
    `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
  )
})

test('args: blockHash (EIP-1898)', async () => {
  const block = await Actions.block.get(client, { blockTag: 'latest' })
  expect(
    await Actions.address.getStorageAt(client, {
      address,
      slot: '0x0',
      blockHash: block.hash!,
    }),
  ).toMatchInlineSnapshot(
    `"0x7761676d6900000000000000000000000000000000000000000000000000000a"`,
  )
})
