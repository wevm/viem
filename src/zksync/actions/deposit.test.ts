import { expect, test } from 'vitest'
import { anvilMainnet, anvilZksync } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import { mockRequestReturnData } from '~test/src/zksync.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { publicActions } from '~viem/clients/decorators/public.js'
import type { EIP1193RequestFn } from '~viem/types/eip1193.js'
import { legacyEthAddress } from '~viem/zksync/constants/address.js'
import { publicActionsL2 } from '~viem/zksync/decorators/publicL2.js'
import { deposit } from './deposit.js'

const request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_sendTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'eth_gasPrice') return 150_000_000n
  if (method === 'eth_maxPriorityFeePerGas') return 100_000_000n
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_getTransactionCount') return 1n
  if (method === 'eth_getBlockByNumber') return anvilMainnet.forkBlockNumber
  if (method === 'eth_chainId') return anvilMainnet.chain.id
  return anvilMainnet.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const baseClient = anvilMainnet.getClient({ batch: { multicall: false } })
baseClient.request = request
const client = baseClient.extend(publicActions)

const baseClientWithAccount = anvilMainnet.getClient({
  batch: { multicall: false },
  account: true,
})
baseClientWithAccount.request = request
const clientWithAccount = baseClientWithAccount.extend(publicActions)

const baseClientL2 = anvilZksync.getClient()
baseClientL2.request = (async ({ method, params }) => {
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_estimateGas') return 158774n
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn
const clientL2 = baseClientL2.extend(publicActionsL2())

test.skip('default', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    deposit(client, {
      client: clientL2,
      account,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).toBeDefined()
})

test('default: account hoisting', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    deposit(clientWithAccount, {
      client: clientL2,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).toBeDefined()
})

test('errors: no account provided', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  await expect(() =>
    deposit(client, {
      client: clientL2,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
  `)
})
