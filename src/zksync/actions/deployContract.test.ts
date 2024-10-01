import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'

import { deployContract } from './deployContract.js'

import { anvilZksync } from '../../../test/src/anvil.js'
import type { EIP1193RequestFn } from '../../index.js'
import type { DeployContractParameters } from './deployContract.js'

const sourceAccount = accounts[0]

const client = anvilZksync.getClient()

client.request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  return anvilZksync.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const base: DeployContractParameters = {
  account: privateKeyToAccount(sourceAccount.privateKey),
  chain: client.chain,
  abi: [],
  bytecode:
    '0x00050000000000020000008003000039000000400030043f0000000003010019',
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

test('args: factoryDeps', async () => {
  expect(
    await deployContract(client, {
      ...base,
      factoryDeps: [
        '0x702040405260405161083e38038061083e833981016040819123456abdcabcd',
        '0x102030405260405161083e38038061083e833981016040819112233abdcabcd',
      ],
    }),
  ).toMatchInlineSnapshot(
    `"0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87"`,
  )
})
