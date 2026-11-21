import { expectTypeOf, test } from 'vitest'

import { mainnet, zksync } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import { webSocket } from '../../clients/transports/webSocket.js'
import { watchBlockHeaders } from './watchBlockHeaders.js'

const client = createPublicClient({
  chain: mainnet,
  transport: webSocket(),
})
const httpClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const zksyncClient = createPublicClient({
  chain: zksync,
  transport: webSocket(),
})

test('block header', () => {
  client.watchBlockHeaders({
    onBlockHeader(blockHeader) {
      expectTypeOf(blockHeader.timestamp).toEqualTypeOf<bigint>()
      // @ts-expect-error Block headers omit full block fields.
      blockHeader.size
      // @ts-expect-error Block headers omit full block fields.
      blockHeader.transactions
    },
  })
})

test('requires a subscription transport', () => {
  // @ts-expect-error Block headers require a WebSocket or IPC transport.
  watchBlockHeaders(httpClient, { onBlockHeader() {} })
  // @ts-expect-error Block headers require a WebSocket or IPC transport.
  httpClient.watchBlockHeaders({ onBlockHeader() {} })
})

test('preserves chain formatter fields', () => {
  zksyncClient.watchBlockHeaders({
    onBlockHeader(blockHeader) {
      expectTypeOf(blockHeader.l1BatchNumber).toEqualTypeOf<bigint | null>()
    },
  })
})
