import { createClient, http } from 'viem'
import { expect, test } from 'vitest'
import { createRpcProxy } from '~test/utils.js'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
  zksyncClientLocalNodeWithAccount,
} from '~test/zksync.js'
import { estimateGasL1ToL2 } from './estimateGasL1ToL2.js'

const client = { ...zksyncClientLocalNode }

const clientWithAccount = { ...zksyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)
mockClientPublicActionsL2(clientWithAccount)

test('default with account', async () => {
  const value = await estimateGasL1ToL2(clientWithAccount, {
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })
  expect(value > 0).to.be.true
})

test('default without account', async () => {
  const value = await estimateGasL1ToL2(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })
  expect(value > 0).to.be.true
})

test('behavior: account null', async () => {
  const requests: unknown[] = []
  const url = await createRpcProxy('http://127.0.0.1:1', ({ params }) => {
    requests.push(params)
    return { result: '0x75bcd15' }
  })
  const client = createClient({
    account: zksyncClientLocalNodeWithAccount.account,
    chain: zksyncClientLocalNodeWithAccount.chain,
    transport: http(url),
  })

  await estimateGasL1ToL2(client, {
    account: null,
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })

  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "to": "0xa61464658AfeAf65CccaaFD3a512b69A83B77618",
          "value": "0x46",
        },
      ],
    ]
  `)
})
