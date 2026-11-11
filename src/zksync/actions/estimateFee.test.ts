import { expect, test } from 'vitest'
import { createRpcProxy } from '~test/utils.js'
import {
  mockClientPublicActionsL2,
  mockFeeValues,
  zksyncClientLocalNode,
  zksyncClientLocalNodeWithAccount,
} from '~test/zksync.js'
import { createClient, http } from '../../index.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zksyncClientLocalNode }

const clientWithAccount = { ...zksyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await estimateFee(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).toMatchInlineSnapshot(`
    {
      "gasLimit": 163901n,
      "gasPerPubdataLimit": 66n,
      "maxFeePerGas": 250000000n,
      "maxPriorityFeePerGas": 0n,
    }
  `)
})

mockClientPublicActionsL2(clientWithAccount)

test('default with account', async () => {
  const fee = await estimateFee(clientWithAccount, {
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).toMatchInlineSnapshot(`
    {
      "gasLimit": 163901n,
      "gasPerPubdataLimit": 66n,
      "maxFeePerGas": 250000000n,
      "maxPriorityFeePerGas": 0n,
    }
  `)
})

test('behavior: account null', async () => {
  const requests: unknown[] = []
  const url = await createRpcProxy('http://127.0.0.1:1', ({ params }) => {
    requests.push(params)
    return { result: mockFeeValues }
  })
  const client = createClient({
    account: zksyncClientLocalNodeWithAccount.account,
    chain: zksyncClientLocalNodeWithAccount.chain,
    transport: http(url),
  })

  await estimateFee(client, {
    account: null,
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(requests).toMatchInlineSnapshot(`
    [
      [
        {
          "to": "0x36615Cf349d7F6344891B1e7CA7C72883F5dc049",
          "value": "0x0",
        },
      ],
    ]
  `)
})
