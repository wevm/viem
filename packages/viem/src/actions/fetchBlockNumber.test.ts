import { expect, test } from 'vitest'

import { local } from '../chains'
import { jsonRpcProvider } from '../providers/network/jsonRpcProvider'

import { fetchBlockNumber } from './fetchBlockNumber'

test('fetches block number', async () => {
  const provider = jsonRpcProvider({
    chains: [local],
    url: local.rpcUrls.public,
  })
  expect(await fetchBlockNumber(provider)).toMatchInlineSnapshot('15132000n')
})
