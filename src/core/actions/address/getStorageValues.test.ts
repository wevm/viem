import * as generated from '~contracts/generated.js'
import { Actions } from 'viem'
import * as anvil from '~test/anvil.js'
import * as contract from '~test/contract.js'
import { expect, test } from 'vitest'

const client = anvil.getClient(anvil.local)
const { address, blockNumber } = await contract.deploy(client, {
  bytecode: generated.Erc721.bytecode.object,
})
const slots = [`0x${'0'.repeat(64)}`, `0x${'0'.repeat(63)}1`] as const

for (const historical of [false, true]) {
  test(`storage slots at ${historical ? 'deployment block' : 'latest'}`, async () => {
    const values = await Actions.address.getStorageValues(client, {
      requests: { [address]: slots },
      ...(historical ? { blockNumber } : {}),
    })
    expect(values[address.toLowerCase() as typeof address]).toEqual([
      '0x7761676d6900000000000000000000000000000000000000000000000000000a',
      '0x5741474d4900000000000000000000000000000000000000000000000000000a',
    ])
  })
}

test('block hash', async () => {
  const block = await Actions.block.get(client, { blockNumber })
  const values = await Actions.address.getStorageValues(client, {
    requests: { [address]: [slots[0]] },
    blockHash: block.hash!,
    requireCanonical: true,
  })
  expect(values[address.toLowerCase() as typeof address]).toEqual([
    '0x7761676d6900000000000000000000000000000000000000000000000000000a',
  ])
})
