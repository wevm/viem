import { bench } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getLogs } from '../../actions/public/getLogs.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { parseEventLogs } from './parseEventLogs.js'

const client = createClient({
  chain: mainnet,
  transport: http(),
})

const abi = [
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
  },
  {
    inputs: [
      {
        indexed: true,
        name: 'message',
        type: 'string',
      },
    ],
    name: 'Foo',
    type: 'event',
  },
] as const

const logs = await getLogs(client, {
  fromBlock: anvilMainnet.forkBlockNumber - 5n,
  toBlock: anvilMainnet.forkBlockNumber,
})

bench('parseEventLogs', async () => {
  parseEventLogs({
    abi,
    logs,
  })
})
