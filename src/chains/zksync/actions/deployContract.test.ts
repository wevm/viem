import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { zkSyncClient } from '~test/src/zksync.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'

import { deployContract } from './deployContract.js'

import type { EIP1193RequestFn } from '../../../index.js'
import type { DeployContractParametersExtended } from './deployContract.js'

const sourceAccount = accounts[0]

const client = { ...zkSyncClient }

client.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  return zkSyncClient.request({ method, params } as any)
}) as EIP1193RequestFn

const base: DeployContractParametersExtended = {
  account: privateKeyToAccount(sourceAccount.privateKey),
  chain: zkSyncClient.chain,
  abi: [],
  bytecode:
    '0x00050000000000020000008003000039000000400030043f0000000003010019',
  factoryDeps: [],
}

test('default', async () => {
  expect(
    await deployContract(client, {
      ...base,
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})
