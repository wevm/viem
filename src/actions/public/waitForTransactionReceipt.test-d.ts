import { createPublicClient, http } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { test } from 'vitest'

import { mainnet } from '../../chains/index.js'

const client = createPublicClient({ chain: mainnet, transport: http() })

const from = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const hash =
  '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'

test('args: replacement', () => {
  waitForTransactionReceipt(client, {
    hash,
    replacement: { from, nonce: 0 },
  })
  waitForTransactionReceipt(client, {
    hash,
    replacement: { from, input: '0x', nonce: 0, to: null, value: 0n },
  })

  // @ts-expect-error `nonce` is required.
  waitForTransactionReceipt(client, { hash, replacement: { from } })

  waitForTransactionReceipt(client, {
    hash,
    // @ts-expect-error `nonceKey` is not a field of `replacement`.
    replacement: { from, nonce: 0, nonceKey: 1n },
  })
})
