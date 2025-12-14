import { expect, test } from 'vitest'

import { anvilZksync } from '~test/anvil.js'
import { mockRequestReturnData } from '~test/zksync.js'
import type { EIP1193RequestFn } from '../../index.js'
import { legacyEthAddress } from '../../zksync/index.js'
import { walletActionsL2 } from './walletL2.js'

const baseClient = anvilZksync.getClient({
  account: true,
  batch: { multicall: false },
})
baseClient.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_sendTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'eth_getTransactionCount') return 1n
  if (method === 'eth_getBlockByNumber') return anvilZksync.forkBlockNumber
  if (method === 'eth_gasPrice') return 200_000_000_000n
  if (method === 'eth_chainId') return anvilZksync.chain.id
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn
const client = baseClient.extend(walletActionsL2())

test('withdraw', async () => {
  expect(
    await client.withdraw({
      amount: 7_000_000_000n,
      token: legacyEthAddress,
    }),
  ).toBeDefined()
})
