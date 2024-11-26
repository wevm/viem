import { expect, test } from 'vitest'
import { anvilMainnet, anvilSepolia } from '../../../test/src/anvil.js'
import { base, optimismSepolia } from '../../op-stack/chains.js'
import { getL2Output } from './getL2Output.js'

const client = anvilMainnet.getClient()
const sepoliaClient = anvilSepolia.getClient()

test('default', async () => {
  const output = await getL2Output(client, {
    l2BlockNumber: 2725977n,
    targetChain: base,
  })
  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 2727000n,
      "outputIndex": 1514n,
      "outputRoot": "0xff22d9720c41431eb398a07c5b315199f8f0dc6a07643e4e43a20b910f12f2f2",
      "timestamp": 1692244499n,
    }
  `)
})

// TODO(fault-proofs): use anvil client when fault proofs deployed to mainnet.
test('portal v3', async () => {
  const game = await getL2Output(sepoliaClient, {
    targetChain: optimismSepolia,
    l2BlockNumber: 9510398n,
    limit: 10,
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('outputIndex')
  expect(game).toHaveProperty('outputRoot')
  expect(game).toHaveProperty('timestamp')
})
