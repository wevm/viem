import { expect, test } from 'vitest'
import { anvilMainnet, anvilZksync } from '~test/src/anvil.js'
import { accounts } from '~test/src/constants.js'
import {
  mockFailedDepositReceipt,
  mockFailedDepositTransaction,
  mockLogProof,
  mockRequestReturnData,
} from '~test/src/zksync.js'
import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { type EIP1193RequestFn, publicActions } from '~viem/index.js'
import { claimFailedDeposit } from '~viem/zksync/actions/claimFailedDeposit.js'
import { publicActionsL2 } from '~viem/zksync/index.js'

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
  if (method === 'eth_getTransactionReceipt') return mockFailedDepositReceipt
  if (method === 'eth_getTransactionByHash') return mockFailedDepositTransaction
  if (method === 'zks_getL2ToL1LogProof') return mockLogProof
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
    claimFailedDeposit(client, {
      client: clientL2,
      account,
      depositHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
    }),
  ).toBeDefined()
})

test('default: account hoisting', async () => {
  expect(
    claimFailedDeposit(clientWithAccount, {
      client: clientL2,
      depositHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
    }),
  ).toBeDefined()
})

test('errors: no account provided', async () => {
  await expect(() =>
    claimFailedDeposit(client, {
      client: clientL2,
      depositHash:
        '0x5b08ec4c7ebb02c07a3f08bc5677aec87c47200f685f6389969a3c084bee13dc',
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
  `)
})
