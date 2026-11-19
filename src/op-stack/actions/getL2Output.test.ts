import { expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { reset } from '../../actions/index.js'
import { optimism } from '../../op-stack/chains.js'
import { getL2Output } from './getL2Output.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  await reset(client, {
    blockNumber: 21911472n,
  })
  const game = await getL2Output(client, {
    targetChain: optimism,
    l2BlockNumber: 132300000n,
    limit: 10,
  })
  expect(game).toHaveProperty('l2BlockNumber')
  expect(game).toHaveProperty('outputIndex')
  expect(game).toHaveProperty('outputRoot')
  expect(game).toHaveProperty('timestamp')
})

test('args: l2OutputOracleAddress', async () => {
  await reset(client, {
    blockNumber: 18772363n,
  })

  const output = await getL2Output(client, {
    l2BlockNumber: 113000000n,
    l2OutputOracleAddress: '0xdfe97868233d1aa22e815a266982f2cf17685a27',
  })

  expect(output).toMatchInlineSnapshot(`
    {
      "l2BlockNumber": 113000263n,
      "outputIndex": 4313n,
      "outputRoot": "0xebc9200f1ae2796e6515241a9e845d39c4aa40d37b9eeb985a9c2a20ae3b98fc",
      "timestamp": 1701600695n,
    }
  `)
})
