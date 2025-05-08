import { expect, test } from 'vitest'

import { anvilZksync } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import { mockRequestReturnData } from '~test/src/zksync.js'
import { privateKeyToAccount } from '~zkr-viem/accounts/privateKeyToAccount.js'
import type { EIP1193RequestFn } from '~zkr-viem/index.js'
import { legacyEthAddress, publicActionsL2 } from '~zkr-viem/zksync/index.js'
import { withdraw } from './withdraw.js'

const request = (async ({ method, params }) => {
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

const baseClient = anvilZksync.getClient({ batch: { multicall: false } })
baseClient.request = request
const client = baseClient.extend(publicActionsL2())

const baseClientWithAccount = anvilZksync.getClient({
  account: true,
  batch: { multicall: false },
})
baseClientWithAccount.request = request
const clientWithAccount = baseClientWithAccount.extend(publicActionsL2())

test.skip('default', async () => {
  expect(
    await withdraw(client, {
      account: privateKeyToAccount(accounts[0].privateKey),
      amount: 7_000_000_000n,
      token: legacyEthAddress,
    }),
  ).toBeDefined()
})

test('default: account hoisting', async () => {
  expect(
    await withdraw(clientWithAccount, {
      amount: 7_000_000_000n,
      token: legacyEthAddress,
    }),
  ).toBeDefined()
})

test('errors: no account provided', async () => {
  await expect(() =>
    withdraw(client, {
      amount: 7_000_000_000n,
      token: legacyEthAddress,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
  `)
})
