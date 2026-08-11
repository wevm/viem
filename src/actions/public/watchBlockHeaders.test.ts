import { expect, test, vi } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { createClient } from '../../clients/createClient.js'
import {
  createTransport,
  type Transport,
} from '../../clients/transports/createTransport.js'
import { webSocket } from '../../clients/transports/webSocket.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import * as getBlock from './getBlock.js'
import {
  type OnBlockHeaderParameter,
  watchBlockHeaders,
} from './watchBlockHeaders.js'

const client = anvilMainnet.getClient()
const webSocketClient = createClient({
  ...anvilMainnet.clientConfig,
  transport: webSocket(),
})

test('watches for new block headers without fetching blocks', async () => {
  const blockHeaders: OnBlockHeaderParameter[] = []
  const prevBlockHeaders: OnBlockHeaderParameter[] = []
  const getBlock_ = vi.spyOn(getBlock, 'getBlock')
  const unwatch = watchBlockHeaders(webSocketClient, {
    onBlockHeader(blockHeader, prevBlockHeader) {
      blockHeaders.push(blockHeader)
      if (prevBlockHeader) prevBlockHeaders.push(prevBlockHeader)
    },
  })
  await wait(200)
  await mine(client, { blocks: 1 })
  await wait(200)
  await mine(client, { blocks: 1 })
  await wait(200)
  unwatch()

  expect(blockHeaders).toHaveLength(2)
  expect(prevBlockHeaders).toHaveLength(1)
  expect(typeof blockHeaders[0].number).toBe('bigint')
  expect(typeof blockHeaders[0].timestamp).toBe('bigint')
  expect(blockHeaders[0]).not.toHaveProperty('transactions')
  expect(blockHeaders[0]).not.toHaveProperty('withdrawals')
  expect(getBlock_).not.toHaveBeenCalled()
  getBlock_.mockRestore()
})

test('reports subscription setup failures once', async () => {
  const error = new Error('subscription failed')
  const onError = vi.fn()
  const subscribe = vi.fn(
    async ({ onError }: { onError(error: Error): void }) => {
      onError(error)
      throw error
    },
  )
  const transport: Transport<
    'webSocket',
    { subscribe: typeof subscribe }
  > = () =>
    createTransport(
      {
        key: 'webSocket',
        name: 'Mock WebSocket Transport',
        request: vi.fn(async () => null) as never,
        type: 'webSocket',
      },
      { subscribe },
    )
  const client = createClient({ transport })

  watchBlockHeaders(client, { onBlockHeader() {}, onError })
  await wait(0)

  expect(onError).toHaveBeenCalledOnce()
  expect(onError).toHaveBeenCalledWith(error)
})
