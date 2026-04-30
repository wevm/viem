import { expect, test } from 'vitest'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { createEventFilter } from './createEventFilter.js'

test('creates filters for anonymous events without a signature topic', async () => {
  const requests: Parameters<EIP1193RequestFn>[0][] = []
  const client = createPublicClient({
    transport: custom({
      request: async (request) => {
        requests.push(request)
        return '0x1'
      },
    }),
  })

  const event = {
    anonymous: true,
    inputs: [
      {
        indexed: true,
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'AnonymousTransfer',
    type: 'event',
  } as const

  const filter = await createEventFilter(client, {
    event,
    args: {
      sender: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    },
  })

  expect(filter.id).toBe('0x1')
  expect(requests).toEqual([
    {
      method: 'eth_newFilter',
      params: [
        {
          topics: [
            '0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266',
          ],
        },
      ],
    },
  ])
})
