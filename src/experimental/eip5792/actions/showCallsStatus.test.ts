import { test } from 'vitest'
import { createClient } from '../../../clients/createClient.js'
import { custom } from '../../../clients/transports/custom.js'
import { showCallsStatus } from './showCallsStatus.js'

const client = createClient({
  transport: custom({
    async request() {
      return null
    },
  }),
})

test('default', async () => {
  await showCallsStatus(client, {
    id: '0xdeadbeef',
  })
})
