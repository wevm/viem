import { expectTypeOf, test } from 'vitest'

import { Actions, Client, publicActions, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = Client.create({
  chain: mainnet,
  transport: webSocket(),
})

test('block header', () => {
  const watch = Actions.block.watchHeaders(client)
  watch.onBlockHeader((blockHeader, prevBlockHeader) => {
    expectTypeOf(blockHeader.timestamp).toEqualTypeOf<bigint>()
    expectTypeOf(prevBlockHeader).toEqualTypeOf<
      Actions.block.watchHeaders.BlockHeader<typeof mainnet> | undefined
    >()
    expectTypeOf(blockHeader).not.toHaveProperty('size')
    expectTypeOf(blockHeader).not.toHaveProperty('transactions')
  })
})

test('decorated action', () => {
  const decorated = client.extend(publicActions())
  expectTypeOf(decorated.block.watchHeaders()).toEqualTypeOf<
    Actions.block.watchHeaders.Watcher<typeof mainnet>
  >()
})
