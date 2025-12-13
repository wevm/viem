import { expect, test } from 'vitest'
import { anvilZksync } from '~test/src/anvil.js'
import { mockRequestReturnData } from '~test/src/zksync.js'
import type { EIP1193RequestFn } from '../../../types/eip1193.js'
import { getWithdrawalL2ToL1Log } from './getWithdrawalL2ToL1Log.js'

const client = anvilZksync.getClient({ batch: { multicall: false } })
client.request = (async ({ method, params }) => {
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn

test('default', async () => {
  expect(
    await getWithdrawalL2ToL1Log(client, {
      hash: '0x15c295874fe9ad8f6708def4208119c68999f7a76ac6447c111e658ba6bfaa1e',
    }),
  ).toBeDefined()
})
