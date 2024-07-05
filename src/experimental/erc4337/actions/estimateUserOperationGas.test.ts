import { expect, test } from 'vitest'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { getSmartAccounts_07 } from '../../../../test/src/smartAccounts.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const bundlerClient = bundlerMainnet.getBundlerClient()

const [account] = await getSmartAccounts_07()

test('default', async () => {
  expect(
    await estimateUserOperationGas(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).toMatchInlineSnapshot(`
    {
      "callGasLimit": 80000n,
      "paymasterPostOpGasLimit": 0n,
      "paymasterVerificationGasLimit": 0n,
      "preVerificationGas": 51642n,
      "verificationGasLimit": 259060n,
    }
  `)
})

test('error: account not defined', async () => {
  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      // @ts-expect-error
      account: undefined,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the WalletClient.

    Version: viem@x.y.z]
  `)
})
