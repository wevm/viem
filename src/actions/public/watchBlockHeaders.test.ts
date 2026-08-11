import { expect, test, vi } from 'vitest'

import { anvilMainnet } from '~test/anvil.js'
import { createClient } from '../../clients/createClient.js'
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
