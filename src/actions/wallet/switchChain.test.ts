import { expect, test } from 'vitest'

import { walletClient } from '../../_test'
import { avalanche, fantom } from '../../chains'

import { switchChain } from './switchChain'

test('default', async () => {
  await switchChain(walletClient!, avalanche)
})

test('unsupported chain', async () => {
  await expect(
    switchChain(walletClient!, fantom),
  ).rejects.toMatchInlineSnapshot(`
    [UnknownRpcError: An unknown RPC error occurred.

    Details: Unrecognized chain.
    Version: viem@1.0.2]
  `)
})
