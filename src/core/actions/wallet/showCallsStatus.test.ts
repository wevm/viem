import { Provider } from 'ox'
import { test } from 'vitest'
import { Client, custom } from 'viem'
import { showCallsStatus } from './showCallsStatus.js'

const client = Client.create({
  transport: custom(
    Provider.from({
      async request({ method }) {
        if (method === 'wallet_showCallsStatus') return undefined
        return null
      },
    }),
  ),
})

test('default', async () => {
  await showCallsStatus(client, { id: '0xdeadbeef' })
})
